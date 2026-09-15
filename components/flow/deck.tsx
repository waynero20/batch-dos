'use client'

import { useRef, useState } from 'react'

/**
 * Options that never scroll the page.
 *
 * Below `md` this is a scroll-snap track, swiped sideways. Cards are ~82% of the
 * track rather than the full width, so the next and previous option stay visibly
 * on screen at the edges. That peek IS the affordance: it shows what else is on
 * offer, not merely that something is, which is more than the dot indicator it
 * replaces ever did. Non-active cards sit back slightly so the peek reads as
 * focus rather than as a layout accident.
 *
 * The track's `px` matches (100% - card width) / 2, which is what lets the first
 * and last card reach the centre under `snap-center`.
 *
 * From `md` up the same children become a grid, because 2-4 cards fit a wide
 * screen at once and swiping a roomy layout would be worse, not sleeker. Either
 * way the block is centred and width-capped, so three cards do not stretch
 * across a 1440px screen.
 *
 * Active index is whichever child's centre is nearest the track's centre,
 * measured from live rects. The previous implementation used
 * `scrollLeft / clientWidth`, which only held while every card was exactly
 * `w-full` with no gap -- true before the peek, false now, and silently wrong
 * for the last card the moment either changes.
 */
export function Deck<T>({
  items,
  cols,
  max = 'max-w-5xl',
  height,
  label = 'Options',
  render,
}: {
  items: readonly T[]
  /** Grid template from `md` up, e.g. "md:grid-cols-3". */
  cols: string
  /** Width cap for the centred block. */
  max?: string
  /**
   * Explicit track height, in `dvh` so it shrinks with the screen — e.g.
   * "h-[min(46dvh,22rem)]".
   *
   * Required for any card whose media is `flex-1`: a venue photo or a palette's
   * swatch field collapses to nothing without a definite height to resolve against.
   * Cards built only from natural-height content leave it off and size themselves.
   */
  height?: string
  /** Names the group for screen readers, e.g. "Dates". */
  label?: string
  render: (item: T, index: number) => React.ReactNode
}) {
  const [active, setActive] = useState(0)
  const track = useRef<HTMLDivElement>(null)
  const pending = useRef(false)

  /** Index of the child whose centre is closest to the track's centre. */
  const nearest = (el: HTMLElement) => {
    const mid = el.getBoundingClientRect().left + el.clientWidth / 2
    let best = 0
    let bestDist = Infinity
    for (let i = 0; i < el.children.length; i++) {
      const rect = (el.children[i] as HTMLElement).getBoundingClientRect()
      const dist = Math.abs(rect.left + rect.width / 2 - mid)
      if (dist < bestDist) {
        bestDist = dist
        best = i
      }
    }
    return best
  }

  const go = (i: number) => {
    const el = track.current
    const card = el?.children[i] as HTMLElement | undefined
    if (!el || !card) return
    // Rect-based, so it does not care about offsetParent, gaps or padding.
    const delta =
      card.getBoundingClientRect().left +
      card.getBoundingClientRect().width / 2 -
      (el.getBoundingClientRect().left + el.clientWidth / 2)
    el.scrollTo({ left: el.scrollLeft + delta, behavior: 'smooth' })
  }

  return (
    <div className={`mx-auto flex w-full flex-col ${max}`}>
      <div
        ref={track}
        tabIndex={0}
        role="group"
        aria-label={label}
        onScroll={(e) => {
          // Coalesce to one measurement per frame; scroll fires far faster.
          if (pending.current) return
          pending.current = true
          const el = e.currentTarget
          requestAnimationFrame(() => {
            pending.current = false
            if (el.clientWidth > 0) setActive(nearest(el))
          })
        }}
        onKeyDown={(e) => {
          const last = items.length - 1
          if (e.key === 'ArrowRight') go(Math.min(active + 1, last))
          else if (e.key === 'ArrowLeft') go(Math.max(active - 1, 0))
          else if (e.key === 'Home') go(0)
          else if (e.key === 'End') go(last)
          else return
          e.preventDefault()
        }}
        className={`flex min-h-0 snap-x snap-mandatory scroll-smooth gap-3 overflow-x-auto overflow-y-hidden overscroll-x-contain rounded-2xl px-[9%] [scrollbar-width:none] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 md:grid md:gap-5 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden ${
          height ? `${height} items-stretch md:auto-rows-fr` : 'items-center md:auto-rows-min'
        } ${cols}`}
      >
        {items.map((item, i) => (
          <div
            key={i}
            style={{ transitionTimingFunction: 'var(--ease-soft)' }}
            className={`min-h-0 w-[82%] shrink-0 snap-center transition-[opacity,transform] duration-500 md:w-auto md:scale-100 md:opacity-100 ${
              height ? 'h-full' : ''
            } ${i === active ? '' : 'scale-[0.96] opacity-60'}`}
          >
            {render(item, i)}
          </div>
        ))}
      </div>
    </div>
  )
}
