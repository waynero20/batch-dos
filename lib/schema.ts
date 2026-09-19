import { z } from 'zod'
import {
  ATTENDANCE,
  DATES,
  FOOD,
  TRACK_LABEL,
  VENUES,
  type DateId,
  type VenueId,
  trackForDate,
} from './ballot'

const idsOf = <T extends { id: string }>(options: readonly T[]) =>
  options.map((o) => o.id) as [T['id'], ...T['id'][]]

/**
 * The authoritative shape of a submitted ballot.
 *
 * The client filters venues by the chosen date, but that is only a convenience.
 * This schema is what actually decides whether a ballot is storable, so a forged
 * request — or one from a tab left open while the proposal changed — is rejected
 * rather than written to the sheet.
 */
export const ballotSchema = z
  .object({
    memberName: z.string().trim().min(1, 'Pick your name from the list').max(120),
    dateId: z.enum(idsOf(DATES)),
    venueId: z.enum(idsOf(VENUES)),
    foodId: z.enum(idsOf(FOOD)),
    attending: z.enum(idsOf(ATTENDANCE)),
  })
  .superRefine((ballot, ctx) => {
    const venue = VENUES.find((v) => v.id === (ballot.venueId as VenueId))
    if (!venue) return

    const track = trackForDate(ballot.dateId as DateId)
    if (venue.track !== track) {
      ctx.addIssue({
        code: 'custom',
        path: ['venueId'],
        message: `${venue.name} is a ${TRACK_LABEL[venue.track].toLowerCase()} venue, but that date is ${TRACK_LABEL[track].toLowerCase()}.`,
      })
    }
  })

export type Ballot = z.infer<typeof ballotSchema>
