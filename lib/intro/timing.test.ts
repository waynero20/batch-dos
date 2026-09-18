import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { introConfig } from './config'
import {
  MAX_INTRO_MS,
  READABLE_NAME_MS,
  REDUCED_MIN_NAME_MS,
  nameIntervals,
  nameSchedule,
  reducedNameSchedule,
  scenePhotos,
  sceneDuration,
  totalDuration,
} from './timing'

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)

describe('intro config', () => {
  it('stays under the time ceiling, handoff included', () => {
    expect(totalDuration(introConfig)).toBeLessThanOrEqual(MAX_INTRO_MS)
  })

  it('opens with the exact opening line', () => {
    const first = introConfig.scenes[0]
    expect(first?.type === 'memory' && first.text).toBe(
      'Ka remember pa mo na ato problema ra sauna kay asa mag lunch?',
    )
  })

  it('ends on Planohan, preceded by So tara! and the Batch Dos line', () => {
    const [final, tara, planohan] = introConfig.scenes.slice(-3)
    expect(tara?.type).toBe('tara')
    expect(planohan?.type).toBe('planohan')
    expect(final?.type === 'final' && `${final.phrase} ${final.connector} ${final.ending}`).toBe(
      'Pero somehow, kita japon ang Batch Dos',
    )
  })

  it('has a montage of about ten photos', () => {
    const montage = introConfig.scenes.find((s) => s.type === 'montage')
    expect(montage && scenePhotos(montage).length).toBeGreaterThanOrEqual(8)
    expect(montage && scenePhotos(montage).length).toBeLessThanOrEqual(12)
  })

  it('points every photo at a file that exists under /public', () => {
    const photos = introConfig.scenes.flatMap(scenePhotos)
    expect(photos.length).toBeGreaterThan(0)
    for (const p of photos) {
      expect(p.src.startsWith('/'), p.src).toBe(true)
      expect(existsSync(join(process.cwd(), 'public', p.src)), p.src).toBe(true)
      expect(p.width > 0 && p.height > 0, p.src).toBe(true)
    }
  })

  it('has no empty text, names or scene timings', () => {
    expect(introConfig.names.length).toBeGreaterThan(0)
    expect(introConfig.names.every((n) => n.trim())).toBe(true)
    for (const scene of introConfig.scenes) {
      expect(sceneDuration(scene)).toBeGreaterThan(0)
      if (scene.type === 'lines') expect(scene.lines.every((l) => l.trim())).toBe(true)
    }
  })

  it('leaves each memory scene time to be fully visible', () => {
    for (const s of introConfig.scenes) {
      if (s.type === 'memory') expect(s.fadeIn + s.fadeOut).toBeLessThan(s.duration)
    }
  })
})

describe('nameSchedule', () => {
  const names = introConfig.scenes.find((s) => s.type === 'names')!
  if (names.type !== 'names') throw new Error('no names scene')
  const { intervals } = nameSchedule(names, introConfig.names, false)

  it('gives every name a slot and fills the scene exactly', () => {
    expect(intervals).toHaveLength(introConfig.names.length)
    expect(sum(intervals)).toBeCloseTo(names.duration, 3)
  })

  it('holds the first name, then only ever speeds up until the closing name', () => {
    expect(intervals[0]).toBe(names.firstNameHold)
    // Every name but the last accelerates; the closing name breaks the pattern deliberately.
    for (let i = 1; i < intervals.length - 1; i++) {
      expect(intervals[i]).toBeLessThanOrEqual(intervals[i - 1]! + 1e-9)
    }
  })

  it('lingers on the closing name instead of racing through it', () => {
    expect(intervals.at(-1)).toBe(names.lastNameHold)
    expect(intervals.at(-1)!).toBeGreaterThan(intervals.at(-2)!)
  })

  it('never shows a name too briefly to read', () => {
    expect(Math.min(...intervals)).toBeGreaterThanOrEqual(READABLE_NAME_MS - 1e-6)
  })

  it('still builds momentum', () => {
    expect(intervals[1]).toBeGreaterThan(intervals.at(-2)! * 2.5)
  })

  it('keeps the first-name hold under reduced motion', () => {
    const reduced = nameSchedule(names, introConfig.names, true)
    expect(reduced.names[0]).toBe(introConfig.names[0])
    expect(reduced.intervals[0]).toBe(names.firstNameHold)
    expect(Math.min(...reduced.intervals)).toBeGreaterThanOrEqual(REDUCED_MIN_NAME_MS - 1e-6)
    expect(sum(reduced.intervals)).toBeCloseTo(names.duration, 3)
  })
})

describe('nameIntervals', () => {
  it('fits any list length', () => {
    for (const n of [1, 5, 40, 150]) expect(sum(nameIntervals(n, 7000, 800, 50))).toBeCloseTo(7000, 3)
  })
})

describe('reducedNameSchedule', () => {
  it('never swaps faster than the reduced-motion floor', () => {
    const { names, intervals } = reducedNameSchedule(introConfig.names, 7800, 850)
    expect(names.length).toBe(intervals.length)
    expect(names[0]).toBe(introConfig.names[0])
    expect(names.at(-1)).toBe(introConfig.names.at(-1))
    expect(Math.min(...intervals)).toBeGreaterThanOrEqual(REDUCED_MIN_NAME_MS - 1e-6)
    expect(sum(intervals)).toBeCloseTo(7800, 3)
  })
})
