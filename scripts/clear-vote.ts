/**
 * Clears one member's ballot so they show as not-yet-voted.
 *
 *   pnpm clear-vote "Rondina, Wayne"
 *
 * The row itself stays — only the answers are blanked — so the Votes tab keeps
 * mirroring the masterlist one row per member.
 */
import { VOTES_TAB, readVotes, writeRange } from '../lib/sheets'

async function main() {
  const name = process.argv[2]
  if (!name) throw new Error('Usage: pnpm clear-vote "Surname, Firstname"')

  const target = (await readVotes()).find((v) => v.name === name)
  if (!target) throw new Error(`"${name}" is not in the ${VOTES_TAB} tab.`)

  await writeRange(`${VOTES_TAB}!A${target.row}:H${target.row}`, [['', name, '', '', '', '', '', '']])
  console.log(`Cleared the ballot for ${name} (row ${target.row}).`)
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
