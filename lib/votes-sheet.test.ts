import { describe, expect, it } from 'vitest'
import { ATTENDANCE, DATES, FOOD, VENUES } from './ballot'
import { dateSerial, hasVoted, seedRows, voteSerials, type VoteRow } from './sheets'
import { buildTally, tallyWrites } from './votes-sheet'

/**
 * The timestamp the committee reads as "Month Day Year" is a number underneath, and
 * a number that is off by one is a date that is off by a day — silently, because it
 * still renders as a perfectly plausible date.
 */
describe('dateSerial', () => {
  it('counts days from the 1899-12-30 epoch', () => {
    expect(dateSerial(new Date('1899-12-31T00:00:00+08:00'))).toBe(1)
    expect(dateSerial(new Date('2026-09-19T00:00:00+08:00'))).toBe(46_284)
  })

  it("dates a ballot by Cebu's day, not by UTC's", () => {
    // 1am on the 20th in Manila is still the evening of the 19th in UTC. The vote
    // was cast on the 20th and that is the day the committee has to see.
    const lateNight = new Date('2026-09-20T01:00:00+08:00')
    expect(lateNight.toISOString()).toContain('2026-09-19')
    expect(Math.floor(dateSerial(lateNight))).toBe(46_285)
  })

  it('keeps the time of day in the fraction, so same-day ballots still sort', () => {
    const midnight = new Date('2026-09-19T00:00:00+08:00')
    const noon = new Date('2026-09-19T12:00:00+08:00')

    expect(dateSerial(midnight) % 1).toBe(0)
    expect(dateSerial(noon) - dateSerial(midnight)).toBeCloseTo(0.5, 10)
    expect(dateSerial(noon)).toBeGreaterThan(dateSerial(midnight))
  })
})

/**
 * What a re-seed carries across.
 *
 * `pnpm seed` rewrites every row, so whatever this function fails to return is
 * written away as blank. It once returned only numbers, and the three ballots then
 * holding an ISO string — cast before column A became a date — were silently
 * stripped of their timestamp, which is the only thing marking a row as voted.
 */
describe('voteSerials', () => {
  it('carries a numeric serial across untouched', () => {
    const serials = voteSerials([[46_284.5, 'Rondina, Wayne']])
    expect(serials.get('Rondina, Wayne')).toBe(46_284.5)
  })

  it('converts an ISO timestamp rather than dropping it', () => {
    // The bug: a ballot cast by a build that wrote ISO text still counts as cast.
    const iso = '2026-09-19T12:00:00+08:00'
    const serials = voteSerials([[iso, 'Desabille, Nestor']])
    expect(serials.get('Desabille, Nestor')).toBe(dateSerial(new Date(iso)))
  })

  it('keeps text it cannot parse rather than losing the row', () => {
    const serials = voteSerials([['voted at the reunion meeting', 'Monteclar, Joanna Paula']])
    expect(serials.get('Monteclar, Joanna Paula')).toBe('voted at the reunion meeting')
  })

  it('leaves a member who has not voted out of the map', () => {
    const serials = voteSerials([
      ['', 'Alcoverez, Iris'],
      ['   ', 'Booc, Daniel Lloyd'],
    ])
    expect(serials.has('Alcoverez, Iris')).toBe(false)
    expect(serials.has('Booc, Daniel Lloyd')).toBe(false)
  })

  it('ignores the blank rows the seed pads with', () => {
    expect(voteSerials([[46_284, ''], ['', '']]).size).toBe(0)
  })
})

/**
 * What counts as having voted.
 *
 * This decides turnout, the "Voted" chip on the picker, and whether a returning
 * member is shown their own answers. It used to read column A alone, so the three
 * ballots a re-seed stripped of their timestamp were treated as never cast — while
 * their answers sat on the tab being counted by every question below.
 */
