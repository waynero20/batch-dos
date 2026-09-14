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

type Draft = {
  dateId?: string
  venueId?: string
  foodId?: string
  paletteId?: string
  attending?: string
}

const STEPS = [
  { key: 'dateId', bisaya: 'Kanus-a ta mag Kita?', english: 'When do we meet?' },
  { key: 'venueId', bisaya: 'Asa ta mo Adto?', english: 'Where do we go?' },
  { key: 'foodId', bisaya: 'Unsa ato Kan-on?', english: 'What do we eat?' },
  { key: 'paletteId', bisaya: 'Unsa ato Isul-ob?', english: 'What do we wear?' },
  { key: 'attending', bisaya: 'Kita nya ta?', english: 'Are you joining?' },
] as const

const storageKey = (name: string) => `batch-dos-ballot:${name}`

export function BallotForm({ name, open }: { name: string; open: boolean }) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<Draft>({})
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  // Answers survive a closed tab or a dropped connection.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey(name))
      if (saved) setDraft(JSON.parse(saved) as Draft)
    } catch {
      // Private browsing or blocked storage — the ballot still works, it just won't resume.
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
      <header className="sticky top-0 z-20 border-b border-navy/8 bg-alice/85 px-5 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <button
            type="button"
            onClick={() => (step === 0 ? router.push('/') : setStep((s) => s - 1))}
            className="-ml-1 rounded-lg p-1.5 text-slate transition hover:bg-navy/6"
            aria-label={step === 0 ? 'Back to the name list' : 'Previous question'}
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 6-6 6 6 6" />
            </svg>
          </button>

          <ol className="flex flex-1 items-center gap-1.5" aria-label="Progress">
            {STEPS.map((s, i) => (
              <li
                key={s.key}
                aria-current={i === step ? 'step' : undefined}
                className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                  i < step ? 'bg-navy' : i === step ? 'bg-sun' : 'bg-navy/12'
                }`}
              />
            ))}
          </ol>

          <span className="max-w-[7.5rem] truncate text-xs font-semibold text-slate">{name}</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-5 pb-40 pt-7">
        <div key={step} className="step-in">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate/55">
            Pangutana {step + 1} sa {STEPS.length}
          </p>
          <h1 className="display mt-1.5 text-[clamp(2rem,9vw,2.75rem)] text-navy">
            {current.bisaya}
          </h1>
          <p className="mt-1.5 text-sm font-medium text-slate/70">{current.english}</p>

          <div className="mt-6 space-y-3">
            {step === 0 &&
              DATES.map((d) => (
                <Option
                  key={d.id}
                  selected={draft.dateId === d.id}
                  onSelect={() => choose('dateId', d.id)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xl font-extrabold text-navy">{d.label}</p>
                      <p className="mt-0.5 text-sm text-slate/70">{d.sublabel}</p>
                    </div>
                    <span
                      className={`chip ${d.track === 'city' ? 'bg-sky/30 text-navy' : 'bg-butter text-slate'}`}
                    >
                      {TRACK_LABEL[d.track]}
                    </span>
                  </div>
                </Option>
              ))}

            {step === 1 && (
              <>
                <p className="mb-1 rounded-xl bg-navy/5 px-3.5 py-2.5 text-[0.8rem] leading-relaxed text-slate">
                  Kay gipili nimo ang <strong className="font-bold">{TRACK_LABEL[track!]}</strong>, mao
                  ni ang mga lugar nga pwede.
                </p>
                {venues.map((v) => (
                  <Option
                    key={v.id}
                    selected={draft.venueId === v.id}
                    onSelect={() => choose('venueId', v.id)}
                  >
                    <p className="text-xl font-extrabold text-navy">{v.name}</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate/80">{v.description}</p>
                    <p className="mt-2 flex items-start gap-1.5 text-xs text-slate/60">
                      <svg viewBox="0 0 24 24" className="mt-px size-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11Z" />
                        <circle cx="12" cy="10" r="2.4" />
                      </svg>
                      {v.location}
                    </p>
                    <ul className="mt-2.5 flex flex-wrap gap-1.5">
                      {v.features.map((f) => (
                        <li key={f} className="chip bg-cream text-slate">
                          {f}
                        </li>
                      ))}
                    </ul>
                  </Option>
                ))}
              </>
            )}

            {step === 2 &&
              FOOD.map((f) => (
                <Option
                  key={f.id}
                  selected={draft.foodId === f.id}
                  onSelect={() => choose('foodId', f.id)}
                >
                  <p className="text-xl font-extrabold text-navy">{f.name}</p>
                  <p className="mt-0.5 text-sm font-medium text-gold">{f.tagline}</p>
                  <ul className="mt-2.5 space-y-1">
                    {f.details.map((d) => (
                      <li key={d} className="flex gap-2 text-sm text-slate/80">
                        <span aria-hidden className="text-sun">
                          ◆
                        </span>
                        {d}
                      </li>
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
                  <div className="flex items-center gap-3.5">
                    <div className="flex shrink-0 overflow-hidden rounded-xl shadow-sm ring-1 ring-navy/10">
                      {p.swatches.map((hex) => (
                        <span
                          key={hex}
                          className="block size-9"
                          style={{ backgroundColor: hex }}
                          title={hex}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mt-3 text-xl font-extrabold text-navy">{p.name}</p>
                  <p className="mt-0.5 text-sm text-slate/70">{p.description}</p>
                </Option>
              ))}

            {step === 4 &&
              ATTENDANCE.map((a) => (
                <Option
                  key={a.id}
                  selected={draft.attending === a.id}
                  onSelect={() => choose('attending', a.id)}
                >
                  <p className="text-xl font-extrabold text-navy">{a.label}</p>
                  <p className="mt-0.5 text-sm text-slate/70">{a.sublabel}</p>
                </Option>
              ))}
          </div>

          {isLast && (
            <p className="mt-5 text-center text-xs leading-relaxed text-slate/60">
              Dili pa ni final. The committee decides once everyone has voted — you can change
              your answer until then.
            </p>
          )}
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-navy/8 bg-alice/90 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md">
        <div className="mx-auto max-w-lg">
          {error && (
            <p
              role="alert"
              className="mb-2.5 rounded-xl bg-gold/15 px-3.5 py-2.5 text-sm font-medium leading-relaxed text-slate"
            >
              {error}
            </p>
          )}

          <button
            type="button"
            disabled={!answered || pending || !open}
            onClick={() => (isLast ? submit() : setStep((s) => s + 1))}
            className="w-full rounded-2xl bg-navy px-6 py-4 text-base font-extrabold text-butter shadow-lg transition active:scale-[0.985] disabled:cursor-not-allowed disabled:bg-navy/25 disabled:text-paper/80 disabled:shadow-none"
          >
            {!open
              ? 'Sirado na ang botohan'
              : pending
                ? 'Gipadala…'
                : isLast
                  ? 'I-submit ang boto'
                  : answered
                    ? 'Sunod →'
                    : 'Pili usa'}
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
      data-selected={selected}
      className="card relative block w-full p-4 text-left"
    >
      {selected && (
        <span className="pop absolute right-3.5 top-3.5 grid size-6 place-items-center rounded-full bg-navy text-butter">
          <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="m4 12.5 5.2 5.2L20 7" />
          </svg>
        </span>
      )}
      {children}
    </button>
  )
}
