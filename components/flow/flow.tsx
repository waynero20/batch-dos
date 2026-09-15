'use client'

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  FIRST_QUESTION,
  FLOW_STEPS,
  LAST_STEP,
  reachedThrough,
  type BallotDraft,
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

/** Matches the .zooming animation in globals.css. */
const ZOOM_MS = 240

const storageKey = (name: string) => `batch-dos-ballot:${name}`

function loadDraft(name: string): BallotDraft {
  try {
    const raw = localStorage.getItem(storageKey(name))
    return raw ? (JSON.parse(raw) as BallotDraft) : {}
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
  // Which way the last move went, so each screen enters from the side you came from.
  const [dir, setDir] = useState<'fwd' | 'back'>('fwd')
  // Picking a date carries you straight into the next screen; these drive the
  // outgoing screen's pull-away and the incoming screen's rise to meet it.
  const [enter, setEnter] = useState<'slide' | 'zoom'>('slide')
  const [zooming, setZooming] = useState(false)
  // goTo has to compare against the live step without taking it as a dependency,
  // or every advance would rebuild the callback the popstate listener closed over.
  const stepRef = useRef(0)
  const zoomTimer = useRef<number | undefined>(undefined)
  const [draft, setDraft] = useState<BallotDraft>({})
  const [venueCleared, setVenueCleared] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const goTo = useCallback((next: number, mode: 'slide' | 'zoom' = 'slide') => {
    setEnter(mode)
    setDir(next >= stepRef.current ? 'fwd' : 'back')
    stepRef.current = next
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
      const next = i >= 0 ? i : 0
      setDir(next >= stepRef.current ? 'fwd' : 'back')
      stepRef.current = next
      setStep(next)
    }
    window.addEventListener('popstate', onPop)
    return () => {
      window.removeEventListener('popstate', onPop)
      window.clearTimeout(zoomTimer.current)
    }
  }, [])

  // A shared link that named someone skips the identity screen — but still opens on
  // the first question, not wherever a stale draft happens to reach.
  useEffect(() => {
    if (!initialName) return
    const saved = loadDraft(initialName)
    setDraft(saved)
    goTo(FIRST_QUESTION)
    setFurthest((f) => Math.max(f, reachedThrough(saved)))
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
    goTo(FIRST_QUESTION)
    setFurthest((f) => Math.max(f, reachedThrough(saved)))
  }

  const choose = (key: keyof BallotDraft, value: string) => {
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

  /**
   * Answer and move on in one gesture, with the zoom carrying the change.
   *
   * The advance goes through `goTo` like every other one. Doing it inside a `setStep`
   * updater instead put `history.pushState` in there too — and Next patches
   * pushState to update its Router, so a state updater that is supposed to be pure
   * ended up updating another component mid-render.
   */
  const chooseAndAdvance = (key: keyof BallotDraft, value: string) => {
    choose(key, value)
    setZooming(true)
    zoomTimer.current = window.setTimeout(() => {
      setZooming(false)
      goTo(Math.min(stepRef.current + 1, LAST_STEP), 'zoom')
    }, ZOOM_MS)
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


  return (
    <Screen
      index={step}
      total={FLOW_STEPS.length}
      title={current.title}
      name={name}
      furthest={furthest}
      dir={dir}
      enter={enter}
      zooming={zooming}
      onBack={() => window.history.back()}
      onJump={goTo}
      footer={
        // Identity and When are answered by tapping the thing itself, so neither
        // needs a button underneath it.
        step === 0 || current.id === 'when' ? (
          open ? null : <p className="caption">Voting is closed.</p>
        ) : (
          <div className="flex w-full flex-col items-center">
            {venueCleared && (
              <p className="caption mb-2 text-center text-primary opacity-100">
                {VENUE_CLEARED_NOTE}
              </p>
            )}
            {error && (
              <div
                role="alert"
                className="mb-2.5 max-w-md rounded-2xl bg-error px-4 py-2.5 text-center text-sm text-error-content"
              >
                {error}
              </div>
            )}
            <button
              type="button"
              disabled={!answered || pending || !open}
              onClick={() => (isLast ? submit() : goTo(step + 1))}
              className="cta w-full max-w-sm"
            >
              {pending && <span className="loading loading-spinner loading-sm" />}
              {!open ? 'Voting closed' : isLast ? 'Submit' : current.field ? 'Next' : 'Looks good'}
            </button>
          </div>
        )
      }
    >
      {step === 0 && (
        <IdentityStep roster={roster} voted={voted} value={name} onPick={pick} />
      )}
      {current.id === 'when' && (
        <WhenStep value={draft.dateId} onChoose={(id) => chooseAndAdvance('dateId', id)} />
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
