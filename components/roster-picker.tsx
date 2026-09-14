'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  roster: readonly string[]
  voted: readonly string[]
  open: boolean
}

/** "Dela Cruz, Juan" also matches a search for "juan dela". */
const matches = (name: string, query: string) => {
  const haystack = name.toLowerCase().replace(/,/g, ' ')
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term))
}

export function RosterPicker({ roster, voted, open }: Props) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const votedSet = useMemo(() => new Set(voted), [voted])

  const results = useMemo(
    () => (query.trim() ? roster.filter((n) => matches(n, query)) : roster),
    [roster, query],
  )

  const pick = (name: string) => {
    router.push(`/vote?name=${encodeURIComponent(name)}`)
  }

  return (
    <div className="step-in">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <label htmlFor="name-search" className="text-sm font-bold tracking-wide text-slate">
          Kinsa ka? <span className="font-medium opacity-70">· Who are you?</span>
        </label>
        <span className="shrink-0 text-xs font-semibold tabular-nums text-slate/70">
          {votedSet.size} / {roster.length} nakaboto
        </span>
      </div>

      <div className="relative">
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate/45"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.6-3.6" />
        </svg>
        <input
          id="name-search"
          type="search"
          inputMode="search"
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="I-type imong ngalan…"
          className="w-full rounded-2xl border-2 border-navy/15 bg-paper py-4 pl-12 pr-4 text-base font-medium text-navy shadow-sm outline-none transition placeholder:text-slate/40 focus:border-navy focus:ring-4 focus:ring-sun/40"
        />
      </div>

      <p aria-live="polite" className="sr-only">
        {results.length} names match
      </p>

      <ul className="mt-4 max-h-[52vh] space-y-2 overflow-y-auto overscroll-contain pb-2 pr-1">
        {results.map((name) => {
          const done = votedSet.has(name)
          return (
            <li key={name}>
              <button
                type="button"
                onClick={() => pick(name)}
                className="card flex w-full items-center gap-3 px-4 py-3.5 text-left"
              >
                <span className="flex-1 font-semibold text-navy">{name}</span>

                {done ? (
                  <span className="chip bg-navy/8 text-slate">
                    <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m4 12.5 5.2 5.2L20 7" />
                    </svg>
                    Nakaboto
                  </span>
                ) : (
                  <span className="text-slate/35" aria-hidden>
                    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 6 6 6-6 6" />
                    </svg>
                  </span>
                )}
              </button>
            </li>
          )
        })}

        {results.length === 0 && (
          <li className="rounded-2xl border-2 border-dashed border-navy/15 px-4 py-8 text-center">
            <p className="font-semibold text-navy">Wala nakit-an si “{query.trim()}”</p>
            <p className="mt-1 text-sm text-slate/70">
              Try a surname, or tell the committee if you’re missing from the list.
            </p>
          </li>
        )}
      </ul>

      {!open && (
        <p className="mt-4 rounded-xl bg-butter px-4 py-3 text-center text-sm font-semibold text-slate">
          Sirado na ang botohan — voting is closed.
        </p>
      )}
    </div>
  )
}
