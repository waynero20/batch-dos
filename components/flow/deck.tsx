'use client'

import { useRef, useState } from 'react'

/**
 * Options that never scroll the page.
 *
 * Below `md` this is a scroll-snap track — one card per viewport, swiped sideways,
 * with a position readout underneath. From `md` up the same children become a grid,
 * because 2–4 cards fit a wide screen at once and swiping a roomy layout would be
 * worse, not sleeker.
 *
 * The track carries no gap: children are exactly `w-full`, so `scrollLeft /
 * clientWidth` rounds to the active index without any arithmetic.
 */
export function Deck<T>({
  items,
  cols,
  fill = true,
  render,
}: {
  items: readonly T[]
  /** Grid template from `md` up, e.g. "md:grid-cols-3". */
  cols: string
  /**
   * Whether cards stretch to the screen's full height from `md` up.
   *
   * On by default, and not cosmetic: a card whose media is `flex-1` — a venue photo,
   * a palette's swatch field — collapses to nothing in a content-sized grid row,
   * because its `h-full` has no definite height to resolve against. Turn it off only
   * for cards built entirely from natural-height content, which then centre instead.
   */
  fill?: boolean
  render: (item: T, index: number) => React.ReactNode
}) {
  const [active, setActive] = useState(0)
  const track = useRef<HTMLDivElement>(null)

  const go = (i: number) => {
    const el = track.current
    if (!el) return
    el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' })
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        ref={track}
        onScroll={(e) => {
          const el = e.currentTarget
          if (el.clientWidth > 0) setActive(Math.round(el.scrollLeft / el.clientWidth))
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') go(Math.min(active + 1, items.length - 1))
          if (e.key === 'ArrowLeft') go(Math.max(active - 1, 0))
        }}
        className={`flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain [scrollbar-width:none] md:grid md:gap-5 md:overflow-visible [&::-webkit-scrollbar]:hidden ${
          fill
            ? 'items-stretch md:auto-rows-fr'
            : 'items-center md:auto-rows-min md:content-center'
        } ${cols}`}
      >
        {items.map((item, i) => (
          <div
            key={i}
            className={`min-h-0 w-full shrink-0 snap-center md:w-auto ${fill ? 'h-full' : ''}`}
          >
            {render(item, i)}
          </div>
        ))}
      </div>

      {items.length > 1 && (
        <div className="mt-2.5 flex shrink-0 items-center justify-center gap-1.5 md:hidden">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => go(i)}
              aria-label={`Show option ${i + 1}`}
              className="py-1.5"
            >
              <span
                className={`block h-1 rounded-full transition-all ${
                  i === active ? 'w-5 bg-primary' : 'w-1.5 bg-base-300'
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
