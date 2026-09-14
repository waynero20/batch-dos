import Image from 'next/image'
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
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      {/* The cover carries the batch's own wordmark, so the page does not repeat it. */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-base-200">
        <Image
          src="/cover.jpg"
          alt="Asa na' ta? — a scrapbook collage of the batch photo, nine years later."
          fill
          priority
          sizes="(max-width: 448px) 100vw, 448px"
          className="object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col px-6 pb-12 pt-7">
        <header className="rise">
          <h1 className="h-display text-[2.5rem]">Batch DOS Reunion</h1>
          <p className="mt-2.5 text-[0.95rem] leading-relaxed opacity-55">
            Five questions, about two minutes. Nothing is booked until the batch has voted.
          </p>
        </header>

        <div className="divider my-7 opacity-30" />

        <section className="rise flex-1">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-sm font-medium">Who are you?</h2>
            <span className="text-xs tabular-nums opacity-45">
              {voted.length}/{ROSTER.length} voted
            </span>
          </div>

          <RosterPicker roster={ROSTER} voted={voted} open={votingOpen()} />
        </section>
      </div>
    </main>
  )
}
