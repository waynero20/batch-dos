'use server'

import { revalidatePath } from 'next/cache'
import {
  ATTENDANCE,
  DATES,
  FOOD,
  PALETTES,
  VENUES,
  draftFromLabels,
  trackForDate,
  TRACK_LABEL,
} from '@/lib/ballot'
import type { BallotDraft, DateId } from '@/lib/ballot'
import { isMember } from '@/lib/roster'
import { ballotSchema } from '@/lib/schema'
import { VOTES_TAB, hasVoted, readVotes, writeRange } from '@/lib/sheets'
import { votingOpen } from '@/lib/config'

export type SubmitResult = { ok: true } | { ok: false; error: string }

/** A ballot already on record, ready to be shown back to the member who cast it. */
export type ExistingBallot = { votedAt: string; draft: BallotDraft }

/**
 * The ballot this member has already submitted, or null if they have not.
 *
 * Deliberately unauthenticated, like the rest of the flow: anyone who can open the
 * link can type any name and read that member's answers. That is a real weakening of
 * the committee-only results page, accepted so that changing your mind works from any
 * device rather than only the phone you first voted on.
 *
 * A spreadsheet hiccup returns null rather than throwing — failing to prefill costs a
 * member some retyping; failing to load the page costs their vote.
 */
export async function fetchBallot(memberName: string): Promise<ExistingBallot | null> {
  if (!isMember(memberName)) return null

  try {
    const votes = await readVotes()
    const row = votes.find((v) => v.name === memberName)
    if (!row || !hasVoted(row)) return null

    return { votedAt: row.votedAt, draft: draftFromLabels(row) }
  } catch (err) {
    console.error('[fetchBallot]', err)
    return null
  }
}

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
