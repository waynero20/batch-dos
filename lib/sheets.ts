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

/** Votes!A:H — one row per member, in masterlist order. */
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

export async function writeRange(range: string, values: string[][]): Promise<void> {
  await call(`/values/${encodeURIComponent(range)}?valueInputOption=RAW`, {
    method: 'PUT',
    body: JSON.stringify({ values }),
  })
}

export async function tabTitles(): Promise<string[]> {
  const data = await call<{ sheets: { properties: { title: string } }[] }>(
    '?fields=sheets.properties.title',
  )
  return data.sheets.map((s) => s.properties.title)
}

export async function createTab(title: string): Promise<void> {
  await call(':batchUpdate', {
    method: 'POST',
    body: JSON.stringify({ requests: [{ addSheet: { properties: { title } } }] }),
  })
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

/** A member has voted once their row carries a timestamp. */
export const hasVoted = (v: VoteRow): boolean => Boolean(v.votedAt)
