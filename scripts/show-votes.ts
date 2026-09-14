/** Quick committee-side check from the terminal:  pnpm votes */
import { ROSTER } from '../lib/roster'
import { hasVoted, readVotes } from '../lib/sheets'

async function main() {
  const rows = await readVotes()
  const cast = rows.filter(hasVoted)
  console.log(`Votes tab rows : ${rows.length}`)
  console.log(`Ballots cast   : ${cast.length} / ${ROSTER.length}\n`)
  for (const v of cast) {
    console.log(
      [v.row, v.name, v.track, v.date, v.venue, v.food, v.palette, v.attending].join(' | '),
    )
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
