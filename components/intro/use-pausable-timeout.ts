'use client'

import { useEffect, useRef } from 'react'

/**
 * Calls `onDone` after `ms`, counting only time spent unpaused. A new `resetKey` starts a
 * fresh countdown. Pass `ms = null` to disarm.
 */
export function usePausableTimeout(
  ms: number | null,
  onDone: () => void,
  paused: boolean,
  resetKey: unknown,
) {
  const callback = useRef(onDone)
  useEffect(() => {
    callback.current = onDone
  })

  const clock = useRef({ key: resetKey, remaining: ms ?? 0 })

  useEffect(() => {
    if (clock.current.key !== resetKey) clock.current = { key: resetKey, remaining: ms ?? 0 }
    if (paused || ms === null) return

    const state = clock.current
    const started = performance.now()
    const id = window.setTimeout(() => callback.current(), Math.max(0, state.remaining))
    return () => {
      window.clearTimeout(id)
      state.remaining -= performance.now() - started
    }
  }, [ms, paused, resetKey])
}
