import Link from 'next/link'
import { PALETTES } from '@/lib/ballot'

export default async function DonePage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string }>
}) {
  const { name } = await searchParams
  const firstName = name?.split(',')[1]?.trim()

  return (
    <main className="shell py-14 lg:grid lg:min-h-dvh lg:grid-cols-2 lg:items-center lg:gap-20">
      <div className="rise">
        <span className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-content">
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="m4 12.5 5.2 5.2L20 7" />
          </svg>
        </span>

        <h1 className="h-display mt-6 text-[2.75rem] lg:text-[3.5rem]">
          Thanks{firstName ? `, ${firstName}` : ''}.
        </h1>
        <p className="mt-3 max-w-[40ch] text-[0.95rem] leading-relaxed opacity-55 lg:text-lg">
          Your vote is in. The committee decides once everyone has voted.
        </p>

        <Link href="/" className="btn btn-outline btn-block mt-10 rounded-field lg:w-auto lg:min-w-[16rem]">
          Back to the list
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
    </main>
  )
}
