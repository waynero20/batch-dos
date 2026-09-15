'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { NamesScene } from '@/lib/intro/types'
import { nameSchedule } from '@/lib/intro/timing'
import { timingVars } from '../css-vars'
import { Phrase } from './phrase'

/**
 * Below this a name is just swapped. A short name needs every millisecond fully visible to be
 * read; spending 170 ms of it fading in would undo the readable pace.
 */
const ARRIVAL_MIN_MS = 300

type Props = {
  scene: NamesScene
  names: readonly string[]
  paused: boolean
  reducedMotion: boolean
}

/** Only the name re-renders; the phrase is static markup that never changes. */
export function NameSequence({ scene, names, paused, reducedMotion }: Props) {
  const schedule = useMemo(() => {
    const { names: list, intervals } = nameSchedule(scene, names, reducedMotion)
    let t = 0
    const starts = intervals.map((x) => ((t += x), t - x))
    return { names: list, intervals, starts }
  }, [scene, names, reducedMotion])

  const [index, setIndex] = useState(0)
  const elapsed = useRef(0)

  // Driven by elapsed time, not a chain of timeouts: a chain gains a few ms of latency per
  // name, which over 70 names would push the last ones past the end of the scene.
  useEffect(() => {
    if (paused) return
    const { starts } = schedule
    const since = performance.now()
    const base = elapsed.current
    let id = 0

    const tick = () => {
      const now = base + (performance.now() - since)
      let i = 0
      while (i + 1 < starts.length && starts[i + 1]! <= now) i++
      setIndex(i)
      if (i + 1 < starts.length) id = window.setTimeout(tick, starts[i + 1]! - now)
    }
    tick()

    return () => {
      window.clearTimeout(id)
      elapsed.current = base + (performance.now() - since)
    }
  }, [paused, schedule])

  const arrives = !reducedMotion && (schedule.intervals[index] ?? 0) >= ARRIVAL_MIN_MS

  return (
    <div className="intro-scene intro-names" style={timingVars({ d: scene.duration, in: 900 })}>
      <div className="intro-reveal">
        <Phrase lead={scene.phrase} connector={scene.connector}>
          <span key={arrives ? index : 'swap'} className={arrives ? 'intro-name is-arriving' : 'intro-name'}>
            {schedule.names[index]}
          </span>
        </Phrase>
      </div>
    </div>
  )
}
