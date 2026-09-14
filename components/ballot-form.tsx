'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  ATTENDANCE,
  DATES,
  FOOD,
  PALETTES,
  TRACK_LABEL,
  VENUES,
  trackForDate,
  venueSummaryForTrack,
  venuesForTrack,
  type DateId,
} from '@/lib/ballot'
import { submitBallot } from '@/app/actions'
import { ProgramTimeline } from './program-timeline'
import { Stepper } from './stepper'

type Draft = {
  dateId?: string
  venueId?: string
  foodId?: string
  paletteId?: string
  attending?: string
}

/** `field` is undefined for steps that show something rather than ask something. */
const STEPS = [
  { field: 'dateId', short: 'When', title: 'When should we meet?' },
  { field: 'venueId', short: 'Where', title: 'Where should we go?' },
  { field: 'foodId', short: 'Food', title: 'What should we eat?' },
  { field: 'paletteId', short: 'Wear', title: 'What should we wear?' },
  { field: undefined, short: 'Day', title: 'Here’s the day' },
  { field: 'attending', short: 'RSVP', title: 'Are you coming?' },
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

  const current = STEPS[step]!
  const answered = current.field ? Boolean(draft[current.field]) : true
  const isLast = step === STEPS.length - 1

  const goTo = (next: number) => {
    setStep(next)
    setFurthest((f) => Math.max(f, next))
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

          <Stepper labels={STEP_LABELS} current={step} furthest={furthest} onJump={goTo} />
        </div>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-5 pb-36 pt-5">
        <div key={step} className="rise">
          <h1 className="h-display text-[2.125rem]">{current.title}</h1>

          {step === 1 && (
            <p className="mt-2 text-sm opacity-55">
              {TRACK_LABEL[track!]} options, because you picked{' '}
              {DATES.find((d) => d.id === draft.dateId)?.label}.
            </p>
          )}
          {step === 4 && (
            <p className="mt-2 text-sm opacity-55">
              Same plan wherever we land. One last question after this.
            </p>
          )}

          <div className={step === 4 ? 'mt-7' : 'mt-6 space-y-2.5'}>
            {step === 0 &&
              DATES.map((d) => (
                <Option
                  key={d.id}
                  selected={draft.dateId === d.id}
                  onSelect={() => choose('dateId', d.id)}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-lg font-semibold">{d.label}</span>
                    <span className="badge badge-sm border-0 bg-base-200 font-medium opacity-70">
                      {TRACK_LABEL[d.track]}
                    </span>
                  </div>
                  {/* Naming the venues here makes the consequence of the date visible
                      before it is chosen, rather than a surprise on the next screen. */}
                  <p className="mt-1 text-[0.8125rem] leading-relaxed opacity-50">
                    {venueSummaryForTrack(d.track)}
                  </p>
                </Option>
              ))}

            {step === 1 &&
              venues.map((v) => (
                <Option
                  key={v.id}
                  selected={draft.venueId === v.id}
                  onSelect={() => choose('venueId', v.id)}
                  media={
                    <div className="relative aspect-[16/10] w-full bg-base-200">
                      <Image
                        src={v.photos[0]!.src}
                        alt={v.photos[0]!.alt}
                        fill
                        sizes="(max-width: 448px) 100vw, 416px"
                        className="object-cover"
                      />
                      <div
                        aria-hidden
                        className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/75 to-transparent"
                      />
                      <div className="absolute inset-x-0 bottom-0 p-3.5">
                        <p className="h-display text-xl text-white">{v.name}</p>
                        <p className="text-xs text-white/75">{v.location}</p>
                      </div>
                    </div>
                  }
                >
                  <p className="text-sm leading-relaxed opacity-70">{v.description}</p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {v.features.map((f) => (
                      <span key={f} className="badge badge-xs border-0 bg-base-200 opacity-70">
                        {f}
                      </span>
                    ))}
                  </div>

                  {v.photos.length > 1 && (
                    <div className="mt-3 grid grid-cols-2 gap-1.5">
                      {v.photos.slice(1).map((p) => (
                        <div key={p.src} className="relative aspect-[3/2] overflow-hidden rounded-selector bg-base-200">
                          <Image src={p.src} alt={p.alt} fill sizes="200px" className="object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
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
                  media={
                    <div className="flex h-14 w-full">
                      {p.swatches.map((hex) => (
                        <span key={hex} className="flex-1" style={{ backgroundColor: hex }} />
                      ))}
                    </div>
                  }
                >
                  <span className="font-semibold">{p.name}</span>
                  <p className="mt-0.5 text-[0.8125rem] opacity-55">{p.description}</p>
                </Option>
              ))}

            {step === 4 && <ProgramTimeline />}

            {step === 5 && (
              <>
                <Summary draft={draft} />
                <div className="mt-6 space-y-2.5">
                  {ATTENDANCE.map((a) => (
                    <Option
                      key={a.id}
                      selected={draft.attending === a.id}
                      onSelect={() => choose('attending', a.id)}
                    >
                      <span className="text-lg font-semibold">{a.label}</span>
                    </Option>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-base-100 via-base-100 to-transparent px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-6">
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
            {!open ? 'Voting closed' : isLast ? 'Submit' : step === 4 ? 'Looks good' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}

/** What they picked, restated just before they commit to coming. */
function Summary({ draft }: { draft: Draft }) {
  const rows = [
    ['When', DATES.find((d) => d.id === draft.dateId)?.label],
    ['Where', VENUES.find((v) => v.id === draft.venueId)?.name],
    ['Food', FOOD.find((f) => f.id === draft.foodId)?.name],
    ['Wear', PALETTES.find((p) => p.id === draft.paletteId)?.name],
  ] as const

  return (
    <dl className="divide-y divide-base-300/70 rounded-box border border-base-300">
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-baseline justify-between gap-3 px-4 py-2.5">
          <dt className="text-xs uppercase tracking-wider opacity-40">{label}</dt>
          <dd className="truncate text-sm font-medium">{value ?? '—'}</dd>
        </div>
      ))}
    </dl>
  )
}

function Option({
  selected,
  onSelect,
  media,
  children,
}: {
  selected: boolean
  onSelect: () => void
  media?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`block w-full overflow-hidden rounded-box border text-left transition-all duration-150 ${
        selected
          ? 'border-primary ring-2 ring-primary'
          : 'border-base-300 hover:border-base-content/25'
      }`}
    >
      {media}
      <div className={`p-4 ${selected ? 'bg-primary/[0.05]' : ''}`}>{children}</div>
    </button>
  )
}
