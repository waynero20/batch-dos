import { notFound } from 'next/navigation'
import { ATTENDANCE, DATES, FOOD, PALETTES, VENUES } from '@/lib/ballot'
import { ROSTER } from '@/lib/roster'
import { hasVoted, readVotes, type VoteRow } from '@/lib/sheets'

export const dynamic = 'force-dynamic'

type Tally = { label: string; count: number }

const tally = (rows: VoteRow[], field: keyof VoteRow, options: readonly string[]): Tally[] =>
  options
    .map((label) => ({ label, count: rows.filter((r) => r[field] === label).length }))
    .sort((a, b) => b.count - a.count)

export default async function ResultsPage({ params }: { params: Promise<{ secret: string }> }) {
  const { secret } = await params
  const expected = process.env.RESULTS_SECRET

  // An unset secret must not mean "open to everyone".
  if (!expected || secret !== expected) notFound()

  const all = await readVotes()
  const cast = all.filter(hasVoted)
  const missing = ROSTER.filter((n) => !cast.some((v) => v.name === n))

  const questions = [
    { bisaya: 'Kanus-a ta mag Kita?', english: 'Date', data: tally(cast, 'date', DATES.map((d) => d.label)) },
    { bisaya: 'Asa ta mo Adto?', english: 'Venue', data: tally(cast, 'venue', VENUES.map((v) => v.name)) },
    { bisaya: 'Unsa ato Kan-on?', english: 'Food', data: tally(cast, 'food', FOOD.map((f) => f.name)) },
    { bisaya: 'Unsa ato Isul-ob?', english: 'Palette', data: tally(cast, 'palette', PALETTES.map((p) => p.name)) },
  ]

  const attendance = ATTENDANCE.map((a) => ({
    label: a.label,
    english: a.sublabel,
    count: cast.filter((v) => v.attending === a.sublabel).length,
  }))

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-10">
      <header className="mb-8">
        <span className="chip bg-navy text-butter">Committee only</span>
        <h1 className="display mt-3 text-[clamp(2.25rem,10vw,3rem)] text-navy">Results</h1>

        {/* A hero number, not a chart — one value has no shape worth plotting. */}
        <p className="mt-5 flex items-baseline gap-2">
          <span className="display text-6xl tabular-nums text-navy">{cast.length}</span>
          <span className="text-lg font-bold text-slate/60">/ {ROSTER.length} nakaboto</span>
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-navy/10">
          <div
            className="h-full rounded-full bg-navy transition-[width] duration-500"
            style={{ width: `${(cast.length / ROSTER.length) * 100}%` }}
          />
        </div>
      </header>

      <section className="mb-10">
        <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-slate/55">
          Headcount
        </h2>
        <div className="mt-3 grid grid-cols-3 gap-2.5">
          {attendance.map((a) => (
            <div key={a.label} className="card p-3.5">
              <p className="display text-3xl tabular-nums text-navy">{a.count}</p>
              <p className="mt-1 text-[0.8rem] font-bold leading-tight text-navy">{a.label}</p>
              <p className="mt-0.5 text-xs text-slate/60">{a.english}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="space-y-9">
        {questions.map((q) => {
          const max = Math.max(1, ...q.data.map((d) => d.count))
          return (
            <section key={q.english}>
              <h2 className="display text-xl text-navy">{q.bisaya}</h2>
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate/50">
                {q.english}
              </p>

              {/* One measure, one series — identity comes from the row label, so every
                  bar carries the same hue rather than implying categories that aren't there. */}
              <ol className="space-y-3">
                {q.data.map((d) => {
                  const pct = cast.length ? Math.round((d.count / cast.length) * 100) : 0
                  return (
                    <li key={d.label}>
                      <div className="mb-1.5 flex items-baseline justify-between gap-3">
                        <span className="text-sm font-semibold text-navy">{d.label}</span>
                        <span className="shrink-0 text-sm tabular-nums text-slate/70">
                          <strong className="font-bold text-navy">{d.count}</strong>
                          <span className="ml-1.5 text-xs">{pct}%</span>
                        </span>
                      </div>
                      <div className="h-3 rounded-r-[4px] bg-navy/8">
                        <div
                          className="h-full rounded-r-[4px] bg-navy transition-[width] duration-500"
                          style={{ width: `${(d.count / max) * 100}%` }}
                        />
                      </div>
                    </li>
                  )
                })}
              </ol>
            </section>
          )
        })}
      </div>

      <section className="mt-11">
        <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-slate/55">
          Wala pa nakaboto · {missing.length} still missing
        </h2>
        {missing.length === 0 ? (
          <p className="mt-3 font-semibold text-navy">Kompleto na — everyone has voted.</p>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {missing.map((n) => (
              <li key={n} className="chip bg-navy/6 text-slate normal-case tracking-normal">
                {n}
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-10 text-center text-xs leading-relaxed text-slate/55">
        Raw ballots live in the <strong className="font-semibold">Votes</strong> tab of the
        reunion workbook, one row per member.
      </p>
    </main>
  )
}
