import { JWT } from 'google-auth-library'

/**
 * Google Sheets access.
 *
 * Credentials are read from non-`NEXT_PUBLIC_` environment variables and this module
 * pulls in `google-auth-library`, so it cannot be bundled into a client component —
 * every call arrives here from a server action or a server component.
 *
 * This deliberately talks to the Sheets REST API over `fetch` rather than pulling in
 * the full `googleapis` package, which is two orders of magnitude larger for the four
 * calls we actually make.
 */

const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets'
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

export const VOTES_TAB = 'Votes'
export const ATTENDEES_TAB = 'Attendees'

/**
 * Votes!A:H — one row per member, in masterlist order.
 *
 * `Palette` is kept although the batch no longer votes on one: five ballots were
 * cast while it did, and dropping the column would slide their answers one cell
 * left. It stays, holding those five answers, and new ballots write it blank.
 */
export const VOTE_HEADERS = [
  'Timestamp',
  'Name',
  'Track',
  'Date',
  'Venue',
  'Food',
  'Palette',
  'Attending',
] as const

/**
 * The workbook's own timezone, read off its settings.
 *
 * A ballot cast at 9pm in Cebu belongs to that day, not to the next one UTC has
 * already started — so the serial below is built from the wall clock here, not from
 * the raw instant.
 */
export const SHEET_TIME_ZONE = 'Asia/Manila'

/** Sheets counts days from 1899-12-30, the epoch it inherited from Lotus 1-2-3. */
const SHEET_EPOCH_UTC = Date.UTC(1899, 11, 30)

/**
 * An instant as the serial number Sheets stores a date in.
 *
 * The Votes tab holds a real date rather than the ISO text it used to, so column A
 * sorts chronologically and carries the committee's "Month Day Year" display format.
 * Writing the serial keeps the whole row on one RAW write: asking Sheets to parse a
 * date string instead would mean USER_ENTERED, which would also swallow the ballot's
 * own "December 26" and store a date where a label belongs.
 *
 * The fraction is the time of day. It is deliberately kept — the cell shows only the
 * date, but two ballots on the same day still sort in the order they were cast.
 */
export function dateSerial(at: Date, timeZone: string = SHEET_TIME_ZONE): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(at)

  const field = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value)

  const wallClock = Date.UTC(
    field('year'),
    field('month') - 1,
    field('day'),
    field('hour'),
    field('minute'),
    field('second'),
  )
  return (wallClock - SHEET_EPOCH_UTC) / 86_400_000
}

let cached: JWT | undefined

function client(): JWT {
  if (cached) return cached

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const rawKey = process.env.GOOGLE_PRIVATE_KEY

  if (!email || !rawKey) {
    throw new Error(
      'Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY. Copy .env.example to .env.local and fill it in.',
    )
  }

  // A private key pasted into an env var keeps its newlines escaped as literal "\n".
  // Unescaping here is what makes the key parseable; hand-editing the newlines in the
  // env file instead produces an opaque auth failure.
  cached = new JWT({ email, key: rawKey.replace(/\\n/g, '\n'), scopes: SCOPES })
  return cached
}

export function sheetId(): string {
  const id = process.env.SHEET_ID
  if (!id) throw new Error('Missing SHEET_ID')
  return id
}

/**
 * How long a read may be served from Next's cache.
 *
 * Writes and the committee's tally must never be stale, so the default is no cache.
 * The roster picker opts into a short window instead, because "who has already voted"
 * being a few seconds behind costs nothing and spares the per-minute API quota when
 * the whole batch opens the link at once.
 */
export type CacheHint = 'no-store' | { revalidate: number }

