import { describe, expect, it } from 'vitest'
import { FIRST_QUESTION, LAST_STEP, reachedThrough, type BallotDraft } from './ballot'

/**
 * A saved draft says how far the progress bar unlocks — never where the flow opens.
 * Opening on a draft's first unanswered question stranded people on question four
 * having never seen the date they supposedly picked, which is exactly what it looked
 * like: a bug.
 */
describe('reachedThrough', () => {
  const draft = (d: BallotDraft) => d

  it('unlocks nothing beyond the first question for an empty draft', () => {
    expect(reachedThrough({})).toBe(FIRST_QUESTION)
  })

  it('stops at the first gap, not the last answer given', () => {
    // Venue answered but date missing: the bar must not imply the date was seen.
    expect(reachedThrough(draft({ venueId: 'purita-farms' }))).toBe(FIRST_QUESTION)
  })

  it('unlocks up to the first unanswered question', () => {
    expect(reachedThrough(draft({ dateId: 'dec-26' }))).toBe(2)
    expect(reachedThrough(draft({ dateId: 'dec-26', venueId: 'purita-farms' }))).toBe(3)
  })

  it('unlocks everything once every answer is in', () => {
    const complete = draft({
      dateId: 'dec-26',
      venueId: 'purita-farms',
      foodId: 'bilao-packages',
      attending: 'yes',
    })
    expect(reachedThrough(complete)).toBe(LAST_STEP)
  })

  it('never points at the identity screen', () => {
    for (const d of [{}, { dateId: 'dec-26' }, { attending: 'yes' }]) {
      expect(reachedThrough(d)).toBeGreaterThanOrEqual(FIRST_QUESTION)
    }
  })
})
