import type { CSSProperties } from 'react'
import type { LinesScene } from '@/lib/intro/types'
import { sceneDuration } from '@/lib/intro/timing'
import { ms, timingVars } from '../css-vars'

/** Lines arrive one by one and stay; the scene as a whole carries them out together. */
export function QuietLines({ scene }: { scene: LinesScene }) {
  return (
    <div
      className="intro-scene intro-fades intro-lines"
      data-tone={scene.tone}
      style={timingVars({ d: sceneDuration(scene), in: scene.fadeIn, out: scene.fadeOut })}
    >
      <div className="intro-lines-stack">
        {scene.lines.map((line, i) => (
          <p
            key={i}
            className="intro-line intro-reveal"
            style={{ '--delay': ms(i * scene.stagger) } as CSSProperties}
          >
            {line}
          </p>
        ))}
      </div>
    </div>
  )
}
