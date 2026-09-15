import Image from 'next/image'
import { IntroGate } from '@/components/intro/intro-gate'
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
    <IntroGate>
      <main className="min-h-dvh">
        {/* Full-bleed: cover.jpg is 1920px wide, the only asset with the pixels for it.
            16/9 matches the source exactly, so object-cover is a no-op until the height
            cap bites on short windows. */}
        <div className="relative aspect-[16/9] max-h-[74dvh] w-full overflow-hidden bg-base-200">
          <Image
            src="/cover.jpg"
            alt="Asa na' ta? — a scrapbook collage of the batch photo, nine years later."
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>

        <section className="shell pb-14 pt-9 lg:grid lg:grid-cols-12 lg:gap-x-10 lg:pb-20 lg:pt-16">
          <header className="rise lg:col-span-7">
            <div className="flex items-baseline justify-between gap-4">
              <p className="eyebrow">Cebu · Nine years later</p>
              {/* A plain <a> on purpose: the full load re-runs the intro boot script. */}
              <a href="/?intro" className="eyebrow underline-offset-4 hover:underline">
                Watch the intro
              </a>
            </div>
            <h1 className="h-display mt-4 text-[2.5rem] lg:text-[4.25rem] xl:text-[5rem]">
              Batch DOS Reunion
            </h1>
            <p className="mt-5 max-w-[38ch] text-[0.95rem] leading-relaxed opacity-55 lg:text-lg">
              Five questions, about two minutes. Nothing is booked until the batch has voted.
            </p>
          </header>

          <div className="mt-8 lg:col-span-5 lg:mt-0 lg:self-end">
            <div className="rule-heavy" />
            <div className="flex items-baseline justify-between pt-4">
              <span className="folio text-sm">73 NAMES</span>
              <span className="eyebrow">
                {voted.length}/{ROSTER.length} VOTED
              </span>
              <span className="eyebrow">ISSUE ONE</span>
            </div>
          </div>
        </section>

        <section className="border-t-2 border-base-content">
          <div className="shell py-12 lg:grid lg:grid-cols-12 lg:gap-x-10 lg:py-16">
            <div className="lg:col-span-3 lg:sticky lg:top-10 lg:self-start">
              <p className="eyebrow">The Register</p>
              <h2 className="h-display mt-2 text-[1.75rem] lg:text-[2.25rem]">Who are you?</h2>
              <p className="caption mt-3 max-w-[32ch]">
                Find your name to open the ballot. No password, no sign-in.
              </p>
              <p className="folio mt-7 text-[3.5rem] lg:text-[4.5rem]">{voted.length}</p>
              <p className="caption mt-1">of {ROSTER.length} voted</p>
            </div>

            <div className="mt-8 lg:col-span-9 lg:mt-0">
              <RosterPicker roster={ROSTER} voted={voted} open={votingOpen()} />
            </div>
          </div>
        </section>
      </main>
    </IntroGate>
  )
}
