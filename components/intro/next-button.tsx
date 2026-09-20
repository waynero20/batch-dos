/** The forward CTA. Sits beside Skip, which stays recessive: this is the one to press. */
export function NextButton({ onNext }: { onNext: () => void }) {
  return (
    <button type="button" className="intro-next" onClick={onNext} aria-label="Next scene">
      Next <span aria-hidden="true">→</span>
    </button>
  )
}
