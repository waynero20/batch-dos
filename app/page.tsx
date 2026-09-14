import { RosterPicker } from '@/components/roster-picker'
import { votingOpen } from '@/lib/config'
import { ROSTER } from '@/lib/roster'
import { hasVoted, readVotes } from '@/lib/sheets'

// The roster is static, but who has voted is not.
export const revalidate = 30

async function votedNames(): Promise<string[]> {
  try {
    return (await readVotes({ revalidate: 30 })).filter(hasVoted).map((v) => v.name)
  } catch (err) {
    // A spreadsheet hiccup must not take the ballot down — the picker still works,
    // it just cannot show who has already voted.
    console.error('[page] could not read votes', err)
    return []
  }
}

export default async function Home() {
  const voted = await votedNames()

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 pb-10 pt-10">
      <header className="mb-8 text-center">
        <span className="chip mx-auto bg-navy text-butter">9 years later</span>

        <h1 className="display mt-4 text-[clamp(3.4rem,19vw,5.5rem)] text-navy">
          Asa na’
          <br />
          <em>ta?</em>
        </h1>

        <p className="mx-auto mt-5 max-w-xs text-pretty text-[0.95rem] leading-relaxed text-slate">
          Tabangi mi pagdesisyon. Pilia ang petsa, lugar, pagkaon ug kolor — unya kita-kita
          ta.
        </p>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate/65">
          Four questions, about two minutes. Nothing is final until the batch has voted.
        </p>
      </header>

      <section className="tape card p-5">
        <RosterPicker roster={ROSTER} voted={voted} open={votingOpen()} />
      </section>

      <footer className="mt-8 text-center text-xs text-slate/55">
        Batch DOS · your answer can be changed until voting closes
      </footer>
    </main>
  )
}
