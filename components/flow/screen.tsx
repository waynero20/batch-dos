'use client'

import { FLOW_STEPS } from '@/lib/ballot'

/**
 * The one shell every screen wears.
 *
 * Three rows on a locked `100dvh`, and the middle one centres its contents on both
 * axes — every question is a single composition in the middle of the screen rather
 * than a page that starts at the top left. Nothing here may scroll: content that
 * cannot fit becomes a Deck, and the Deck caps its own height in `dvh`.
 *
 * `dvh` rather than `vh` so the mobile keyboard, which shrinks the visual viewport on
 * the identity screen, compresses the composition instead of hiding the button.
 */
export function Screen({
  index,
  total,
  title,
  name,
  furthest,
  dir,
  enter,
  zooming,
  onBack,
  onJump,
  footer,
  children,
}: {
  index: number
  total: number
  title: string
  name?: string
  /** Highest screen reached, so answered ones stay reachable and later ones do not. */
  furthest: number
  /** Which way the last move went, so the entrance animation agrees with the gesture. */
  dir: 'fwd' | 'back'
  /** 'zoom' when the previous screen was left by picking, not by pressing Next. */
  enter: 'slide' | 'zoom'
  /** True while the outgoing screen pulls away, just before the step changes. */
  zooming: boolean
  onBack: () => void
  onJump: (i: number) => void
  footer: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="grid h-[100dvh] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden">
      <header className="pt-[max(0.625rem,env(safe-area-inset-top))]">
        <div className="shell flex h-9 items-center justify-between gap-3">
          {/* Nothing to go back to on the first screen, and a dead control there would
              read as broken — the intro takes the slot instead. */}
          {index > 0 ? (
            <button type="button" onClick={onBack} className="ghost -ml-2 text-sm">
              <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 6-6 6 6 6" />
              </svg>
              Back
            </button>
          ) : (
            <a href="/?intro" className="ghost eyebrow -ml-2 opacity-40">
              Watch the intro
            </a>
          )}

          <span className="max-w-[10rem] truncate text-xs opacity-35 lg:max-w-[18rem] lg:text-sm">
            {name ?? ''}
          </span>
        </div>

        {/* Centred and narrow: an edge-to-edge rule fights a centred composition. */}
        <div className="mx-auto mt-2.5 flex w-full max-w-[13rem] gap-1 px-5 lg:max-w-[16rem]">
          {Array.from({ length: total }, (_, i) => {
            const reachable = i <= furthest && i !== index
            return (
              <button
                key={i}
                type="button"
                disabled={!reachable}
                onClick={() => onJump(i)}
                aria-label={FLOW_STEPS[i]?.short ?? `Step ${i + 1}`}
                aria-current={i === index ? 'step' : undefined}
                className="group flex-1 py-1.5 disabled:cursor-default"
              >
                <span
                  className={`block h-[3px] rounded-full transition-colors duration-500 ${
                    i <= index ? 'bg-primary' : 'bg-base-300'
                  } ${reachable ? 'group-hover:bg-primary/50' : ''}`}
                />
              </button>
            )
          })}
        </div>
      </header>

      <div className="shell flex min-h-0 items-center justify-center">
        <div
          key={index}
          data-dir={dir}
          data-enter={enter}
          className={`flex min-h-0 w-full flex-col items-center py-2 ${zooming ? 'zooming' : ''}`}
        >
          <h1 className="si si-1 h-display mt-2.5 max-w-[16ch] shrink-0 text-center text-[2rem] sm:text-[2.5rem] lg:mt-3 lg:text-[3rem]">
            {title}
          </h1>


          <div className="si si-2 mt-5 min-h-0 w-full lg:mt-7">{children}</div>
        </div>
      </div>

      <footer className="shell flex flex-col items-center pb-[max(0.875rem,env(safe-area-inset-bottom))] pt-3">
        {footer}
      </footer>
    </section>
  )
}
