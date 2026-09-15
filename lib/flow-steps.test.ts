import { describe, expect, it } from 'vitest'
import { FLOW_STEPS, LAST_STEP, WHO_STEP } from './ballot'

/**
 * The flow's copy is load-bearing but nothing about it is type-checked: a screen with
 * a blank title or a dropped standfirst compiles perfectly and renders a hole. Both
 * happened during the rebuild and neither was caught until the page was read back, so
 * they are asserted here instead.
 */
describe('FLOW_STEPS', () => {
  it('opens on identity and ends on the RSVP', () => {
    expect(FLOW_STEPS[WHO_STEP]!.id).toBe('who')
    expect(FLOW_STEPS[LAST_STEP]!.id).toBe('rsvp')
    expect(LAST_STEP).toBe(FLOW_STEPS.length - 1)
  })

  it('gives every screen a label and a question', () => {
    for (const step of FLOW_STEPS) {
      expect(step.short.trim(), `${step.id} short`).not.toBe('')
      expect(step.title.trim(), `${step.id} title`).not.toBe('')
    }
  })

  it('gives every screen a standfirst except Where, which builds its own', () => {
    // Where names the track you picked, so its sentence cannot be static.
    for (const step of FLOW_STEPS) {
      if (step.id === 'where') {
        expect(step.note).toBeNull()
      } else {
        expect(step.note, `${step.id} note`).toBeTruthy()
        expect(step.note!.trim(), `${step.id} note`).not.toBe('')
      }
    }
  })

  it('asks for each ballot field exactly once', () => {
    const fields = FLOW_STEPS.map((s) => s.field).filter((f) => f !== null)
    expect(fields).toEqual(['dateId', 'venueId', 'foodId', 'paletteId', 'attending'])
    expect(new Set(fields).size).toBe(fields.length)
  })

  it('keeps ids unique, since the history hash is keyed on them', () => {
    const ids = FLOW_STEPS.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
