export function SkipButton({ onSkip }: { onSkip: () => void }) {
  return (
    <button type="button" className="intro-skip" onClick={onSkip} aria-label="Skip intro">
      Skip <span aria-hidden="true">→</span>
    </button>
  )
}
