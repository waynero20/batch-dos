import type { IntroConfig, NamesScene, Photo, Scene } from './types'

/**
 * Ceiling for the whole intro, handoff included. The brief said 60 s; it was raised so all
 * 73 names can be read (each up for at least READABLE_NAME_MS) without rushing other scenes.
 */
export const MAX_INTRO_MS = 70_000

/** No name may flash by faster than this: below it, names stop being readable. */
export const READABLE_NAME_MS = 200

/** Reduced motion never swaps a name faster than this. */
export const REDUCED_MIN_NAME_MS = 180

export function sceneDuration(scene: Scene): number {
  switch (scene.type) {
    case 'memory':
    case 'names':
    case 'final':
    case 'tara':
    case 'planohan':
      return scene.duration
    case 'montage':
      return scene.photos.length * scene.interval + scene.settle
    case 'lines':
      return (scene.lines.length - 1) * scene.stagger + scene.fadeIn + scene.hold + scene.fadeOut
  }
}

/** The fade into the RSVP page after the last scene. */
export function handoffDuration(config: IntroConfig): number {
  const last = config.scenes.at(-1)
  return last?.type === 'tara' || last?.type === 'planohan' ? last.handoff : 0
}

export function totalDuration(config: IntroConfig): number {
  return config.scenes.reduce((sum, s) => sum + sceneDuration(s), 0) + handoffDuration(config)
}

export function scenePhotos(scene: Scene | undefined): Photo[] {
  if (!scene) return []
  if (scene.type === 'montage') return scene.photos
  if (scene.type === 'memory' && scene.photo) return [scene.photo]
  return []
}

/**
 * How long each name stays on screen: `first` for the opening name, easing down to `last`,
 * with every interval adding up to exactly `duration`.
 *
 *   interval(i) = last + (first − last) · (1 − i/(n−1))^k
 *
 * A larger `k` drops the pace off sooner. `k` is solved by bisection to fit `duration`,
 * so any list length works. If the budget can't be met inside [first, last] the
 * curve is scaled to fit rather than overshooting.
 */
export function nameIntervals(n: number, duration: number, first: number, last: number): number[] {
  if (n <= 0) return []
  if (n === 1) return [duration]

  const curve = (k: number) =>
    Array.from({ length: n }, (_, i) => last + (first - last) * (1 - i / (n - 1)) ** k)
  const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)

  // sum(curve(k)) falls as k grows.
  let lo = 0
  let hi = 200
  for (let step = 0; step < 60; step++) {
    const mid = (lo + hi) / 2
    if (sum(curve(mid)) > duration) lo = mid
    else hi = mid
  }
  const intervals = curve((lo + hi) / 2)
  const scale = duration / sum(intervals)
  return intervals.map((x) => x * scale)
}

/**
 * Every name and how long it stays up. The first name holds for `firstNameHold`; the last
 * name holds (and fades out) for `lastNameHold`; everything between accelerates to fill
 * whatever remains of the scene.
 */
export function nameSchedule(
  scene: NamesScene,
  names: readonly string[],
  reducedMotion: boolean,
): { names: string[]; intervals: number[] } {
  const [first, ...rest] = names
  if (first === undefined) return { names: [], intervals: [] }
  const hold = Math.min(scene.firstNameHold, scene.duration)
  const afterFirst = scene.duration - hold

  if (rest.length === 0) return { names: [first], intervals: [hold] }

  const last = rest.at(-1)!
  const middle = rest.slice(0, -1)
  const lastHold = Math.min(scene.lastNameHold, afterFirst)
  const remaining = afterFirst - lastHold

  const full = {
    names: [...middle, last],
    intervals: [...nameIntervals(middle.length, remaining, scene.firstInterval, scene.lastInterval), lastHold],
  }
  // Reduced motion only needs its own (thinned) schedule if the normal one swaps too quickly.
  const tooQuick = full.intervals.some((x) => x < REDUCED_MIN_NAME_MS - 1e-6)
  const tail = reducedMotion && tooQuick ? reducedNameSchedule(rest, afterFirst, scene.firstInterval) : full
  return { names: [first, ...tail.names], intervals: [hold, ...tail.intervals] }
}

/**
 * The name list and pacing for reduced motion: still slow-to-fast, but never quicker than
 * REDUCED_MIN_NAME_MS. Names are thinned evenly when the full list can't fit.
 */
export function reducedNameSchedule(
  names: readonly string[],
  duration: number,
  first: number,
): { names: string[]; intervals: number[] } {
  // Leave the curve room to breathe: at most ~1.5× the floor on average.
  const fit = Math.max(1, Math.floor(duration / (REDUCED_MIN_NAME_MS * 1.5)))
  const count = Math.min(names.length, fit)
  const picked =
    count === names.length
      ? [...names]
      : Array.from(
          { length: count },
          (_, i) => names[Math.round((i * (names.length - 1)) / Math.max(1, count - 1))]!,
        )
  return {
    names: picked,
    intervals: nameIntervals(count, duration, Math.max(first, REDUCED_MIN_NAME_MS), REDUCED_MIN_NAME_MS),
  }
}
