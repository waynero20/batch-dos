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
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 py-14">
      <header className="rise">
        <p className="eyebrow">Nine years later</p>
        <h1 className="h-display mt-3 text-[3.25rem]">
          Batch DOS
          <br />
          <em className="italic">Reunion</em>
        </h1>
        <p className="mt-4 text-[0.95rem] leading-relaxed opacity-55">
          Four questions. Help us decide.
        </p>
      </header>

      <div className="divider my-8 opacity-30" />

      <section className="rise flex-1">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-medium">Who are you?</h2>
          <span className="text-xs tabular-nums opacity-45">
            {voted.length}/{ROSTER.length} voted
          </span>
        </div>

        <RosterPicker roster={ROSTER} voted={voted} open={votingOpen()} />
      </section>
    </main>
  )
}
