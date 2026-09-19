'use client'

/**
 * The chrome every choosable option shares: the border, the selected ring, and the
 * check. Deliberately unopinionated about what goes inside — each screen composes its
 * own media and body, because a venue photo has to flex to the deck's height while a
 * caterer's price list is natural height.
 *
 * All the styling lives in `.opt`, so hover, press and selected states move on the
 * same curve as the rest of the flow.
 */
export function OptionCard({
  selected,
  onSelect,
  showCheck = true,
  className = '',
  children,
}: {
  selected: boolean
  onSelect: () => void
  /** Off where the card's own artwork already carries a tick, so the corner badge
   *  does not put a second one on the same row. */
  showCheck?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <button type="button" onClick={onSelect} aria-pressed={selected} className={`opt group ${className}`}>
      {/* Top-right: every plate sets its own type centred or bottom-left, so this is
          the one corner that never collides. */}
      {showCheck && (
        <span
          aria-hidden
          className={`absolute right-3 top-3 z-10 flex size-7 items-center justify-center rounded-full bg-primary text-primary-content transition-all duration-300 ${
            selected ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
          }`}
          style={{ transitionTimingFunction: 'var(--ease-soft)' }}
        >
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="m4 12.5 5.2 5.2L20 7" />
          </svg>
        </span>
      )}
      {children}
    </button>
  )
}
