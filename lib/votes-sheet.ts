/**
 * The committee's reading layout for the Votes tab: a live tally beside the ballots,
 * and one pie per question.
 *
 * Everything here is derived from `lib/ballot.ts`, so the options in the tally are
 * the options on the ballot by construction. Re-run `pnpm format-votes` after the
 * committee revises the proposal and the blocks follow it.
 *
 * The counts are COUNTIF formulas rather than numbers this module works out. The
 * committee opens the tab while voting is still running, and a number written once
 * would be wrong by the time they read it.
 */
import { ATTENDANCE, DATES, FOOD, PALETTES, VENUES } from './ballot'
import { VOTE_HEADERS, type CellValue } from './sheets'

/* -------------------------------------------------------------------------- */
/* Where everything sits                                                        */
/* -------------------------------------------------------------------------- */

/** 0-indexed columns. The ballots own A:H; I and M are gutters, left empty. */
const COLUMN = {
  label: 9, // J — the option
  count: 10, // K — how many chose it
  share: 11, // L — that as a percentage of ballots cast
  chart: 13, // N — where the pies are anchored
} as const

const LABEL = 'J'
const COUNT = 'K'

/**
 * The bottom of the ranges the formulas cover.
 *
 * Deliberately far below the 73 rows the roster currently fills: the masterlist
 * grows, and a tally that silently stopped counting at row 74 would be worse than
 * one that never worked.
 */
const LAST_DATA_ROW = 1000

const columnOf = (header: (typeof VOTE_HEADERS)[number]): string =>
  String.fromCharCode('A'.charCodeAt(0) + VOTE_HEADERS.indexOf(header))

type Question = {
  /** The step, as the flow names it. */
  short: string
  /** The column on this tab that holds the answer. */
  header: (typeof VOTE_HEADERS)[number]
  options: readonly string[]
}

/**
 * One entry per question the ballot asks, in the order the flow asks them.
 *
 * `who` and `day` are left out: neither records an answer, so neither has anything
 * to count.
 */
const QUESTIONS: readonly Question[] = [
  { short: 'When', header: 'Date', options: DATES.map((d) => d.label) },
  { short: 'Where', header: 'Venue', options: VENUES.map((v) => v.name) },
  { short: 'Food', header: 'Food', options: FOOD.map((f) => f.name) },
  { short: 'Wear', header: 'Palette', options: PALETTES.map((p) => p.name) },
  { short: 'RSVP', header: 'Attending', options: ATTENDANCE.map((a) => a.label) },
]

/* -------------------------------------------------------------------------- */
/* Building the block                                                           */
/* -------------------------------------------------------------------------- */

export type TallyBlock = {
  /** "Where · Venue" — the step, and the column it counts. */
  title: string
  /** 1-indexed row of that title. */
  titleRow: number
  /** 1-indexed first and last option rows, which is what a chart plots. */
  firstRow: number
  lastRow: number
}

export type Tally = {
  /** J1:L{lastRow}. The layout as one grid — what the tests read. */
  rows: CellValue[][]
  blocks: TallyBlock[]
  /** The row every share divides by. */
  castRow: number
  lastRow: number
}

/**
 * The tally block, top to bottom.
 *
 * Turnout leads, because it is the one number the committee actually opens the tab
 * for and a single value is a figure rather than a chart. The questions follow in
 * ballot order, each its own contiguous run of rows so a pie can point at it.
 */
