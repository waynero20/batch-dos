'use client'

import { ATTENDANCE, planRows } from '@/lib/ballot'
import { OptionCard } from '../option-card'

/** One glyph each: a tick, a dash, a cross. */
const GLYPH = ['m4 12.5 5.2 5.2L20 7', 'M5 12h14', 'm6 6 12 12M18 6 6 18'] as const

export function RsvpStep({
  rows,
  value,
  onChoose,
}: {
  rows: ReturnType<typeof planRows>
  value?: string
  onChoose: (id: string) => void
}) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-4 lg:flex-row-reverse lg:items-start lg:gap-10">
      {/* The receipt. The only place the running plan survives — everywhere else it
          was furniture, here it is the thing you check before committing. */}
      <dl className="shrink-0 divide-y divide-base-300/70 overflow-hidden rounded-box border border-base-300 lg:w-80">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex items-baseline justify-between gap-3 px-4 py-2 lg:px-5 lg:py-3"
          >
            <dt className="eyebrow">{r.label}</dt>
            <dd className="truncate text-[0.8125rem] font-medium lg:text-sm">{r.value ?? '—'}</dd>
          </div>
        ))}
      </dl>

      <div className="grid min-h-0 flex-1 content-start gap-2.5 sm:grid-cols-3 lg:gap-4">
        {ATTENDANCE.map((a, i) => {
          const selected = value === a.id
          return (
            <OptionCard key={a.id} selected={selected} showCheck={false} onSelect={() => onChoose(a.id)}>
              <div className="flex items-center gap-3.5 px-4 py-3.5 sm:flex-col sm:items-start sm:gap-0 sm:px-5 sm:py-5">
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full sm:mb-3 ${
                    selected ? 'bg-primary text-primary-content' : 'bg-base-200 opacity-45'
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
                <span className="h-display text-lg sm:text-xl lg:text-2xl">{a.label}</span>
              </div>
            </OptionCard>
          )
        })}
      </div>
    </div>
  )
}
