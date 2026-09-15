import type { MemoryScene as MemorySceneData } from '@/lib/intro/types'
import { ms, timingVars } from '../css-vars'
import { Print } from '../print'

/** Opening narration, a lone photograph, or a year with its photograph and a line. */
export function MemoryScene({ scene }: { scene: MemorySceneData }) {
  const { year, text, photo } = scene
  const variant = photo ? (year || text ? 'full' : 'photo') : 'text'

  // The year lands first so the timeline reads before the words do.
  const photoDelay = year ? 180 : 0
  const textDelay = photo ? photoDelay + 420 : year ? 240 : 0

  return (
    <div
      className="intro-scene intro-fades intro-memory"
      data-variant={variant}
      style={timingVars({ d: scene.duration, in: scene.fadeIn, out: scene.fadeOut })}
    >
      {year && <p className="intro-year intro-reveal">{year}</p>}
      {photo && (
        <Print
          photo={photo}
          className="intro-develop"
          style={{ '--delay': ms(photoDelay) } as React.CSSProperties}
        />
      )}
      {text && (
        <p className="intro-narration intro-reveal" style={{ '--delay': ms(textDelay) } as React.CSSProperties}>
          {text}
        </p>
      )}
    </div>
  )
}