export function buildTally(): Tally {
  const rows: CellValue[][] = []
  const blocks: TallyBlock[] = []

  /** Row numbers are 1-indexed, so the row a cell lands on is the length after it. */
  const push = (...cells: CellValue[]): number => rows.push(cells)

  const rangeOf = (header: (typeof VOTE_HEADERS)[number]) => {
    const c = columnOf(header)
    return `$${c}$2:$${c}$${LAST_DATA_ROW}`
  }

  push('Tally', 'Votes', 'Share')

  // Two terms, because column A can hold either kind of timestamp. COUNT sees the
  // date serials this app writes now; COUNTIF "?*" sees the ISO text an older
  // deploy wrote, and would keep seeing it if a stale one were still live. A serial
  // is not text and text is not a number, so nothing is counted twice.
  const timestamps = rangeOf('Timestamp')
  const castRow = push('Ballots cast', `=COUNT(${timestamps})+COUNTIF(${timestamps},"?*")`, '')
  const waitingRow = push('Not yet voted', '', '')

  // COUNTIF "?*", not COUNTA: the seed pads past the end of the roster, and a padded
  // cell holds an empty string — invisible on the tab, but COUNTA counts it, which
  // is one phantom member on every count that matters.
  const rosterRow = push('On the roster', `=COUNTIF(${rangeOf('Name')},"?*")`, '')

  rows[castRow - 1]![2] = `=IFERROR(${COUNT}${castRow}/${COUNT}${rosterRow},0)`
  rows[waitingRow - 1]![1] = `=${COUNT}${rosterRow}-${COUNT}${castRow}`
  rows[waitingRow - 1]![2] = `=IFERROR(${COUNT}${waitingRow}/${COUNT}${rosterRow},0)`

  for (const question of QUESTIONS) {
    push('')
    // "Where · Venue" names the step and the column it counts. When the step is
    // already named after its column there is nothing to add — "Food · Food" is
    // just noise.
    const title =
      question.short === question.header
        ? question.short
        : `${question.short} · ${question.header}`
    const titleRow = push(title, '', '')
    const answers = rangeOf(question.header)

    for (const option of question.options) {
      const row = rows.length + 1
      // The criterion is a reference rather than the label inlined, so an apostrophe
      // or an accent in a venue name has nothing to break.
      push(
        option,
        `=COUNTIF(${answers},$${LABEL}${row})`,
        `=IFERROR(${COUNT}${row}/$${COUNT}$${castRow},0)`,
      )
    }

    blocks.push({ title, titleRow, firstRow: titleRow + 1, lastRow: rows.length })
  }

  return { rows, blocks, castRow, lastRow: rows.length }
}

/**
 * The tally goes to the sheet in two writes, and it has to.
 *
 * The formulas need USER_ENTERED — that is the only thing that makes a leading "="
 * a formula rather than text. But USER_ENTERED parses *everything* it is given, and
 * the labels in column J include "December 26" and "January 2". Sent that way they
 * would land as dates, and every COUNTIF underneath — comparing a date against the
 * text in column D — would quietly return zero.
 *
 * So the labels go RAW and stay the strings the ballot stores, and only the two
 * formula columns are parsed.
 */
export const tallyWrites = (tab: string, tally: Tally) =>
  [
    {
      range: `${tab}!${LABEL}1:${LABEL}${tally.lastRow}`,
      values: tally.rows.map((r) => [r[0] ?? '']),
      input: 'RAW' as const,
    },
    {
      range: `${tab}!${COUNT}1:L${tally.lastRow}`,
      values: tally.rows.map((r) => [r[1] ?? '', r[2] ?? '']),
      input: 'USER_ENTERED' as const,
    },
  ] satisfies { range: string; values: CellValue[][]; input: 'RAW' | 'USER_ENTERED' }[]

/* -------------------------------------------------------------------------- */
/* Formatting                                                                   */
/* -------------------------------------------------------------------------- */

/** "#1c5cab" as the API's three floats. */
const rgb = (hex: string) => ({
  red: parseInt(hex.slice(1, 3), 16) / 255,
  green: parseInt(hex.slice(3, 5), 16) / 255,
  blue: parseInt(hex.slice(5, 7), 16) / 255,
})

/** Chrome stays recessive: the data is the only thing with any weight. */
const INK = rgb('#0b0b0b')
const MUTED = rgb('#52514e')
const ACCENT = rgb('#1c5cab')
const HEADER_FILL = rgb('#eef1f5')
const BAND_FILL = rgb('#f1f4f8')
const RULE = rgb('#c8ccd4')

const grid = (sheetId: number, r1: number, r2: number, c1: number, c2: number) => ({
  sheetId,
  startRowIndex: r1,
  endRowIndex: r2,
  startColumnIndex: c1,
  endColumnIndex: c2,
})

