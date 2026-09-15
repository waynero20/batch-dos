'use client'

/**
 * The one shell every screen wears.
 *
 * Three rows on a locked `100dvh`, and only the middle one flexes. Nothing here may
 * scroll: content that cannot fit becomes a Deck rather than a column running past
 * the fold. `min-h-0` on the middle row is what lets its child shrink instead of
 * pushing the footer off-screen — without it a tall deck would win the fight.
 *
 * `dvh` rather than `vh` so the mobile keyboard, which shrinks the visual viewport on
 * the identity screen, compresses the list instead of hiding the button.
 */
export function Screen({
  index,
  total,
  short,
  title,
  note,
  name,
  furthest,
  onBack,
  onJump,
  footer,
  children,
}: {
  index: number
  total: number
  short: string
  title: string
  note: string | null
  name?: string
  /** Highest screen reached, so answered ones stay reachable and later ones do not. */
  furthest: number
  onBack: () => void
  onJump: (i: number) => void
  footer: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="grid h-[100dvh] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden">
      <header>
        <div className="shell flex items-center justify-between gap-3 pb-2.5 pt-[max(0.75rem,env(safe-area-inset-top))]">
          {/* Nothing to go back to on the first screen, and a dead control there would
              read as broken. The slot stays, so the eyebrow does not shift. */}
          {index > 0 ? (
            <button
              type="button"
              onClick={onBack}
              className="btn btn-ghost btn-xs -ml-2 gap-1 font-normal opacity-55"
            >
              <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 6-6 6 6 6" />
              </svg>
              Back
            </button>
          ) : (
            <a href="/?intro" className="eyebrow -ml-0.5 underline-offset-4 hover:underline">
              Watch the intro
            </a>
          )}

          <span className="eyebrow">
            {String(index + 1).padStart(2, '0')} · {short}
          </span>

          <span className="max-w-[9rem] truncate text-xs opacity-45 lg:max-w-[16rem] lg:text-sm">
            {name ?? ''}
          </span>
        </div>

        {/* Edge to edge on purpose — a rule that stops at the shell's padding reads as
            a component; one that runs the full width reads as the page's own progress. */}
        <div className="flex gap-px">
          {Array.from({ length: total }, (_, i) => {
            const reachable = i <= furthest && i !== index
            return (
              <button
                key={i}
                type="button"
                disabled={!reachable}
                onClick={() => onJump(i)}
                aria-label={`Step ${i + 1} of ${total}`}
                aria-current={i === index ? 'step' : undefined}
                className="group flex-1 py-2 disabled:cursor-default"
              >
                <span
                  className={`block h-[3px] transition-colors ${
                    i <= index ? 'bg-primary' : 'bg-base-300'
                  } ${reachable ? 'group-hover:bg-primary/60' : ''}`}
                />
              </button>
            )
          })}
        </div>
      </header>

      <div className="shell flex min-h-0 flex-col pt-3 lg:pt-6">
        <div key={index} className="rise flex min-h-0 flex-1 flex-col">
          <h1 className="h-display shrink-0 text-[1.875rem] sm:text-[2.25rem] lg:text-[2.75rem]">
            {title}
          </h1>
          {note && (
            <p className="mt-2 max-w-[46ch] shrink-0 text-[0.8125rem] leading-relaxed opacity-55 lg:text-[0.9375rem]">
              {note}
            </p>
          )}
          <div className="mt-4 min-h-0 flex-1 lg:mt-6">{children}</div>
        </div>
      </div>

      <footer className="shell pb-[max(0.875rem,env(safe-area-inset-bottom))] pt-3">
        {footer}
      </footer>
    </section>
  )
}