describe('hasVoted', () => {
  const row = (over: Partial<VoteRow> = {}): VoteRow => ({
    row: 2,
    name: 'Cabatingan, Apolinario',
    votedAt: '',
    track: '',
    date: '',
    venue: '',
    food: '',
    palette: '',
    attending: '',
    ...over,
  })

  it('counts an ordinary ballot', () => {
    expect(hasVoted(row({ votedAt: 'September 19, 2026', attending: "I'm in" }))).toBe(true)
  })

  it('counts a ballot whose timestamp was erased', () => {
    expect(hasVoted(row({ attending: "I'm in" }))).toBe(true)
  })

  it('counts a timestamp whose answers were lost', () => {
    expect(hasVoted(row({ votedAt: 'September 19, 2026' }))).toBe(true)
  })

  it('leaves a member who has not voted alone', () => {
    expect(hasVoted(row())).toBe(false)
    expect(hasVoted(row({ votedAt: '  ', attending: '  ' }))).toBe(false)
  })
})

/**
 * The rows a re-seed writes over the whole tab.
 *
 * Seeding is the one operation that rewrites ballots it did not collect, so the
 * cost of a quiet mistake here is somebody's vote. It refuses rather than writes a
 * row it cannot account for.
 */
describe('seedRows', () => {
  const ballot = (over: Partial<VoteRow> = {}): VoteRow => ({
    row: 2,
    name: 'Desabille, Nestor',
    votedAt: 'September 19, 2026',
    track: 'Province',
    date: 'December 26',
    venue: 'Purita Farms',
    food: 'Packages & Bilao',
    palette: '',
    attending: "I'm in",
    ...over,
  })

  it('refuses to seed when a cast ballot would lose its timestamp', () => {
    // The seed that erased three of them counted what it was preserving from one
    // read and wrote the timestamps from another, so the two could disagree in
    // silence. Disagreeing is now the thing that stops it.
    const existing = new Map([['Desabille, Nestor', ballot()]])

    expect(() => seedRows(['Desabille, Nestor'], existing, new Map())).toThrow(
      /Desabille, Nestor/,
    )
  })

  it('carries the timestamp from the stored serial, not the displayed text', () => {
    const existing = new Map([['Desabille, Nestor', ballot()]])
    const serials = new Map([['Desabille, Nestor', 46_284.5]])

    expect(seedRows(['Desabille, Nestor'], existing, serials)[0]![0]).toBe(46_284.5)
  })

  it('keeps every answer on the row it came from', () => {
    const existing = new Map([['Desabille, Nestor', ballot()]])
    const serials = new Map([['Desabille, Nestor', 46_284.5]])

    expect(seedRows(['Desabille, Nestor'], existing, serials)[0]).toEqual([
      46_284.5,
      'Desabille, Nestor',
      'Province',
      'December 26',
      'Purita Farms',
      'Packages & Bilao',
      '',
      "I'm in",
    ])
  })

  it('writes a member who has not voted as a blank row under their name', () => {
    const row = seedRows(['Alcoverez, Iris'], new Map(), new Map())[0]!
    expect(row[1]).toBe('Alcoverez, Iris')
    expect(row.filter((c) => c !== '')).toEqual(['Alcoverez, Iris'])
  })

  it('returns one row per name, in masterlist order', () => {
    const names = ['Alcoverez, Iris', 'Bonsucan, Vijay', 'Mondejar, John Alfred']
    expect(seedRows(names, new Map(), new Map()).map((r) => r[1])).toEqual(names)
  })
})

/**
 * The tally is generated from `lib/ballot.ts` so it cannot drift from the ballot,
 * and the pies plot it by row range — so a block that gains a blank row, or loses
 * an option, quietly produces a chart of the wrong thing.
 */
