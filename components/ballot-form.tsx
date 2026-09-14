'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  ATTENDANCE,
  DATES,
  FOOD,
  PALETTES,
  STEP_NOTE,
  TRACK_LABEL,
  VENUE_CLEARED_NOTE,
  planRows,
  trackForDate,
  venueLayout,
  venueSummaryForTrack,
  venuesForTrack,
  type DateId,
} from '@/lib/ballot'
import { PROGRAM } from '@/lib/program'
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
const RAIL = 'lg:grid lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-x-10 xl:grid-cols-[20rem_minmax(0,1fr)] xl:gap-x-14'
const storageKey = (name: string) => `batch-dos-ballot:${name}`

export function BallotForm({ name, open }: { name: string; open: boolean }) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  // Answered steps stay reachable from the stepper; unanswered ones do not.
  const [furthest, setFurthest] = useState(0)
  const [draft, setDraft] = useState<Draft>({})
  const [venueCleared, setVenueCleared] = useState(false)
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
  const layout = useMemo(() => venueLayout(venues), [venues])
  const rows = planRows(draft)
  const answeredRows = rows.filter((r) => r.value)

  const current = STEPS[step]!
  const answered = current.field ? Boolean(draft[current.field]) : true
  const isLast = step === STEPS.length - 1

  const goTo = (next: number) => {
    setVenueCleared(false)
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
        <div className="shell pb-3 pt-3.5 lg:flex lg:h-16 lg:items-center lg:gap-8 lg:py-0">
          <div className="mb-2.5 flex items-center justify-between lg:mb-0 lg:shrink-0 lg:gap-5">
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
            <span className="eyebrow hidden lg:block">Batch DOS Reunion — The Ballot</span>
            <span className="max-w-[9rem] truncate text-xs opacity-45 lg:hidden">{name}</span>
          </div>

          {/* .steps is inline-grid, so mx-auto will not centre it — the flex parent does. */}
          <div className="lg:flex lg:min-w-0 lg:flex-1 lg:justify-center">
            <div className="lg:w-full lg:max-w-[44rem]">
              <Stepper labels={STEP_LABELS} current={step} furthest={furthest} onJump={goTo} />
            </div>
          </div>

          <span className="hidden max-w-[14rem] truncate text-sm opacity-45 lg:block">{name}</span>

          {/* Mobile gets the running plan too — the rail card is lg-only. */}
          {answeredRows.length > 0 && (
            <div className="-mx-5 mt-2.5 flex gap-1.5 overflow-x-auto px-5 [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden">
              {answeredRows.map((r) => (
                <button
                  key={r.label}
                  type="button"
                  onClick={() => goTo(r.step)}
                  className="badge badge-sm shrink-0 gap-1.5 border-base-300 bg-base-100 font-normal"
                >
                  <span className="text-[0.5625rem] uppercase tracking-[0.14em] opacity-40">{r.label}</span>
                  <span className="font-medium">{r.value}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 pb-36">
        <div key={step} className="rise shell pt-6 lg:pt-12">
          <div className={RAIL}>
            <div className="lg:sticky lg:top-24 lg:max-h-[calc(100dvh-8rem)] lg:self-start lg:overflow-y-auto lg:overscroll-contain">
              <div className="rule-heavy" />
              <div className="rise-1 flex items-baseline gap-3 pt-3">
                <span className="folio text-[2.5rem] lg:text-[3.25rem]">
                  {String(step + 1).padStart(2, '0')}
                </span>
                <span className="eyebrow">{current.short}</span>
              </div>

              <h1 className="h-display rise-2 mt-4 text-[2.125rem] lg:text-[2.5rem] xl:text-[2.875rem]">
                {current.title}
              </h1>

              {step === 1 ? (
                <p className="rise-3 mt-4 max-w-[34ch] text-sm leading-relaxed opacity-55 lg:text-[0.9375rem]">
                  {TRACK_LABEL[track!]} options, because you picked{' '}
                  {DATES.find((d) => d.id === draft.dateId)?.label}.
                </p>
              ) : (
                <p className="rise-3 mt-4 max-w-[34ch] text-sm leading-relaxed opacity-55 lg:text-[0.9375rem]">
                  {STEP_NOTE[step]}
                </p>
              )}

              {/* On the RSVP step the ballot card carries this, so the rail would say it twice. */}
              <div className={`mt-8 hidden border-t border-base-300 pt-4 ${isLast ? '' : 'lg:block'}`}>
                <dl className="divide-y divide-base-300">
                  {rows.map((r) => (
                    <div key={r.label} className="flex items-baseline justify-between gap-3 py-2.5">
                      <dt className={`eyebrow ${r.step === step ? 'text-primary opacity-100' : ''}`}>
                        {r.label}
                      </dt>
                      <dd className={`truncate text-sm font-medium ${r.value ? '' : 'opacity-25'}`}>
                        {r.value ?? '—'}
                      </dd>
                    </div>
                  ))}
                </dl>
                {venueCleared && (
                  <p className="caption mt-2 text-primary opacity-100">{VENUE_CLEARED_NOTE}</p>
                )}
              </div>
            </div>

            <div className="mt-7 lg:mt-0">
              {step === 0 && (
                <div className="grid gap-3 sm:grid-cols-3 sm:gap-4 lg:gap-5">
                  {DATES.map((d) => {
                    const [month, day] = d.label.split(' ')
                    const selected = draft.dateId === d.id
                    return (
                      <Option
                        key={d.id}
                        selected={selected}
                        onSelect={() => choose('dateId', d.id)}
                        media={
                          <div
                            className={`flex h-24 flex-col justify-end px-5 pb-4 transition-colors duration-150 lg:h-28 ${
                              selected ? 'bg-primary text-primary-content' : 'bg-base-200'
                            }`}
                          >
                            <span className="eyebrow">{TRACK_LABEL[d.track]}</span>
                            <div className="mt-1 flex items-baseline gap-1.5">
                              <span className="text-sm opacity-55">{month}</span>
                              <span className="folio text-[2.5rem]">{day}</span>
                            </div>
                          </div>
                        }
                      >
                        <p className="text-[0.8125rem] leading-relaxed opacity-50">
                          {venueSummaryForTrack(d.track)}
                        </p>
                      </Option>
                    )
                  })}
                </div>
              )}

              {step === 1 && (
                <div className="grid gap-4 md:grid-cols-2 md:items-start md:gap-5 xl:grid-cols-12 xl:gap-8">
                  {venues.map((v, i) => {
                    const hero = v.photos[0]!
                    const extras = v.photos.slice(1)
                    const cols =
                      extras.length <= 2 ? 'grid-cols-2' : extras.length === 3 ? 'grid-cols-3' : 'grid-cols-4'
                    return (
                      <Option
                        key={v.id}
                        className={`${layout[i]!.span} lg:col-span-6`}
                        bodyClass="p-4 lg:p-6"
                        selected={draft.venueId === v.id}
                        onSelect={() => choose('venueId', v.id)}
                        media={
                          <div className="relative aspect-[4/3] w-full bg-base-200 sm:aspect-[16/10]">
                            <Image
                              src={hero.src}
                              alt={hero.alt}
                              fill
                              priority
                              sizes={layout[i]!.sizes}
                              style={hero.focus ? { objectPosition: hero.focus } : undefined}
                              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] group-focus-visible:scale-[1.03]"
                            />
                            <div
                              aria-hidden
                              className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/75 to-transparent"
                            />
                            {/* Bottom-left always — never top-right or bottom-right, where the
                                venues' own watermark pills sit. */}
                            <div className="absolute inset-x-0 bottom-0 p-3.5 lg:p-5">
                              <p className="h-display text-xl text-white lg:text-[1.75rem]">{v.name}</p>
                              <p className="text-xs text-white/75 lg:text-sm">{v.location}</p>
                            </div>
                          </div>
                        }
                      >
                        <p className="text-sm leading-relaxed opacity-70 lg:max-w-[44ch] lg:text-[0.9375rem]">
                          {v.description}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-1.5 lg:gap-2">
                          {v.features.map((f) => (
                            <span key={f} className="badge badge-xs border-0 bg-base-200 opacity-70 lg:badge-sm">
                              {f}
                            </span>
                          ))}
                        </div>

                        <div className="mt-4 border-t border-base-300 pt-4">
                          {extras.length === 0 ? (
                            <>
                              <p className="pull border-l-2 border-primary pl-4 text-[1.375rem] lg:pl-5 lg:text-[1.625rem]">
                                {v.pull}
                              </p>
                              <p className="caption mt-3">{v.location}</p>
                            </>
                          ) : (
                            <div className={`grid gap-1.5 ${cols}`}>
                              {extras.map((p) => (
                                <div
                                  key={p.src}
                                  className="relative aspect-[3/2] overflow-hidden rounded-selector bg-base-200"
                                >
                                  <Image
                                    src={p.src}
                                    alt={p.alt}
                                    fill
                                    loading="lazy"
                                    sizes="(max-width:767px) 24vw, 140px"
                                    style={p.focus ? { objectPosition: p.focus } : undefined}
                                    className="object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </Option>
                    )
                  })}
                </div>
              )}

              {step === 2 && (
                <div className="grid gap-3 md:grid-cols-3 md:gap-5">
                  {FOOD.map((f, i) => {
                    const selected = draft.foodId === f.id
                    return (
                      <Option
                        key={f.id}
                        className="h-full"
                        bodyClass="flex h-full flex-col p-4 lg:p-6"
                        selected={selected}
                        onSelect={() => choose('foodId', f.id)}
                        media={
                          <div
                            className={`flex h-24 flex-col justify-end px-5 pb-4 transition-colors duration-150 lg:h-28 ${
                              selected ? 'bg-primary text-primary-content' : 'bg-base-200'
                            }`}
                          >
                            <span className="eyebrow">Caterer {String(i + 1).padStart(2, '0')}</span>
                            <span className="h-display mt-1 text-[1.375rem] lg:text-[1.625rem]">{f.name}</span>
                          </div>
                        }
                      >
                        <span aria-hidden className="block h-0.5 w-10 bg-base-content" />
                        <p className="mt-4 text-sm opacity-65">{f.tagline}</p>
                        <ul className="mt-5 tabular-nums">
                          {f.details.map((d) => (
                            <li
                              key={d}
                              className="border-b border-base-300/60 py-2.5 text-[0.8125rem] leading-snug opacity-70 last:border-0"
                            >
                              {d}
                            </li>
                          ))}
                        </ul>
                        <p className="caption mt-auto pt-5">Package size follows the final headcount.</p>
                      </Option>
                    )
                  })}
                </div>
              )}

              {step === 3 && (
                <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4 xl:gap-5">
                  {PALETTES.map((p) => (
                    <Option
                      key={p.id}
                      selected={draft.paletteId === p.id}
                      onSelect={() => choose('paletteId', p.id)}
                      media={
                        // flex does the arithmetic, so 5-swatch and 3-swatch palettes fill
                        // the same field exactly. swatches[0] is the dark anchor in all
                        // four, so white type at top-left is legible without a scrim.
                        <div className="relative flex h-28 w-full sm:h-32 lg:h-40">
                          {p.swatches.map((hex, i) => (
                            <span
                              key={hex}
                              style={{ backgroundColor: hex, flex: i === 0 ? '2 1 0%' : '1 1 0%' }}
                            />
                          ))}
                          <p className="h-display absolute left-4 top-4 text-xl text-white">{p.name}</p>
                        </div>
                      }
                    >
                      <p className="text-[0.8125rem] opacity-55 lg:text-sm">{p.description}</p>
                      {/* Not tabular-nums: each hex sits in its own flex cell, so there is no
                          column to align, and tabular figures overflow a 5-swatch row. */}
                      <div aria-hidden className="mt-4 hidden sm:flex">
                        {p.swatches.map((hex) => (
                          <span key={hex} className="flex-1 truncate pr-1 text-[0.6875rem] leading-5 opacity-45">
                            {hex}
                          </span>
                        ))}
                      </div>
                    </Option>
                  ))}
                </div>
              )}

              {step === 4 && <ProgrammeStep />}

              {step === 5 && (
                <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-10">
                  <div className="order-2 grid gap-3 sm:grid-cols-3 sm:gap-4 lg:order-1">
                    {ATTENDANCE.map((a, i) => (
                      <Option
                        key={a.id}
                        selected={draft.attending === a.id}
                        onSelect={() => choose('attending', a.id)}
                        media={
                          <div className="flex h-20 items-end bg-base-200 px-5 pb-4 max-sm:hidden lg:h-24">
                            <RsvpGlyph index={i} />
                          </div>
                        }
                      >
                        <span className="h-display text-xl lg:text-2xl">{a.label}</span>
                      </Option>
                    ))}
                  </div>

                  <dl className="order-1 mb-6 divide-y divide-base-300/70 rounded-box border border-base-300 lg:order-2 lg:mb-0">
                    {rows.map((r) => (
                      <div
                        key={r.label}
                        className="flex items-baseline justify-between gap-3 px-4 py-2.5 lg:px-5 lg:py-3.5"
                      >
                        <dt className="eyebrow">{r.label}</dt>
                        <dd className="truncate text-sm font-medium">{r.value ?? '—'}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* No transform/filter/backdrop-filter on this element or any ancestor — either
          would make `fixed` resolve against it instead of the viewport. */}
      <div className="fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-base-100 via-base-100 to-transparent pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-6">
        <div className={`shell ${RAIL}`}>
          <div className="lg:col-start-2 lg:flex lg:items-center lg:gap-6">
            {error && (
              <div role="alert" className="alert alert-error mb-3 py-2.5 text-sm lg:order-last lg:mb-0">
                {error}
              </div>
            )}
            <button
              type="button"
              disabled={!answered || pending || !open}
              onClick={() => (isLast ? submit() : goTo(step + 1))}
              className="btn btn-primary btn-lg btn-block rounded-field lg:w-auto lg:min-w-[16rem] lg:flex-none"
            >
              {pending && <span className="loading loading-spinner loading-sm" />}
              {!open ? 'Voting closed' : isLast ? 'Submit' : step === 4 ? 'Looks good' : 'Next'}
            </button>
            <div className="hidden lg:flex lg:items-center lg:gap-3">
              <span className="eyebrow">
                Question {step + 1} of {STEPS.length}
              </span>
              <span className="block h-px w-32 bg-base-300">
                <span
                  className="block h-px bg-primary"
                  style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Two independent lists rather than one CSS-column list: a single <ol> in columns
 *  breaks the per-item absolute rail, whose offsets are hand-tuned. */
function ProgrammeStep() {
  const half = Math.ceil(PROGRAM.length / 2)
  const games = PROGRAM.filter((i) => i.kind === 'games').length

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-x-12 xl:gap-x-16">
      <div>
        <div className="lg:hidden">
          <ProgramTimeline />
        </div>
        <div className="hidden lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
          <ProgramTimeline items={PROGRAM.slice(0, half)} />
          <ProgramTimeline items={PROGRAM.slice(half)} />
        </div>
      </div>

      <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
        <div className="rule-heavy" />
        <p className="eyebrow pt-3">At a glance</p>
        <dl className="mt-3">
          {[
            ['Runs', '8:00am — till late'],
            ['Moments', String(PROGRAM.length)],
            ['Games', String(games)],
          ].map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between border-b border-base-300 py-2.5">
              <dt className="caption">{k}</dt>
              <dd className="text-sm font-medium tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="pull mt-8 border-l-2 border-primary pl-5 text-[1.375rem] xl:text-[1.5rem]">
          Everyone gets a moment to share what the last nine years looked like.
        </p>
        <p className="caption mt-3">10:15am — Asa Na Ta?</p>
      </aside>
    </div>
  )
}

function RsvpGlyph({ index }: { index: number }) {
  const paths = ['m4 12.5 5.2 5.2L20 7', 'M5 12h14', 'm6 6 12 12M18 6 6 18']
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-7 opacity-30"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={paths[index]} />
    </svg>
  )
}

function Option({
  selected,
  onSelect,
  media,
  className = '',
  bodyClass = 'p-4 lg:p-5',
  children,
}: {
  selected: boolean
  onSelect: () => void
  media?: React.ReactNode
  className?: string
  bodyClass?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`group relative block w-full overflow-hidden rounded-box border text-left transition-[border-color,background-color] duration-150 ${
        selected ? 'border-primary ring-2 ring-primary' : 'border-base-300 hover:border-base-content/25'
      } ${className}`}
    >
      {/* Top-RIGHT: every plate sets its own type top-left or bottom-left, so this is the
          one corner that never collides — and on Bakhawan it lands over the venue's own
          watermark pill, which is a bonus rather than a clash. */}
      {selected && (
        <span
          aria-hidden
          className="absolute right-3 top-3 z-10 flex size-7 items-center justify-center rounded-full bg-primary text-primary-content shadow-sm"
        >
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="m4 12.5 5.2 5.2L20 7" />
          </svg>
        </span>
      )}
      {media}
      <div className={`${bodyClass} ${selected ? 'bg-primary/[0.05]' : ''}`}>{children}</div>
    </button>
  )
}