const width = (sheetId: number, column: number, pixels: number) => ({
  updateDimensionProperties: {
    range: { sheetId, dimension: 'COLUMNS', startIndex: column, endIndex: column + 1 },
    properties: { pixelSize: pixels },
    fields: 'pixelSize',
  },
})

/** Column A through H, and the gutter that separates them from the tally. */
const BALLOT_WIDTHS = [170, 230, 90, 130, 200, 175, 135, 125, 28]

/**
 * Everything that is not a cell value: the frozen header, the date format on column
 * A, the column widths, the banding, and the weights inside the tally.
 *
 * `bandedRangeIds` are the ones already on the tab. Banding is added by id and a new
 * one is added every time, so a re-run has to clear the previous pass first.
 */
export function formatRequests(
  sheetId: number,
  tally: Tally,
  bandedRangeIds: readonly number[],
): unknown[] {
  const header = { bold: true, foregroundColorStyle: { rgbColor: INK } }

  return [
    // The names scroll past 73 rows; the headers have to stay put.
    {
      updateSheetProperties: {
        properties: { sheetId, gridProperties: { frozenRowCount: 1 } },
        fields: 'gridProperties.frozenRowCount',
      },
    },

    ...bandedRangeIds.map((bandedRangeId) => ({ deleteBanding: { bandedRangeId } })),

    {
      addBanding: {
        bandedRange: {
          range: grid(sheetId, 1, LAST_DATA_ROW, 0, VOTE_HEADERS.length),
          rowProperties: {
            firstBandColorStyle: { rgbColor: rgb('#ffffff') },
            secondBandColorStyle: { rgbColor: BAND_FILL },
          },
        },
      },
    },

    {
      repeatCell: {
        range: grid(sheetId, 0, 1, 0, VOTE_HEADERS.length),
        cell: {
          userEnteredFormat: {
            backgroundColorStyle: { rgbColor: HEADER_FILL },
            textFormat: header,
            verticalAlignment: 'MIDDLE',
            borders: { bottom: { style: 'SOLID', colorStyle: { rgbColor: RULE } } },
          },
        },
        fields:
          'userEnteredFormat(backgroundColorStyle,textFormat,verticalAlignment,borders)',
      },
    },

    // The point of the whole exercise: column A displays as Month Day Year.
    {
      repeatCell: {
        range: grid(sheetId, 1, LAST_DATA_ROW, 0, 1),
        cell: { userEnteredFormat: { numberFormat: { type: 'DATE', pattern: 'mmmm d, yyyy' } } },
        fields: 'userEnteredFormat.numberFormat',
      },
    },

    ...BALLOT_WIDTHS.map((pixels, i) => width(sheetId, i, pixels)),
    width(sheetId, COLUMN.label, 215),
    width(sheetId, COLUMN.count, 70),
    width(sheetId, COLUMN.share, 70),
    width(sheetId, COLUMN.chart - 1, 28),

    // The tally's own header, matching the ballots'.
    {
      repeatCell: {
        range: grid(sheetId, 0, 1, COLUMN.label, COLUMN.share + 1),
        cell: {
          userEnteredFormat: {
            backgroundColorStyle: { rgbColor: HEADER_FILL },
            textFormat: header,
            borders: { bottom: { style: 'SOLID', colorStyle: { rgbColor: RULE } } },
          },
        },
        fields: 'userEnteredFormat(backgroundColorStyle,textFormat,borders)',
      },
    },

    // Counts and shares read as numbers: right-aligned, one column of digits.
    {
      repeatCell: {
        range: grid(sheetId, 0, 1, COLUMN.count, COLUMN.share + 1),
        cell: { userEnteredFormat: { horizontalAlignment: 'RIGHT' } },
        fields: 'userEnteredFormat.horizontalAlignment',
      },
    },
    {
      repeatCell: {
        range: grid(sheetId, 1, tally.lastRow, COLUMN.count, COLUMN.count + 1),
        cell: {
          userEnteredFormat: {
            horizontalAlignment: 'RIGHT',
            numberFormat: { type: 'NUMBER', pattern: '0;;—' },
          },
        },
        fields: 'userEnteredFormat(horizontalAlignment,numberFormat)',
      },
    },
    {
      repeatCell: {
        range: grid(sheetId, 1, tally.lastRow, COLUMN.share, COLUMN.share + 1),
        cell: {
          userEnteredFormat: {
            horizontalAlignment: 'RIGHT',
            numberFormat: { type: 'PERCENT', pattern: '0%;;—' },
            textFormat: { foregroundColorStyle: { rgbColor: MUTED } },
          },
        },
        fields: 'userEnteredFormat(horizontalAlignment,numberFormat,textFormat)',
      },
    },

    // Turnout is the headline, so it carries the only bold number on the tab.
    {
      repeatCell: {
        range: grid(sheetId, tally.castRow - 1, tally.castRow, COLUMN.label, COLUMN.share + 1),
        cell: { userEnteredFormat: { textFormat: { bold: true } } },
        fields: 'userEnteredFormat.textFormat.bold',
      },
    },

    // Each question's heading, so the blocks read apart at a glance.
    ...tally.blocks.map((b) => ({
      repeatCell: {
        range: grid(sheetId, b.titleRow - 1, b.titleRow, COLUMN.label, COLUMN.share + 1),
        cell: {
          userEnteredFormat: {
            textFormat: { bold: true, foregroundColorStyle: { rgbColor: ACCENT } },
            borders: { top: { style: 'SOLID', colorStyle: { rgbColor: RULE } } },
          },
        },
        fields: 'userEnteredFormat(textFormat,borders)',
      },
    })),
  ]
}

