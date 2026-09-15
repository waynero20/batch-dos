'use client'

import { useMemo, useState } from 'react'
import {
  DATES,
  TRACK_LABEL,
  WEEKDAY_INITIALS,
  candidateMonths,
  monthGrid,
  monthIndexOf,
  type DateId,
} from '@/lib/ballot'

/**
 * The date as an actual calendar.
 *
 * A real month view, paged between the months that hold an option — every day of
 * December is drawn, not only the three that matter, because seeing the 26th sit at
 * the end of its week is the thing a row of cards cannot show. Only the three the
 * batch can pick are targets; everything else is context.
 *
 * Paging stops at the months holding a date. This is a calendar, not a date picker:
 * there is no reason to let anyone wander into March.
 */
export function WhenStep({ value, onChoose }: { value?: string; onChoose: (id: string) => void }) {
  const months = useMemo(() => candidateMonths(), [])

  // Open on the month of an already-chosen date, so coming back lands where you left.
  const [index, setIndex] = useState(() =>
    value ? Math.max(0, monthIndexOf(value as DateId)) : 0,
  )

  const current = months[index]!
  const grid = useMemo(() => monthGrid(current.year, current.month), [current])

  return (
    <div className="mx-auto w-full max-w-[21rem] rounded-[1.5rem] border border-base-300 p-3.5 sm:max-w-sm sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <MonthArrow dir="prev" disabled={index === 0} onClick={() => setIndex((i) => i - 1)} />
        <p className="h-display text-[1.0625rem] sm:text-lg">{grid.label}</p>
        <MonthArrow
          dir="next"
          disabled={index === months.length - 1}
          onClick={() => setIndex((i) => i + 1)}
        />
      </div>

      <div className="mt-3 grid grid-cols-7 gap-0.5">
        {WEEKDAY_INITIALS.map((initial, i) => (
          <span
            key={i}
            aria-hidden
            className="pb-1 text-center text-[0.625rem] font-medium uppercase tracking-[0.12em] opacity-25"
          >
            {initial}
          </span>
        ))}

        {grid.weeks.flat().map((cell) => {
          // A six-week December runs into January, so the 2nd and the 9th show up in
          // its trailing corner. They are context there, not targets — you pick them
          // on January's own page.
          if (cell.dateId && cell.inMonth) {
            const option = DATES.find((d) => d.id === cell.dateId)!
            return (
              <button
                key={cell.iso}
                type="button"
                aria-pressed={value === cell.dateId}
                aria-label={`${option.label} — ${TRACK_LABEL[option.track]}`}
                onClick={() => onChoose(option.id)}
                className="day"
              >
                {cell.day}
              </button>
            )
          }

          return (
            <span
              key={cell.iso}
              aria-hidden
              className={`flex h-10 items-center justify-center text-[0.8125rem] tabular-nums sm:h-11 ${
                cell.inMonth ? 'opacity-30' : 'opacity-0'
              }`}
            >
              {cell.day}
            </span>
          )
        })}
      </div>
    </div>
  )
}

function MonthArrow({
  dir,
  disabled,
  onClick,
}: {
  dir: 'prev' | 'next'
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={dir === 'prev' ? 'Previous month' : 'Next month'}
      className="flex size-8 items-center justify-center rounded-full transition-colors duration-200 disabled:opacity-20 enabled:hover:bg-base-200"
    >
      <svg
        viewBox="0 0 24 24"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={dir === 'prev' ? 'm15 6-6 6 6 6' : 'm9 6 6 6-6 6'} />
      </svg>
    </button>
  )
}
