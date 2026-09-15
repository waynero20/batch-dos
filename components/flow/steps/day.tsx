'use client'

import { PROGRAM } from '@/lib/program'

/**
 * The one screen that shows rather than asks.
 *
 * The full fourteen-moment timeline cannot fit a viewport, so it lives on `/done`,
 * where there is room to scroll. Here it is three anchors and a count — enough to
 * picture the day before the last question.
 */
export function DayStep() {
  const first = PROGRAM[0]!
  const last = PROGRAM.at(-1)!
  const headline = PROGRAM.find((i) => i.title === 'Asa Na Ta?')
  const games = PROGRAM.filter((i) => i.kind === 'games').length

  const anchors = [first, headline, last].filter((i) => i !== undefined)

  const stats = [
    ['Starts', first.start],
    ['Moments', String(PROGRAM.length)],
    ['Games', String(games)],
  ] as const

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center">
      <dl className="grid w-full shrink-0 grid-cols-3 gap-px overflow-hidden rounded-[1.125rem] border border-base-300 bg-base-300">
        {stats.map(([label, value]) => (
          <div key={label} className="bg-base-100 px-3 py-3.5 lg:py-4">
            <dt className="caption">{label}</dt>
            <dd className="folio mt-1 text-[1.375rem] lg:text-[1.625rem]">{value}</dd>
          </div>
        ))}
      </dl>

      <ol className="mx-auto mt-4 w-full max-w-sm lg:mt-5">
        {anchors.map((item) => (
          <li
            key={item.title}
            className="grid grid-cols-[4.25rem_minmax(0,1fr)_3.5rem] items-baseline gap-2 border-b border-base-300/60 py-2.5 last:border-0"
          >
            <span className="text-right text-[0.8125rem] tabular-nums opacity-40">{item.start}</span>
            <span className="truncate text-left text-[0.9375rem] font-medium lg:text-base">
              {item.title}
            </span>
            <span className="text-right text-[0.75rem] tabular-nums opacity-35">{item.end ?? ''}</span>
          </li>
        ))}
      </ol>

      <p className="pull mt-5 max-w-[30ch] text-center text-[1.125rem] sm:text-[1.375rem] lg:mt-6 lg:text-[1.5rem]">
        Everyone gets a moment to share what the last nine years looked like.
      </p>
      <p className="caption mt-2">The full programme is on the last screen.</p>
    </div>
  )
}
