import type { CSSProperties } from 'react'
import type { MontageScene } from '@/lib/intro/types'
import { sceneDuration } from '@/lib/intro/timing'
import { ms, timingVars } from '../css-vars'
import { Print } from '../print'

/**
 * Prints dealt onto a pile, like flipping through a shoebox. Every card is mounted up front
 * and timed purely with animation-delay, so pacing never depends on JS timers.
 *
 * Each card: lands on top (deal) → darkens as the next one covers it → slides off the pile.
 */
export function PhotoMontage({ scene }: { scene: MontageScene }) {
  const { photos, interval } = scene
  const last = photos.length - 1

  return (
    <div
      className="intro-scene intro-fades intro-montage"
      style={timingVars({ d: sceneDuration(scene), out: scene.fadeOut })}
    >
      <div className="intro-stack">
        {photos.map((photo, i) => {
          // Alternate the hand the print comes from, with a little variation so no two match.
          const side = i % 2 === 0 ? -1 : 1
          const wobble = (i * 7) % 3
          const style = {
            zIndex: i + 1,
            '--deal-at': ms(i * interval),
            '--covered-at': ms((i + 1) * interval),
            '--recede-at': ms((i + 2) * interval),
            '--fx': `${side * (34 + wobble * 4)}%`,
            '--fy': `${16 + wobble * 6}%`,
            '--fr': `${side * (9 + wobble * 2)}deg`,
            '--rx': `${-side * (10 + wobble * 3)}%`,
          } as CSSProperties

          return (
            <div key={photo.src + i} className="intro-card" data-top={i === last || undefined} style={style}>
              <Print photo={photo} className="intro-card-print" />
            </div>
          )
        })}
      </div>
    </div>
  )
}
