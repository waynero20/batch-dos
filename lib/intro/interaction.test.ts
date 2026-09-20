import { describe, expect, it } from 'vitest'
import { advancesOnClick } from './interaction'

/** Stands in for an event target: `hit` is what the real `closest('button')` would return. */
const target = (hit: unknown) => ({ closest: () => hit })

describe('advancesOnClick', () => {
  it('advances on a click that lands on the scene itself', () => {
    expect(advancesOnClick(target(null))).toBe(true)
  })

  it('leaves the Skip and Next buttons to their own handlers', () => {
    expect(advancesOnClick(target({}))).toBe(false)
  })

  it('advances when the click came from outside the DOM', () => {
    expect(advancesOnClick(null)).toBe(true)
    expect(advancesOnClick(undefined)).toBe(true)
    expect(advancesOnClick({})).toBe(true)
  })
})