async function call<T>(path: string, init?: RequestInit, cache: CacheHint = 'no-store'): Promise<T> {
  const { token } = await client().getAccessToken()
  const res = await fetch(`${SHEETS_API}/${sheetId()}${path}`, {
    ...init,
    headers: {
      ...init?.headers,
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    ...(cache === 'no-store' ? { cache: 'no-store' as const } : { next: { revalidate: cache.revalidate } }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Sheets API ${res.status} on ${path}: ${body.slice(0, 300)}`)
  }
  return res.json() as Promise<T>
}

export async function readRange(range: string, cache: CacheHint = 'no-store'): Promise<string[][]> {
  const data = await call<{ values?: string[][] }>(
    `/values/${encodeURIComponent(range)}`,
    undefined,
    cache,
  )
  return data.values ?? []
}

/** A cell as written: text, a number, or — under USER_ENTERED — a formula. */
export type CellValue = string | number

export async function writeRange(
  range: string,
  values: CellValue[][],
  /**
   * RAW stores each cell exactly as given. USER_ENTERED asks Sheets to parse it,
   * which is what makes a leading "=" a formula — and also what would turn the
   * ballot's "December 26" into a date where a label belongs. So it is opt-in per
   * call: the tally block asks for it, the ballot rows never do.
   */
  valueInputOption: 'RAW' | 'USER_ENTERED' = 'RAW',
): Promise<void> {
  await call(`/values/${encodeURIComponent(range)}?valueInputOption=${valueInputOption}`, {
    method: 'PUT',
    body: JSON.stringify({ values }),
  })
}

/** Several ranges in one call, for writes that are scattered down a column. */
export async function writeRanges(
  entries: readonly { range: string; values: CellValue[][] }[],
  valueInputOption: 'RAW' | 'USER_ENTERED' = 'RAW',
): Promise<void> {
  if (entries.length === 0) return
  await call('/values:batchUpdate', {
    method: 'POST',
    body: JSON.stringify({
      valueInputOption,
      data: entries.map((e) => ({ range: e.range, values: e.values })),
    }),
  })
}

/** Formatting, banding and charts — everything that is not a cell value. */
export async function batchUpdate(requests: readonly unknown[]): Promise<void> {
  if (requests.length === 0) return
  await call(':batchUpdate', {
    method: 'POST',
    body: JSON.stringify({ requests }),
  })
}

/**
 * A tab, with the ids of the objects that live on it.
 *
 * Charts and banded ranges are addressed by id, not by position, and adding one
 * always adds a new one — so re-running the formatter has to delete what it made
 * last time. That is what these ids are for.
 */
export type TabInfo = {
  title: string
  sheetId: number
  chartIds: number[]
  bandedRangeIds: number[]
}

export async function tabs(): Promise<TabInfo[]> {
  const data = await call<{
    sheets: {
      properties: { title: string; sheetId: number }
      charts?: { chartId: number }[]
      bandedRanges?: { bandedRangeId: number }[]
    }[]
  }>('?fields=sheets(properties(title,sheetId),charts.chartId,bandedRanges.bandedRangeId)')

  return data.sheets.map((s) => ({
    title: s.properties.title,
    sheetId: s.properties.sheetId,
    chartIds: (s.charts ?? []).map((c) => c.chartId),
    bandedRangeIds: (s.bandedRanges ?? []).map((b) => b.bandedRangeId),
  }))
}

export async function tabTitles(): Promise<string[]> {
  return (await tabs()).map((t) => t.title)
}

export async function createTab(title: string): Promise<void> {
  await batchUpdate([{ addSheet: { properties: { title } } }])
}

/** Names from the masterlist, in sheet order, blanks dropped. */
export async function readMasterlist(): Promise<string[]> {
  const rows = await readRange(`${ATTENDEES_TAB}!A2:A200`)
  return rows.map((r) => r[0]?.trim()).filter((n): n is string => Boolean(n))
}

export type VoteRow = {
  /** 1-indexed row in the Votes tab, so it can be written back in place. */
  row: number
  name: string
  votedAt: string
  track: string
  date: string
  venue: string
  food: string
  palette: string
  attending: string
}

export async function readVotes(cache: CacheHint = 'no-store'): Promise<VoteRow[]> {
  const rows = await readRange(`${VOTES_TAB}!A2:H200`, cache)
  return rows
    .map((r, i) => ({
      row: i + 2,
      votedAt: r[0] ?? '',
      name: r[1]?.trim() ?? '',
      track: r[2] ?? '',
      date: r[3] ?? '',
      venue: r[4] ?? '',
      food: r[5] ?? '',
      palette: r[6] ?? '',
      attending: r[7] ?? '',
    }))
    .filter((v) => v.name)
}

/**
 * A range as stored rather than as displayed — numbers stay numbers.
 *
 * `readRange` asks for the formatted text, which is what the ballot wants: a
 * timestamp it can show a returning member. Anything that has to write a value back
 * needs the value itself, or it turns a date into the string the date looked like.
 */
export async function readRangeRaw(range: string): Promise<CellValue[][]> {
  const data = await call<{ values?: CellValue[][] }>(
    `/values/${encodeURIComponent(range)}?valueRenderOption=UNFORMATTED_VALUE`,
  )
  return data.values ?? []
}

/** When each member voted, as the serial actually stored — keyed by name. */
export async function readVoteSerials(): Promise<Map<string, number>> {
  const serials = new Map<string, number>()
  for (const [votedAt, name] of await readRangeRaw(`${VOTES_TAB}!A2:B200`)) {
    if (typeof name === 'string' && name.trim() && typeof votedAt === 'number') {
      serials.set(name.trim(), votedAt)
    }
  }
  return serials
}

/** A member has voted once their row carries a timestamp. */
export const hasVoted = (v: VoteRow): boolean => Boolean(v.votedAt)
