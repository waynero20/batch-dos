import { describe, expect, it } from 'vitest'
import { ATTENDANCE, DATES, FOOD, VENUES, draftFromLabels } from './ballot'
import { ballotSchema } from './schema'

/**
 * The Votes tab stores labels, not ids, so a member coming back to change their vote
 * gets there through a lookup by label. A silent mismatch here would show someone
 * else's answers — or their own, wrong — so the round trip is pinned.
 */
describe('draftFromLabels', () => {
  it('round-trips a ballot through the labels the sheet actually stores', () => {
    const written = {
      date: DATES[0].label,
      venue: VENUES[0].name,
      food: FOOD[0].name,
      attending: ATTENDANCE[0].label,
    }
    expect(draftFromLabels(written)).toEqual({
      dateId: DATES[0].id,
      venueId: VENUES[0].id,
      foodId: FOOD[0].id,
      attending: ATTENDANCE[0].id,
    })
  })

  it('produces a draft the schema accepts', () => {
    const draft = draftFromLabels({
      date: 'January 9',
      venue: 'Island Hopping',
      food: 'Food Trays',
      attending: "I'm in",
    })
    const parsed = ballotSchema.safeParse({ memberName: 'Rondina, Wayne', ...draft })
    expect(parsed.success).toBe(true)
  })

  it('leaves an unrecognised label unset rather than guessing', () => {
    const draft = draftFromLabels({ date: 'December 26', venue: 'A Venue We Renamed' })
    expect(draft.dateId).toBe('dec-26')
    expect(draft).not.toHaveProperty('venueId')
  })

  it('drops a venue that does not belong to the stored date', () => {
    // Jan 9 is a city date; Purita Farms is province. The pair cannot both stand.
    const draft = draftFromLabels({ date: 'January 9', venue: 'Purita Farms' })
    expect(draft.dateId).toBe('jan-9')
    expect(draft).not.toHaveProperty('venueId')
  })

  it('returns an empty draft for a blank row', () => {
    expect(draftFromLabels({})).toEqual({})
    expect(draftFromLabels({ date: '', venue: '', food: '' })).toEqual({})
  })

  it('tolerates the stray whitespace a hand-edited sheet collects', () => {
    expect(draftFromLabels({ date: '  December 26  ' }).dateId).toBe('dec-26')
  })
})