/* -------------------------------------------------------------------------- */
/* The pies                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Wide and short on purpose.
 *
 * Sheets sizes the pie off the *smaller* dimension, so height sets the circle and
 * the leftover width is what the slice labels get. Growing both together just grows
 * the pie; holding the height down is what stops "Bakhawan Beach Home" being cut.
 */
const CHART_WIDTH = 660
const CHART_HEIGHT = 260
/** 260px of chart over 21px rows, plus a gap, so the pies do not touch. */
const CHART_ROW_SPAN = 14

/**
 * One pie per question, anchored down column N.
 *
 * Every member casts exactly one vote per question, so each block really is a whole
 * and a pie is reading it the way it is shaped. What a pie cannot do is separate two
 * close slices — that is the job of the Votes and Share columns beside it, which is
 * why both are here rather than either alone.
 *
 * `LABELED_LEGEND` writes each option's name and percentage onto its own slice, so
 * nothing on the chart depends on telling two colours apart. Sheets picks the slice
 * colours itself; the API has no field for them.
 *
 * `chartIds` are the ones already on the tab — added charts always get a new id, so a
 * re-run would stack a second set on top of the first.
 */
export function chartRequests(
  sheetId: number,
  tally: Tally,
  chartIds: readonly number[],
): unknown[] {
  const source = (firstRow: number, lastRow: number, column: number) => ({
    sourceRange: { sources: [grid(sheetId, firstRow - 1, lastRow, column, column + 1)] },
  })

  return [
    ...chartIds.map((chartId) => ({ deleteEmbeddedObject: { objectId: chartId } })),

    ...tally.blocks.map((block, i) => ({
      addChart: {
        chart: {
          spec: {
            title: block.title,
            titleTextFormat: { bold: true, fontSize: 11 },
            fontName: 'Arial',
            pieChart: {
              legendPosition: 'LABELED_LEGEND',
              domain: source(block.firstRow, block.lastRow, COLUMN.label),
              series: source(block.firstRow, block.lastRow, COLUMN.count),
            },
          },
          position: {
            overlayPosition: {
              anchorCell: { sheetId, rowIndex: i * CHART_ROW_SPAN, columnIndex: COLUMN.chart },
              offsetXPixels: 8,
              offsetYPixels: 8,
              widthPixels: CHART_WIDTH,
              heightPixels: CHART_HEIGHT,
            },
          },
        },
      },
    })),
  ]
}
