'use client'

import { ATTENDANCE, planRows } from '@/lib/ballot'
import { OptionCard } from '../option-card'

/** One glyph each: a tick, a dash, a cross. */
const GLYPH = ['m4 12.5 5.2 5.2L20 7', 'M5 12h14', 'm6 6 12 12M18 6 6 18'] as const

/**
 * Green, yellow, red — attendance reads as its own colour, not the one house accent.
 * Written out in full: Tailwind only picks up classes it can see as literal strings,
 * not ones built from a template at runtime.
 */
const TONE = [
  { idle: 'bg-success/10 text-success', selected: 'bg-success text-success-content' },
  { idle: 'bg-warning/10 text-warning', selected: 'bg-warning text-warning-content' },
  { idle: 'bg-error/10 text-error', selected: 'bg-error text-error-content' },
] as const

/** "14 September" — the day they last voted, not the hour. */
const dayOf = (iso: string) => {
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? null
    : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
}

export function RsvpStep({
  rows,
  votedAt,
  value,
  onChoose,
}: {
  rows: ReturnType<typeof planRows>
  /** When this member last voted, if they already have a ballot on record. */
  votedAt?: string | null
  value?: string
  onChoose: (id: string) => void
}) {
  const voted = votedAt ? dayOf(votedAt) : null

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center">
      {/* Said here rather than on every screen: this is the one place it changes what
          the button does. */}
      {votedAt && (
        <p className="mb-3 shrink-0 text-center text-[0.8125rem] text-primary">
          {voted ? `You voted on ${voted}.` : 'You have already voted.'} Submitting
          replaces that.
        </p>
      )}

      {/* The receipt. The only place the running plan survives — everywhere else it
          was furniture, here it is the thing you check before committing. */}
      <dl className="grid w-full shrink-0 grid-cols-2 gap-px overflow-hidden rounded-[1.125rem] border border-base-300 bg-base-300 sm:grid-cols-4">
        {rows.map((r) => (
          <div key={r.label} className="bg-base-100 px-3 py-2.5">
            <dt className="eyebrow">{r.label}</dt>
            <dd className="mt-1 truncate text-[0.8125rem] font-medium">{r.value ?? '—'}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 grid w-full gap-2.5 sm:grid-cols-3 lg:mt-6 lg:gap-4">
        {ATTENDANCE.map((a, i) => {
          const selected = value === a.id
          const tone = TONE[i]!
          return (
            <OptionCard key={a.id} selected={selected} showCheck={false} onSelect={() => onChoose(a.id)}>
              <div className="flex items-center justify-center gap-3 px-4 py-3.5 sm:flex-col sm:gap-2.5 sm:py-6">
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
                    selected ? tone.selected : tone.idle
                  }`}
                >
                  <svg
                    aria-hidden
                    viewBox="0 0 24 24"
                    className="size-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={GLYPH[i]} />
                  </svg>
                </span>
                <span className="h-display text-lg lg:text-xl">{a.label}</span>
              </div>
            </OptionCard>
          )
        })}
      </div>
    </div>
  )
}
