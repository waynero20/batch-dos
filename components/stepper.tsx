'use client'

type Props = {
  labels: readonly string[]
  current: number
  /** Highest step reached, so answered steps stay reachable and future ones do not. */
  furthest: number
  onJump: (step: number) => void
}

export function Stepper({ labels, current, furthest, onJump }: Props) {
  return (
    <ul className="steps steps-horizontal w-full">
      {labels.map((label, i) => {
        const done = i < current
        const reachable = i <= furthest && i !== current

        return (
          <li
            key={label}
            data-content={done ? '✓' : `${i + 1}`}
            className={`step text-[0.625rem] md:text-[0.6875rem] lg:text-xs ${i <= current ? 'step-primary' : ''}`}
            aria-current={i === current ? 'step' : undefined}
          >
            {reachable ? (
              <button
                type="button"
                onClick={() => onJump(i)}
                className="px-1 underline-offset-4 transition-opacity hover:underline hover:opacity-100"
              >
                {label}
              </button>
            ) : (
              <span className={`px-1 ${i === current ? 'font-medium' : 'opacity-45'}`}>{label}</span>
            )}
          </li>
        )
      })}
    </ul>
  )
}
