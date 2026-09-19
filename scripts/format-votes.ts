/**
 * Lays out the Votes tab for the committee to read:  pnpm format-votes
 *
 * Frozen bold headers, timestamps as Month Day Year, sensible column widths, a live
 * tally in J:L and one pie per question anchored down column N.
 *
 * Safe to re-run, and worth re-running whenever `lib/ballot.ts` changes — the tally
 * and the pies are built from the ballot's own options, so this is how they catch up.
 * Nothing here touches A:H beyond formatting: the ballots themselves are only ever
 * written by the app and by `pnpm seed`.
 */
import { buildTally, chartRequests, formatRequests, tallyWrites } from '../lib/votes-sheet'
import {
  VOTES_TAB,
  batchUpdate,
  dateSerial,
  readRangeRaw,
  tabs,
  writeRange,
  writeRanges,
} from '../lib/sheets'

/**
 * Turns the ISO text an earlier version of the app wrote into real dates.
 *
 * A "mmmm d, yyyy" format on a cell holding a string does nothing — the cell keeps
 * showing the ISO stamp, sorts as text, and is invisible to COUNT. These rows are
 * the ones cast before the app started writing serials.
 *
 * Only strings that parse as a date are touched. Anything else is left exactly where
 * it is and reported, because a timestamp nobody can read is a question for a person,
 * not something for a script to overwrite.
 */
async function migrateTimestamps(): Promise<number> {
  const rows = await readRangeRaw(`${VOTES_TAB}!A2:B200`)
  const converted: { range: string; values: number[][] }[] = []
  const unreadable: string[] = []

  rows.forEach(([votedAt, name], i) => {
    if (typeof name !== 'string' || !name.trim()) return
    if (typeof votedAt !== 'string' || !votedAt.trim()) return

    const at = new Date(votedAt)
    if (Number.isNaN(at.getTime())) {
      unreadable.push(`row ${i + 2} (${name}): ${votedAt}`)
      return
    }
    converted.push({ range: `${VOTES_TAB}!A${i + 2}`, values: [[dateSerial(at)]] })
  })

  await writeRanges(converted)
  for (const row of unreadable) console.warn(`  ! left alone, unreadable date — ${row}`)
  return converted.length
}

async function main() {
  const votes = (await tabs()).find((t) => t.title === VOTES_TAB)
  if (!votes) throw new Error(`No ${VOTES_TAB} tab — run \`pnpm seed\` first.`)

  const migrated = await migrateTimestamps()
  console.log(
    migrated > 0
      ? `Converted ${migrated} text timestamp${migrated === 1 ? '' : 's'} into dates.`
      : 'No text timestamps to convert.',
  )

  const tally = buildTally()

  // Values first: the charts point at these rows, so they have to exist before a
  // chart can be told to plot them.
  for (const write of tallyWrites(VOTES_TAB, tally)) {
    await writeRange(write.range, write.values, write.input)
    console.log(`Wrote ${write.range} (${write.input}).`)
  }

  await batchUpdate(formatRequests(votes.sheetId, tally, votes.bandedRangeIds))
  console.log('Applied header, date format, widths and banding.')

  await batchUpdate(chartRequests(votes.sheetId, tally, votes.chartIds))
  console.log(
    `Drew ${tally.blocks.length} pie charts` +
      (votes.chartIds.length ? ` (replacing ${votes.chartIds.length}).` : '.'),
  )
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
