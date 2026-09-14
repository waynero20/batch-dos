import Link from 'next/link'
import { PALETTES } from '@/lib/ballot'

export default async function DonePage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string }>
}) {
  const { name } = await searchParams
  const firstName = name?.split(',')[1]?.trim() ?? name ?? ''

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center px-5 py-12">
      <div className="step-in text-center">
        <span className="pop mx-auto grid size-16 place-items-center rounded-full bg-navy text-butter">
          <svg viewBox="0 0 24 24" className="size-8" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m4 12.5 5.2 5.2L20 7" />
          </svg>
        </span>

        <h1 className="display mt-6 text-[clamp(2.5rem,13vw,3.75rem)] text-navy">
          Salamat{firstName && ','}
          <br />
          <em>{firstName || 'kaayo'}!</em>
        </h1>

        <p className="mx-auto mt-4 max-w-xs text-pretty leading-relaxed text-slate">
          Narecord na imong boto. Ang committee mao’y modesisyon once nakaboto na ang tanan.
        </p>
      </div>

      <section className="tape card mt-9 p-5 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate/55">
          Dress code
        </p>
        <p className="display mt-2 text-2xl text-navy">
          any shade of
          <br />
          blue, white, or <em>yellow</em>
        </p>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {PALETTES.flatMap((p) => p.swatches).map((hex, i) => (
            <span
              key={`${hex}-${i}`}
              className="size-6 rounded-md shadow-sm ring-1 ring-navy/10"
              style={{ backgroundColor: hex }}
              title={hex}
            />
          ))}
        </div>
        <p className="mt-3 text-xs text-slate/60">
          Final palette follows whichever the batch picks.
        </p>
      </section>

      <Link
        href="/"
        className="mt-7 rounded-2xl border-2 border-navy/15 bg-paper px-6 py-3.5 text-center font-bold text-navy transition hover:border-navy/35"
      >
        Balik sa listahan
      </Link>

      <p className="mt-4 text-center text-xs text-slate/55">
        Nakalimtan og usab? Pilia lang imong ngalan pag-usab.
      </p>
    </main>
  )
}
