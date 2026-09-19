import Image from 'next/image'
import Link from 'next/link'
import { voteCount } from '@/app/actions'
import { ProgramTimeline } from '@/components/program-timeline'
import { PALETTES } from '@/lib/ballot'
import { PROGRAM } from '@/lib/program'

export default async function DonePage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string; changed?: string }>
}) {
  const { name, changed } = await searchParams
  const firstName = name?.split(',')[1]?.trim()
  const amended = changed === '1'
  const half = Math.ceil(PROGRAM.length / 2)

  // Read uncached: the vote that just landed is the whole reason to show this, and a
  // member who cannot find themselves in the count assumes it did not save.
  const count = await voteCount()

  return (
    <main>
      {/* Full-bleed: cover.jpg is 1920px wide, the only asset with the pixels for it.
          16/9 matches the source exactly, so object-cover is a no-op until the height
          cap bites on short windows. The flow itself is a locked viewport with no room
          for a photograph like this; here there is. */}
      <div className="relative aspect-[16/9] max-h-[48dvh] w-full overflow-hidden bg-base-200">
        <Image
          src="/cover.jpg"
          alt="Asa na' ta? — a scrapbook collage of the batch photo, nine years later."
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      <div className="shell pb-16 pt-10 lg:pt-14">
        <div className="lg:grid lg:grid-cols-2 lg:items-center lg:gap-20">
          <div className="rise">
            <span className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-content">
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="m4 12.5 5.2 5.2L20 7" />
              </svg>
            </span>

            <h1 className="h-display mt-6 text-[2.75rem] lg:text-[3.5rem]">
              {amended ? 'Changed' : 'Thanks'}
              {firstName ? `, ${firstName}` : ''}.
            </h1>
            <p className="mt-3 max-w-[40ch] text-[0.95rem] leading-relaxed opacity-55 lg:text-lg">
              {amended
                ? 'Your new answers replaced the old ones. The committee decides once everyone has voted.'
                : 'Your vote is in. The committee decides once everyone has voted.'}
            </p>
            <p className="caption mt-2">You can come back and change it any time.</p>

            {/* The count, and only the count. One number is a figure, not a chart —
                the bar underneath is the ratio, which is the other half of "how far
                along are we". Nothing here says who voted or what they chose. */}
            {count && (
              <div className="mt-8 max-w-[22rem]">
                <div className="flex items-baseline gap-2">
                  <span className="h-display text-[2.5rem] tabular-nums lg:text-5xl">
                    {count.cast}
                  </span>
                  <span className="text-sm opacity-55">
                    of {count.total} have voted
                  </span>
                </div>
                <progress
                  className="progress progress-primary mt-2.5 h-1.5 w-full"
                  value={count.cast}
                  max={count.total}
                />
              </div>
            )}

            <Link href="/" className="btn btn-outline btn-block mt-9 rounded-field lg:w-auto lg:min-w-[16rem]">
              Back to the start
            </Link>
          </div>

          <section className="mt-12 rounded-box border border-base-300 p-6 lg:mt-0 lg:p-8">
            <div className="rule-heavy" />
            <h2 className="eyebrow pt-3">Dress code</h2>
            <p className="h-display mt-2.5 text-2xl lg:text-[2rem]">
              Any shade of blue, white, or yellow
            </p>
            <div className="mt-5 flex flex-wrap gap-1.5">
              {[...new Set(PALETTES.flatMap((p) => p.swatches))].map((hex) => (
                <span
                  key={hex}
                  className="size-8 rounded-selector lg:size-9"
                  style={{ backgroundColor: hex }}
                  title={hex}
                />
              ))}
            </div>
            <p className="caption mt-4">Final palette follows whichever the batch picks.</p>
          </section>
        </div>

        {/* The full programme lives here rather than in the flow: fourteen moments
            cannot fit a viewport, and this is the one screen allowed to scroll. */}
        <section className="mt-16 border-t-2 border-base-content pt-8 lg:mt-24 lg:pt-10">
          <h2 className="eyebrow">The day</h2>
          <p className="h-display mt-2 text-[1.75rem] lg:text-[2.25rem]">
            Same plan wherever we land
          </p>

          <div className="mt-8 lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
            <div className="lg:hidden">
              <ProgramTimeline />
            </div>
            <div className="hidden lg:block">
              <ProgramTimeline items={PROGRAM.slice(0, half)} />
            </div>
            <div className="hidden lg:block">
              <ProgramTimeline items={PROGRAM.slice(half)} />
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
