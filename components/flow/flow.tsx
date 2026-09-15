'use client'

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  DATES,
  FLOW_STEPS,
  LAST_STEP,
  TRACK_LABEL,
  VENUE_CLEARED_NOTE,
  planRows,
  trackForDate,
  venuesForTrack,
  type DateId,
} from '@/lib/ballot'
import { submitBallot } from '@/app/actions'
import { Screen } from './screen'
import { DayStep } from './steps/day'
import { FoodStep } from './steps/food'
import { IdentityStep } from './steps/identity'
import { RsvpStep } from './steps/rsvp'
import { WearStep } from './steps/wear'
import { WhenStep } from './steps/when'
import { WhereStep } from './steps/where'

type Draft = {
  dateId?: string
  venueId?: string
  foodId?: string
  paletteId?: string
  attending?: string
}

const storageKey = (name: string) => `batch-dos-ballot:${name}`

/** Where to drop someone resuming a saved draft: their first unanswered question,
 *  or the last screen if they answered everything and never submitted. */
function firstUnanswered(draft: Draft): number {
  for (let i = 1; i < FLOW_STEPS.length; i++) {
    const field = FLOW_STEPS[i]!.field
    if (field && !draft[field]) return i
  }
  return LAST_STEP
}

function loadDraft(name: string): Draft {
  try {
    const raw = localStorage.getItem(storageKey(name))
    return raw ? (JSON.parse(raw) as Draft) : {}
  } catch {
    // Private browsing or blocked storage — the ballot works, it just won't resume.
    return {}
  }
}

/**
 * The whole ballot: seven screens, one route, no navigation in between.
 *
 * Every step lives here rather than behind a URL so the flow reads as one surface.
 * The trade is that Back has to be wired by hand — each advance pushes a history
 * entry and `popstate` walks it back, so the phone's back gesture steps through
 * questions instead of leaving the site.
 */
