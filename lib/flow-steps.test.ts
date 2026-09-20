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

  it('gives every screen a label', () => {
    for (const step of FLOW_STEPS) {
      expect(step.short.trim(), `${step.id} short`).not.toBe('')
    }
  })

  /**
   * Every screen but the first, which deliberately asks nothing: the name input is
   * the whole screen and the heading above it was dropped to leave room for the
   * phone keyboard. `Screen` renders no <h1> at all when the title is blank, so this
   * is the one step allowed to have one.
   */
  it('gives every question screen a question', () => {
    for (const [i, step] of FLOW_STEPS.entries()) {
      if (i === WHO_STEP) continue
      expect(step.title.trim(), `${step.id} title`).not.toBe('')
    }
  })

  it('asks nothing on the identity screen', () => {
    expect(FLOW_STEPS[WHO_STEP]!.title).toBe('')
  })

  it('carries no standfirst at all — the question is the whole screen', () => {
    for (const step of FLOW_STEPS) {
      expect(step, `${step.id}`).not.toHaveProperty('note')
    }
  })

  it('asks for each ballot field exactly once', () => {
    const fields = FLOW_STEPS.map((s) => s.field).filter((f) => f !== null)
    expect(fields).toEqual(['dateId', 'venueId', 'foodId', 'attending'])
    expect(new Set(fields).size).toBe(fields.length)
  })

  it('keeps ids unique, since the history hash is keyed on them', () => {
    const ids = FLOW_STEPS.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
