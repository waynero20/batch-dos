import { describe, expect, it } from 'vitest'
import { ATTENDANCE, DATES, FOOD, PALETTES, VENUES } from './ballot'
import { dateSerial } from './sheets'
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
      'Wear · Palette',
      'RSVP · Attending',
    ])
  })

  it('lists each question’s options, contiguously, in order', () => {
    const expected = [
      DATES.map((d) => d.label),
      VENUES.map((v) => v.name),
      FOOD.map((f) => f.name),
      PALETTES.map((p) => p.name),
      ATTENDANCE.map((a) => a.label),
    ]

    tally.blocks.forEach((block, i) => {
      const rows = []
      for (let r = block.firstRow; r <= block.lastRow; r++) rows.push(label(r))
      expect(rows).toEqual(expected[i])
    })
  })

  it('counts each option against the column that actually holds it', () => {
    const column = ['D', 'E', 'F', 'G', 'H']

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

  it('counts a timestamp whichever way it was stored', () => {
    // Serials from this app, ISO text from any deploy that has not caught up. A
    // tally that saw only one of the two would under-report while both are live.
    expect(cell(tally.castRow, 1)).toBe('=COUNT($A$2:$A$1000)+COUNTIF($A$2:$A$1000,"?*")')
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
    expect(labels!.range).toBe('Votes!J1:J31')

    const column = labels!.values.flat()
    for (const dateLabel of DATES.map((d) => d.label)) {
      expect(column).toContain(dateLabel)
    }
  })

  it('sends only the two formula columns to be parsed', () => {
    expect(formulas!.input).toBe('USER_ENTERED')
    expect(formulas!.range).toBe('Votes!K1:L31')

    for (const row of formulas!.values) expect(row).toHaveLength(2)
    for (const cell of formulas!.values.flat()) {
      expect(String(cell).startsWith('=') || cell === '' || cell === 'Votes' || cell === 'Share')
        .toBe(true)
    }
  })

  it('covers the same rows from both writes, so the columns stay aligned', () => {
    expect(labels!.values).toHaveLength(formulas!.values.length)
  })
})
