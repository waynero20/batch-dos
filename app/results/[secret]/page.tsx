import { notFound } from 'next/navigation'
import { ATTENDANCE, DATES, FOOD, PALETTES, VENUES } from '@/lib/ballot'
import { ROSTER } from '@/lib/roster'
import { hasVoted, readVotes, type VoteRow } from '@/lib/sheets'

export const dynamic = 'force-dynamic'

const tally = (rows: VoteRow[], field: keyof VoteRow, options: readonly string[]) =>
  options
    .map((label) => ({ label, count: rows.filter((r) => r[field] === label).length }))
    .sort((a, b) => b.count - a.count)

export default async function ResultsPage({ params }: { params: Promise<{ secret: string }> }) {
  const { secret } = await params
  const expected = process.env.RESULTS_SECRET

  // An unset secret must not mean "open to everyone".
  if (!expected || secret !== expected) notFound()

  const cast = (await readVotes()).filter(hasVoted)
  const missing = ROSTER.filter((n) => !cast.some((v) => v.name === n))

  const questions = [
    { title: 'When', data: tally(cast, 'date', DATES.map((d) => d.label)) },
    { title: 'Where', data: tally(cast, 'venue', VENUES.map((v) => v.name)) },
    { title: 'Food', data: tally(cast, 'food', FOOD.map((f) => f.name)) },
    { title: 'Dress code', data: tally(cast, 'palette', PALETTES.map((p) => p.name)) },
  ]

  return (
    <main className="mx-auto w-full max-w-xl px-6 py-14">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.18em] opacity-45">
          Committee only
        </p>
        <h1 className="h-display mt-2 text-3xl">Results</h1>

        {/* A hero number, not a chart — one value has no shape worth plotting. */}
        <div className="mt-6 flex items-baseline gap-2">
          <span className="text-5xl font-semibold tabular-nums tracking-tight">{cast.length}</span>
          <span className="opacity-45">of {ROSTER.length} voted</span>
        </div>
        <progress
          className="progress progress-primary mt-3 h-1.5 w-full"
          value={cast.length}
          max={ROSTER.length}
        />
      </header>

      <div className="stats stats-horizontal mt-8 w-full border border-base-300 bg-base-100">
        {ATTENDANCE.map((a) => (
          <div key={a.id} className="stat px-4 py-3">
            <div className="stat-value text-2xl tabular-nums">
              {cast.filter((v) => v.attending === a.label).length}
            </div>
            <div className="stat-desc mt-0.5 text-xs opacity-60">{a.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-10 space-y-9">
        {questions.map((q) => {
          const max = Math.max(1, ...q.data.map((d) => d.count))
          return (
            <section key={q.title}>
              <h2 className="text-xs font-medium uppercase tracking-[0.18em] opacity-45">
                {q.title}
              </h2>

              {/* One measure, one series — identity comes from the row label, so every
                  bar carries the same hue rather than implying categories that aren't there. */}
              <ol className="mt-3.5 space-y-3">
                {q.data.map((d) => (
                  <li key={d.label}>
                    <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                      <span className="font-medium">{d.label}</span>
                      <span className="shrink-0 tabular-nums opacity-50">
                        <span className="font-semibold text-base-content">{d.count}</span>
                        <span className="ml-1.5 text-xs">
                          {cast.length ? Math.round((d.count / cast.length) * 100) : 0}%
                        </span>
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-base-200">
                      <div
                        className="h-full rounded-full bg-primary transition-[width] duration-500"
                        style={{ width: `${(d.count / max) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )
        })}
      </div>

      <section className="mt-12">
        <h2 className="text-xs font-medium uppercase tracking-[0.18em] opacity-45">
          Not yet voted · {missing.length}
        </h2>
        {missing.length === 0 ? (
          <p className="mt-3 font-medium">Everyone has voted.</p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {missing.map((n) => (
              <span key={n} className="badge badge-sm border-0 bg-base-200 font-normal opacity-70">
                {n}
              </span>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
