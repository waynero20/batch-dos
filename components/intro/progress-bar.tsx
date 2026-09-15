import { timingVars } from './css-vars'

/** A hairline that fills over the current scene only. Remount it (by key) to restart. */
export function ProgressBar({ duration }: { duration: number }) {
  return (
    <div className="intro-progress" aria-hidden="true">
      <span style={timingVars({ d: duration })} />
    </div>
  )
}
