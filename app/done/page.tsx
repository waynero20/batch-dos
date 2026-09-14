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
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6 py-14">
      <div className="rise">
        <span className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-content">
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="m4 12.5 5.2 5.2L20 7" />
          </svg>
        </span>

        <h1 className="h-display mt-6 text-[2.75rem]">
          Thanks{firstName ? <>, <em className="italic">{firstName}</em></> : ''}.
        </h1>
        <p className="mt-3 text-[0.95rem] leading-relaxed opacity-55">
          Your vote is in. The committee decides once everyone has voted.
        </p>
      </div>

      <div className="divider my-9 opacity-30" />

      <section className="rise">
        <h2 className="eyebrow">Dress code</h2>
        <p className="h-display mt-2.5 text-2xl">Any shade of blue, white, or yellow</p>
        <div className="mt-3 flex flex-wrap gap-1">
          {[...new Set(PALETTES.flatMap((p) => p.swatches))].map((hex) => (
            <span key={hex} className="size-5 rounded-selector" style={{ backgroundColor: hex }} />
          ))}
        </div>
        <p className="mt-3 text-xs opacity-40">Final palette follows whichever the batch picks.</p>
      </section>

      <Link href="/" className="btn btn-outline btn-block mt-10 rounded-field">
        Back to the list
      </Link>
    </main>
  )
}
