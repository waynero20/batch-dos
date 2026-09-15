import type { CSSProperties } from 'react'
import type { FinalScene } from '@/lib/intro/types'
import { ms, timingVars } from '../css-vars'
import { Phrase } from './phrase'

type Props = {
  scene: FinalScene
  /** The connector the previous scene ended on ("si"), which gives way to this one's. */
  fromConnector?: string
}

/** The names are gone. A beat of nothing. Then the whole batch. */
export function FinalLine({ scene, fromConnector }: Props) {
  const arrive = { '--delay': ms(scene.stillness) } as CSSProperties
  const ending = { '--delay': ms(scene.stillness + 250) } as CSSProperties

  return (
    <div
      className="intro-scene intro-fades intro-final"
      style={timingVars({ d: scene.duration, in: scene.fadeIn, out: scene.fadeOut })}
    >
      <Phrase
        lead={scene.phrase}
        connector={
          <span className="intro-connector-swap">
            {fromConnector && <span className="intro-connector-from">{fromConnector}</span>}
            <span className="intro-reveal" style={arrive}>
              {scene.connector}
            </span>
          </span>
        }
      >
        <span className="intro-reveal" style={ending}>
          {scene.ending}
        </span>
      </Phrase>
    </div>
  )
}
