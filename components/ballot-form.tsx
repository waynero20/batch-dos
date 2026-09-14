'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  ATTENDANCE,
  DATES,
  FOOD,
  PALETTES,
  TRACK_LABEL,
  trackForDate,
  venuesForTrack,
  type DateId,
} from '@/lib/ballot'
import { submitBallot } from '@/app/actions'
import { Stepper } from './stepper'

type Draft = {
  dateId?: string
  venueId?: string
  foodId?: string
  paletteId?: string
  attending?: string
}

const STEPS = [
  { key: 'dateId', short: 'When', title: 'When should we meet?' },
  { key: 'venueId', short: 'Where', title: 'Where should we go?' },
  { key: 'foodId', short: 'Food', title: 'What should we eat?' },
  { key: 'paletteId', short: 'Wear', title: 'What should we wear?' },
  { key: 'attending', short: 'RSVP', title: 'Are you coming?' },
] as const

const STEP_LABELS = STEPS.map((s) => s.short)

const storageKey = (name: string) => `batch-dos-ballot:${name}`

export function BallotForm({ name, open }: { name: string; open: boolean }) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  // Answered steps stay reachable from the stepper; unanswered ones do not.
  const [furthest, setFurthest] = useState(0)
  const [draft, setDraft] = useState<Draft>({})
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  // Answers survive a closed tab or a dropped connection.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey(name))
      if (saved) setDraft(JSON.parse(saved) as Draft)
    } catch {
      // Private browsing or blocked storage — the ballot works, it just won't resume.
    }
  }, [name])

  useEffect(() => {
    try {
      localStorage.setItem(storageKey(name), JSON.stringify(draft))
    } catch {
      /* not fatal */
    }
  }, [name, draft])

  const track = draft.dateId ? trackForDate(draft.dateId as DateId) : null
  const venues = useMemo(() => (track ? venuesForTrack(track) : []), [track])

  const goTo = (next: number) => {
    setStep(next)
    setFurthest((f) => Math.max(f, next))
  }

  const current = STEPS[step]!
  const answered = Boolean(draft[current.key as keyof Draft])
  const isLast = step === STEPS.length - 1

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
        if (!stillValid) delete next.venueId
      }
      return next
    })
  }

  const submit = () => {
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

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 border-b border-base-300/70 bg-base-100/90 backdrop-blur-md">
        <div className="mx-auto max-w-md px-5 pb-3 pt-3.5">
          <div className="mb-2.5 flex items-center justify-between">
            <button
              type="button"
              onClick={() => (step === 0 ? router.push('/') : goTo(step - 1))}
              className="btn btn-ghost btn-xs -ml-2 gap-1 font-normal opacity-55"
            >
              <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 6-6 6 6 6" />
              </svg>
              {step === 0 ? 'All names' : 'Back'}
            </button>
            <span className="max-w-[9rem] truncate text-xs opacity-45">{name}</span>
          </div>

          <Stepper
            labels={STEP_LABELS}
            current={step}
            furthest={furthest}
            onJump={goTo}
          />
        </div>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-6 pb-36 pt-4">
        <div key={step} className="rise">
          <h1 className="h-display text-[2.125rem]">{current.title}</h1>

          {step === 1 && (
            <p className="mt-2 text-sm opacity-55">{TRACK_LABEL[track!]} options only.</p>
          )}

          <div className="mt-6 space-y-2.5">
            {step === 0 &&
              DATES.map((d) => (
                <Option
                  key={d.id}
                  selected={draft.dateId === d.id}
                  onSelect={() => choose('dateId', d.id)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-lg font-semibold">{d.label}</span>
                    <span className="badge badge-sm border-0 bg-base-200 font-medium opacity-70">
                      {TRACK_LABEL[d.track]}
                    </span>
                  </div>
                </Option>
              ))}

            {step === 1 &&
              venues.map((v) => (
                <Option
                  key={v.id}
                  selected={draft.venueId === v.id}
                  onSelect={() => choose('venueId', v.id)}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-lg font-semibold">{v.name}</span>
                    <span className="shrink-0 text-xs opacity-45">{v.location}</span>
                  </div>
                  <p className="mt-1 text-sm opacity-65">{v.description}</p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {v.features.map((f) => (
                      <span key={f} className="badge badge-xs border-0 bg-base-200 opacity-70">
                        {f}
                      </span>
                    ))}
                  </div>
                </Option>
              ))}

            {step === 2 &&
              FOOD.map((f) => (
                <Option
                  key={f.id}
                  selected={draft.foodId === f.id}
                  onSelect={() => choose('foodId', f.id)}
                >
                  <span className="text-lg font-semibold">{f.name}</span>
                  <p className="mt-0.5 text-sm opacity-65">{f.tagline}</p>
                  <ul className="mt-2 space-y-0.5 text-xs opacity-55">
                    {f.details.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                </Option>
              ))}

            {step === 3 &&
              PALETTES.map((p) => (
                <Option
                  key={p.id}
                  selected={draft.paletteId === p.id}
                  onSelect={() => choose('paletteId', p.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex shrink-0 overflow-hidden rounded-selector">
                      {p.swatches.map((hex) => (
                        <span key={hex} className="block size-7" style={{ backgroundColor: hex }} />
                      ))}
                    </div>
                    <div className="min-w-0">
                      <span className="block font-semibold">{p.name}</span>
                      <span className="block truncate text-xs opacity-55">{p.description}</span>
                    </div>
                  </div>
                </Option>
              ))}

            {step === 4 &&
              ATTENDANCE.map((a) => (
                <Option
                  key={a.id}
                  selected={draft.attending === a.id}
                  onSelect={() => choose('attending', a.id)}
                >
                  <span className="text-lg font-semibold">{a.label}</span>
                </Option>
              ))}
          </div>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-base-100 via-base-100 to-transparent px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-6">
        <div className="mx-auto max-w-md">
          {error && (
            <div role="alert" className="alert alert-error mb-3 py-2.5 text-sm">
              {error}
            </div>
          )}

          <button
            type="button"
            disabled={!answered || pending || !open}
            onClick={() => (isLast ? submit() : goTo(step + 1))}
            className="btn btn-primary btn-lg btn-block rounded-field"
          >
            {pending && <span className="loading loading-spinner loading-sm" />}
            {!open ? 'Voting closed' : isLast ? 'Submit' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Option({
  selected,
  onSelect,
  children,
}: {
  selected: boolean
  onSelect: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`relative w-full rounded-box border p-4 text-left transition-all duration-150 ${
        selected
          ? 'border-primary bg-primary/[0.06] ring-2 ring-primary'
          : 'border-base-300 hover:border-base-content/25'
      }`}
    >
      {children}
    </button>
  )
}