export function Flow({
  roster,
  voted,
  open,
  initialName,
}: {
  roster: readonly string[]
  voted: readonly string[]
  open: boolean
  /** From a legacy `/vote?name=` link, already checked against the roster. */
  initialName?: string
}) {
  const router = useRouter()
  const [name, setName] = useState<string | undefined>(initialName)
  const [step, setStep] = useState(0)
  const [furthest, setFurthest] = useState(0)
  const [draft, setDraft] = useState<Draft>({})
  const [venueCleared, setVenueCleared] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const goTo = useCallback((next: number) => {
    setVenueCleared(false)
    setError(null)
    setStep(next)
    setFurthest((f) => Math.max(f, next))
    // `null` state, and only the hash changes: Next owns the history state object, so
    // writing our own clobbers the router's and turns the next Back into a full
    // reload. The hash keeps the pathname and searchParams — and therefore the server
    // component — entirely out of it.
    window.history.pushState(null, '', `#${FLOW_STEPS[next]!.id}`)
  }, [])

  // The back gesture walks the flow, not the site.
  useEffect(() => {
    // A shared `#wear` must not drop someone into the middle of a ballot they have
    // not started, so the flow always opens on its own first screen.
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    }
    const onPop = () => {
      const id = window.location.hash.slice(1)
      const i = FLOW_STEPS.findIndex((s) => s.id === id)
      setStep(i >= 0 ? i : 0)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  // A shared link that named someone skips the first screen.
  useEffect(() => {
    if (!initialName) return
    const saved = loadDraft(initialName)
    setDraft(saved)
    goTo(firstUnanswered(saved))
  }, [initialName, goTo])

  // Answers survive a closed tab or a dropped connection.
  useEffect(() => {
    if (!name) return
    try {
      localStorage.setItem(storageKey(name), JSON.stringify(draft))
    } catch {
      /* not fatal */
    }
  }, [name, draft])

  const pick = (chosen: string) => {
    setName(chosen)
    const saved = loadDraft(chosen)
    setDraft(saved)
    goTo(firstUnanswered(saved))
  }

  const choose = (key: keyof Draft, value: string) => {
    setError(null)
    setDraft((prev) => {
      const next = { ...prev, [key]: value }
      // Switching to a date on the other track strands the chosen venue, so drop it
      // rather than carry an impossible pair into the next screen.
      if (key === 'dateId' && prev.venueId) {
        const stillValid = venuesForTrack(trackForDate(value as DateId)).some(
          (v) => v.id === prev.venueId,
        )
        if (!stillValid) {
          delete next.venueId
          // Outside the updater — the function passed to setDraft must stay pure.
          queueMicrotask(() => setVenueCleared(true))
        }
      }
      return next
    })
  }

  const submit = () => {
    if (!name) return
    setError(null)
    startTransition(async () => {
      const result = await submitBallot({ memberName: name, ...draft })
      if (result.ok) {
        try {
          localStorage.removeItem(storageKey(name))
        } catch {
          /* not fatal */
        }
        router.push(`/done?name=${encodeURIComponent(name)}`)
      } else {
        setError(result.error)
      }
    })
  }

  const track = draft.dateId ? trackForDate(draft.dateId as DateId) : null
  const venues = useMemo(() => (track ? venuesForTrack(track) : []), [track])
  const rows = planRows(draft)

  const current = FLOW_STEPS[step]!
  const isLast = step === LAST_STEP
  const answered = current.field ? Boolean(draft[current.field]) : step !== 0 || Boolean(name)

  // Where earns a dynamic standfirst: it is the only place the track rule is explained.
  const note =
    current.id === 'where' && track
      ? `${TRACK_LABEL[track]} options, because you picked ${DATES.find((d) => d.id === draft.dateId)?.label}.`
      : current.note

  return (
    <Screen
      index={step}
      total={FLOW_STEPS.length}
      short={current.short}
      title={current.title}
      note={note}
      name={name}
      furthest={furthest}
      onBack={() => window.history.back()}
      onJump={goTo}
      footer={
        step === 0 ? (
          <p className="caption">
            {open ? 'Tap your name to begin.' : 'Voting is closed.'}
          </p>
        ) : (
          <>
            {venueCleared && (
              <p className="caption mb-2 text-primary opacity-100">{VENUE_CLEARED_NOTE}</p>
            )}
            {error && (
              <div role="alert" className="alert alert-error mb-2.5 py-2.5 text-sm">
                {error}
              </div>
            )}
            <div className="flex items-center gap-5">
              <button
                type="button"
                disabled={!answered || pending || !open}
                onClick={() => (isLast ? submit() : goTo(step + 1))}
                className="btn btn-primary btn-lg btn-block rounded-field lg:w-auto lg:min-w-[15rem] lg:flex-none"
              >
                {pending && <span className="loading loading-spinner loading-sm" />}
                {!open ? 'Voting closed' : isLast ? 'Submit' : current.field ? 'Next' : 'Looks good'}
              </button>
              <span className="eyebrow hidden lg:block">
                Question {step} of {LAST_STEP}
              </span>
            </div>
          </>
        )
      }
    >
      {step === 0 && (
        <IdentityStep roster={roster} voted={voted} value={name} onPick={pick} />
      )}
      {current.id === 'when' && (
        <WhenStep value={draft.dateId} onChoose={(id) => choose('dateId', id)} />
      )}
      {current.id === 'where' && (
        <WhereStep
          venues={venues}
          value={draft.venueId}
          onChoose={(id) => choose('venueId', id)}
        />
      )}
      {current.id === 'food' && (
        <FoodStep value={draft.foodId} onChoose={(id) => choose('foodId', id)} />
      )}
      {current.id === 'wear' && (
        <WearStep value={draft.paletteId} onChoose={(id) => choose('paletteId', id)} />
      )}
      {current.id === 'day' && <DayStep />}
      {current.id === 'rsvp' && (
        <RsvpStep rows={rows} value={draft.attending} onChoose={(id) => choose('attending', id)} />
      )}
    </Screen>
  )
}
