import { describe, expect, it } from 'vitest'
import { DATES, VENUES } from './ballot'
import { ballotSchema } from './schema'

const valid = {
  memberName: 'Rondina, Wayne',
  dateId: 'dec-26',
  venueId: 'purita-farms',
  foodId: 'rodmers',
  attending: 'yes',
} as const

describe('ballotSchema', () => {
  it('accepts a well-formed province ballot', () => {
    expect(ballotSchema.safeParse(valid).success).toBe(true)
  })

  it('accepts a well-formed city ballot', () => {
    const r = ballotSchema.safeParse({ ...valid, dateId: 'jan-9', venueId: 'island-hopping' })
    expect(r.success).toBe(true)
  })

  // The load-bearing rule. Client-side filtering is a convenience; a forged or
  // stale submission must not be storable.
  describe('track consistency fails closed', () => {
    const mismatches = DATES.flatMap((d) =>
      VENUES.filter((v) => v.track !== d.track).map((v) => [d.id, v.id, d.track, v.track] as const),
    )

    it('covers every possible mismatched pair', () => {
      expect(mismatches).toHaveLength(DATES.length * 2)
    })

    it.each(mismatches)('rejects %s (%s) with %s (%s)', (dateId, venueId) => {
      const r = ballotSchema.safeParse({ ...valid, dateId, venueId })
      expect(r.success).toBe(false)
      if (!r.success) {
        expect(r.error.issues.some((i) => i.path.includes('venueId'))).toBe(true)
      }
    })

    it.each(
      DATES.flatMap((d) => VENUES.filter((v) => v.track === d.track).map((v) => [d.id, v.id] as const)),
    )('accepts matching %s with %s', (dateId, venueId) => {
      expect(ballotSchema.safeParse({ ...valid, dateId, venueId }).success).toBe(true)
    })
  })

  it.each(['dateId', 'venueId', 'foodId', 'attending'] as const)(
    'rejects an unknown %s',
    (field) => {
      expect(ballotSchema.safeParse({ ...valid, [field]: 'not-a-real-option' }).success).toBe(false)
    },
  )

  it.each(['', '   '])('rejects a blank member name (%j)', (memberName) => {
    expect(ballotSchema.safeParse({ ...valid, memberName }).success).toBe(false)
  })

  it('trims surrounding whitespace from the member name', () => {
    const r = ballotSchema.safeParse({ ...valid, memberName: '  Rondina, Wayne  ' })
    expect(r.success && r.data.memberName).toBe('Rondina, Wayne')
  })

  it('rejects a ballot missing a required answer', () => {
    const { foodId, ...partial } = valid
    expect(ballotSchema.safeParse(partial).success).toBe(false)
  })
})
