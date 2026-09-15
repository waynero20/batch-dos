'use client'

/**
 * The chrome every choosable option shares: the border, the selected ring, and the
 * check. Deliberately unopinionated about what goes inside — each screen composes its
 * own media and body, because a venue photo has to flex to the deck's height while a
 * palette's swatch field is fixed.
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
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`group relative flex h-full w-full flex-col overflow-hidden rounded-box border text-left transition-[border-color,background-color] duration-150 ${
        selected ? 'border-primary ring-2 ring-primary' : 'border-base-300 hover:border-base-content/25'
      } ${className}`}
    >
      {/* Top-right: every plate sets its own type top-left or bottom-left, so this is
          the one corner that never collides. */}
      {selected && showCheck && (
        <span
          aria-hidden
          className="absolute right-3 top-3 z-10 flex size-7 items-center justify-center rounded-full bg-primary text-primary-content shadow-sm"
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
