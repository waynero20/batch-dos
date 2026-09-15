import type { TaraScene as TaraSceneData } from '@/lib/intro/types'
import { timingVars } from '../css-vars'

/** Yellow pad paper, the site's navy, one red pen stroke. The overlay then fades to the RSVP page. */
export function TaraScene({ scene }: { scene: TaraSceneData }) {
  return (
    <div className="intro-scene intro-tara" style={timingVars({ d: scene.duration })}>
      <p className="intro-tara-text">
        {scene.text}
        <svg className="intro-tara-underline" viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden="true">
          <path
            d="M4 15 C 60 7, 130 5, 196 9 S 280 17, 296 8"
            pathLength={1}
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </p>
    </div>
  )
}
