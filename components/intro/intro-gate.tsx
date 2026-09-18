'use client'

import { useCallback, useEffect, useState, useSyncExternalStore, type CSSProperties } from 'react'
import { introConfig } from '@/lib/intro/config'
import { handoffDuration } from '@/lib/intro/timing'
import { ms } from './css-vars'
import { ReunionIntro } from './reunion-intro'
import './intro.css'

const SKIP_FADE_MS = 300

type Phase = 'pending' | 'playing' | 'leaving' | 'done'

/**
 * Covers the RSVP page with the intro on every visit, then fades away to reveal it.
 * There is no "seen it already" skip — Escape or the Skip button is right there for
 * anyone who wants past it. The page underneath is fully rendered the whole time,
 * only inert.
 */
export function IntroGate({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<Phase>('pending')
  const [leaveMs, setLeaveMs] = useState(SKIP_FADE_MS)
  const [startAt, setStartAt] = useState(0)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    // `?intro=6` starts at the 6th scene: handy when checking a replaced photo or line.
    const scene = Number.parseInt(new URLSearchParams(window.location.search).get('intro') ?? '', 10)
    if (scene >= 1 && scene <= introConfig.scenes.length) setStartAt(scene - 1)
    setPhase('playing')
  }, [])

  const leave = useCallback((fadeMs: number) => {
    setLeaveMs(fadeMs)
    setPhase((p) => (p === 'playing' ? 'leaving' : p))
  }, [])

  const end = useCallback(() => leave(handoffDuration(introConfig)), [leave])
  const skip = useCallback(() => leave(SKIP_FADE_MS), [leave])

  useEffect(() => {
    if (phase !== 'leaving') return
    const id = window.setTimeout(() => setPhase('done'), leaveMs)
    return () => window.clearTimeout(id)
  }, [phase, leaveMs])

  useEffect(() => {
    if (phase !== 'done') return
    if (new URLSearchParams(window.location.search).has('intro')) {
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [phase])

  // Black browser chrome while the story plays; Escape skips.
  const playing = phase === 'playing'
  useEffect(() => {
    if (!playing) return
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    const previous = meta?.content
    if (meta) meta.content = '#080706'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && skip()
    window.addEventListener('keydown', onKey)
    return () => {
      if (meta && previous) meta.content = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [playing, skip])

  return (
    <>
      <div inert={phase !== 'done'}>{children}</div>
      {phase !== 'done' && (
        <div
          className="intro-root"
          data-phase={phase}
          role="region"
          aria-label="Batch Dos intro"
          style={{ '--leave': ms(leaveMs) } as CSSProperties}
        >
          {phase !== 'pending' && (
            <ReunionIntro
              config={introConfig}
              startAt={startAt}
              reducedMotion={reducedMotion}
              onEnd={end}
              onSkip={skip}
            />
          )}
        </div>
      )}
    </>
  )
}

const REDUCED = '(prefers-reduced-motion: reduce)'

function useReducedMotion() {
  return useSyncExternalStore(
    (notify) => {
      const mq = window.matchMedia(REDUCED)
      mq.addEventListener('change', notify)
      return () => mq.removeEventListener('change', notify)
    },
    () => window.matchMedia(REDUCED).matches,
    () => false,
  )
}
