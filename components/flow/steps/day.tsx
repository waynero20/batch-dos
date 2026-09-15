'use client'

import { PROGRAM } from '@/lib/program'

/**
 * The one screen that shows rather than asks.
 *
 * The full fifteen-moment timeline cannot fit a viewport, so it lives on `/done`,
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
    <div className="flex h-full min-h-0 flex-col lg:max-w-3xl">
      <dl className="grid shrink-0 grid-cols-3 gap-px overflow-hidden rounded-box border border-base-300 bg-base-300">
        {stats.map(([label, value]) => (
          <div key={label} className="bg-base-100 px-4 py-3 lg:px-5 lg:py-4">
            <dt className="caption">{label}</dt>
            <dd className="folio mt-1 text-[1.375rem] lg:text-[1.75rem]">{value}</dd>
          </div>
        ))}
      </dl>

      <ol className="mt-4 min-h-0 flex-1 lg:mt-6">
        {anchors.map((item) => (
          <li
            key={item.title}
            className="flex items-baseline gap-4 border-b border-base-300/70 py-2.5 lg:py-3"
          >
            <span className="w-[4.5rem] shrink-0 text-[0.8125rem] tabular-nums opacity-45 lg:text-sm">
              {item.start}
            </span>
            <span className="min-w-0 flex-1 truncate text-[0.9375rem] font-medium lg:text-base">
              {item.title}
            </span>
            {item.end && (
              <span className="shrink-0 text-[0.75rem] opacity-40 lg:text-[0.8125rem]">
                {item.end}
              </span>
            )}
          </li>
        ))}
      </ol>

      <p className="pull shrink-0 border-l-2 border-primary pl-4 text-[1.125rem] sm:text-[1.375rem] lg:pl-5 lg:text-[1.5rem]">
        Everyone gets a moment to share what the last nine years looked like.
      </p>
      <p className="caption mt-1.5 shrink-0">The full programme is on the last screen.</p>
    </div>
  )
}
