'use server'

import { revalidatePath } from 'next/cache'
import { ATTENDANCE, DATES, FOOD, PALETTES, VENUES, trackForDate, TRACK_LABEL } from '@/lib/ballot'
import type { DateId } from '@/lib/ballot'
import { isMember } from '@/lib/roster'
import { ballotSchema } from '@/lib/schema'
import { VOTES_TAB, readVotes, writeRange } from '@/lib/sheets'
import { votingOpen } from '@/lib/config'

export type SubmitResult = { ok: true } | { ok: false; error: string }

const labelOf = <T extends { id: string }>(xs: readonly T[], id: string, pick: (x: T) => string) => {
  const found = xs.find((x) => x.id === id)
  return found ? pick(found) : id
}

export async function submitBallot(input: unknown): Promise<SubmitResult> {
  if (!votingOpen()) {
    return { ok: false, error: 'Voting is closed. Ask the committee if you still need to change your answer.' }
  }

  const parsed = ballotSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'That ballot is not valid.' }
  }
  const ballot = parsed.data

  // The schema proves the ballot is internally coherent; this proves the voter exists.
  if (!isMember(ballot.memberName)) {
    return {
      ok: false,
      error: `${ballot.memberName} is not on the masterlist. Tell the committee so they can add you.`,
    }
  }

  try {
    const votes = await readVotes()
    const target = votes.find((v) => v.name === ballot.memberName)

    if (!target) {
      return {
        ok: false,
        error: 'Your row is missing from the Votes tab. The committee needs to re-run the roster seed.',
      }
    }

    const track = trackForDate(ballot.dateId as DateId)

    // Human-readable values, because the committee reads this tab directly and ids
    // like "bakhawan-beach-home" would make them do the translation by hand.
    await writeRange(`${VOTES_TAB}!A${target.row}:H${target.row}`, [
      [
        new Date().toISOString(),
        ballot.memberName,
        TRACK_LABEL[track],
        labelOf(DATES, ballot.dateId, (d) => d.label),
        labelOf(VENUES, ballot.venueId, (v) => v.name),
        labelOf(FOOD, ballot.foodId, (f) => f.name),
        labelOf(PALETTES, ballot.paletteId, (p) => p.name),
        labelOf(ATTENDANCE, ballot.attending, (a) => a.label),
      ],
    ])

    revalidatePath('/')
    return { ok: true }
  } catch (err) {
    console.error('[submitBallot]', err)
    return {
      ok: false,
      error: 'Could not reach the spreadsheet. Your answers are saved on this device — try again in a moment.',
    }
  }
}