describe('buildTally', () => {
  const tally = buildTally()
  const cell = (row: number, col: number) => tally.rows[row - 1]?.[col]
  const label = (row: number) => cell(row, 0)

  it('does not repeat itself when a step is named after its column', () => {
    expect(tally.blocks.map((b) => b.title)).not.toContain('Food · Food')
  })

  it('asks about every question on the ballot, in ballot order', () => {
    expect(tally.blocks.map((b) => b.title)).toEqual([
      'When · Date',
      'Where · Venue',
      'Food',
      'RSVP · Attending',
    ])
  })

  it('lists each question’s options, contiguously, in order', () => {
    const expected = [
      DATES.map((d) => d.label),
      VENUES.map((v) => v.name),
      FOOD.map((f) => f.name),
      ATTENDANCE.map((a) => a.label),
    ]

    tally.blocks.forEach((block, i) => {
      const rows = []
      for (let r = block.firstRow; r <= block.lastRow; r++) rows.push(label(r))
      expect(rows).toEqual(expected[i])
    })
  })

  it('counts each option against the column that actually holds it', () => {
    // G is skipped: the Palette column is still in the sheet, holding the ballots
    // cast while that question existed, but nothing tallies it any more.
    const column = ['D', 'E', 'F', 'H']

    tally.blocks.forEach((block, i) => {
      for (let r = block.firstRow; r <= block.lastRow; r++) {
        // The criterion is the label's own cell, so an apostrophe or an accent in a
        // venue name has nothing to break.
        expect(cell(r, 1)).toBe(`=COUNTIF($${column[i]}$2:$${column[i]}$1000,$J${r})`)
        expect(cell(r, 2)).toBe(`=IFERROR(K${r}/$K$${tally.castRow},0)`)
      }
    })
  })

  it('divides every share by the ballots actually cast', () => {
    expect(label(tally.castRow)).toBe('Ballots cast')
  })

  it('counts a ballot by its answers, not only by its timestamp', () => {
    // The bug this replaced: a re-seed blanked three timestamps, the answers stayed
    // put, and the tally read 6 of 9 — so "December 26" came out at 133%.
    expect(cell(tally.castRow, 1)).toBe(
      '=SUMPRODUCT(SIGN((LEN($A$2:$A$1000)>0)+(LEN($H$2:$H$1000)>0)))',
    )
  })

  it('counts a row holding both a timestamp and an answer exactly once', () => {
    // SIGN is the whole point: (TRUE)+(TRUE) is 2, and a turnout of double the
    // ballots cast would be a worse number than the one it replaced.
    expect(cell(tally.castRow, 1)).toContain('SIGN(')
  })

  it('does not count the blank rows the seed pads with', () => {
    // COUNTA would: a padded cell holds an empty string, which reads as blank on the
    // tab but not to COUNTA — and every share would divide by a roster one too big.
    const roster = tally.rows.findIndex((r) => r[0] === 'On the roster') + 1
    expect(cell(roster, 1)).toBe('=COUNTIF($B$2:$B$1000,"?*")')
  })

  it('leaves the ballots in A:H alone — the tally is three columns wide', () => {
    for (const row of tally.rows) expect(row.length).toBeLessThanOrEqual(3)
  })
})

/**
 * The reason the tally is two writes rather than one. Sent as USER_ENTERED, the
 * label "December 26" lands in column J as a date, and every COUNTIF beneath it —
 * matching a date against the text in column D — returns zero. The tally would look
 * finished and read nothing.
 */
describe('tallyWrites', () => {
  const writes = tallyWrites('Votes', buildTally())
  const [labels, formulas] = writes

  it('sends the labels RAW, so a date-shaped one stays a label', () => {
    expect(labels!.input).toBe('RAW')
    expect(labels!.range).toBe('Votes!J1:J60')

    const column = labels!.values.flat()
    for (const dateLabel of DATES.map((d) => d.label)) {
      expect(column).toContain(dateLabel)
    }
  })

  it('sends only the two formula columns to be parsed', () => {
    expect(formulas!.input).toBe('USER_ENTERED')
    expect(formulas!.range).toBe('Votes!K1:L60')

    for (const row of formulas!.values) expect(row).toHaveLength(2)
    for (const cell of formulas!.values.flat()) {
      expect(String(cell).startsWith('=') || cell === '' || cell === 'Votes' || cell === 'Share')
        .toBe(true)
    }
  })

  it('covers the same rows from both writes, so the columns stay aligned', () => {
    expect(labels!.values).toHaveLength(formulas!.values.length)
  })

  /**
   * Dropping the palette question took the tally from 31 rows to 25. The write only
   * covered the new 25, so rows 26-31 kept the old block — a second, frozen RSVP
   * tally sitting under the live one, with a pie still pointing at it.
   */
  it('blanks the rows below the tally instead of leaving the old block there', () => {
    const tally = buildTally()
    expect(labels!.values.length).toBeGreaterThan(tally.lastRow)

    for (let row = tally.lastRow + 1; row <= labels!.values.length; row++) {
      expect(labels!.values[row - 1]).toEqual([''])
      expect(formulas!.values[row - 1]).toEqual(['', ''])
    }
  })
})
