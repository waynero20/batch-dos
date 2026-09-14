/**
 * The day's programme, transcribed from the Program tab of the reunion workbook.
 *
 * Times in that tab are stored as Excel day-fractions and are converted here to
 * fixed strings rather than read live — the schedule changes rarely, and a wrong
 * fraction should fail in review rather than silently render a 4am game.
 *
 * Two values in the sheet do not survive that conversion literally:
 *
 *  - Game No. 4 ends at `0.1875`, which is 4:30 **am** — before it starts. The
 *    intended value is almost certainly `0.6875` (4:30pm), since Game No. 5 begins
 *    exactly there. Rendered as 4:30pm.
 *  - Chill & Drinks ends at `0.0`, i.e. midnight. Shown as "till late" rather than
 *    12:00am, which reads like a bug.
 *
 * Both are worth fixing in the sheet; this file should then be updated to match.
 */

export type ProgramKind = 'arrival' | 'program' | 'games' | 'night'

export type ProgramItem = {
  start: string
  end?: string
  title: string
  kind: ProgramKind
  note?: string
}

export const PROGRAM: readonly ProgramItem[] = [
  {
    start: '8:00am',
    end: '10:00am',
    title: 'Registration & Arrival',
    kind: 'arrival',
    note: 'Arrival, chika-chika, pangumusta.',
  },
  {
    start: '10:00am',
    title: 'Welcome Address',
    kind: 'program',
    note: 'By our very own Apolinario Cabatingan.',
  },
  {
    start: '10:15am',
    title: 'Asa Na Ta?',
    kind: 'program',
    note: 'Everyone gets a moment to share what the last nine years looked like — work, family, the wins and the hard parts.',
  },
  { start: '12:00pm', title: 'Lunch', kind: 'program' },
  { start: '1:00pm', title: 'Game No. 1', kind: 'games' },
  {
    start: '1:45pm',
    title: 'Video Presentation',
    kind: 'program',
    note: 'Photos from back then, put together by the committee.',
  },
  { start: '2:15pm', title: 'Game No. 2', kind: 'games' },
  {
    start: '3:00pm',
    title: 'Intermission',
    kind: 'program',
    note: 'Jola Monteclar — the MNSTS nightingale.',
  },
  { start: '3:10pm', title: 'Game No. 3', kind: 'games' },
  { start: '3:45pm', title: 'Intermission', kind: 'program' },
  { start: '3:55pm', title: 'Game No. 4', kind: 'games' },
  { start: '4:30pm', title: 'Game No. 5', kind: 'games' },
  { start: '5:00pm', title: 'Dinner', kind: 'program' },
  { start: '6:00pm', end: 'till late', title: 'Chill & Drinks', kind: 'night' },
]

export const PROGRAM_KIND_LABEL: Record<ProgramKind, string> = {
  arrival: 'Arrival',
  program: 'Programme',
  games: 'Games',
  night: 'Chill night',
}
