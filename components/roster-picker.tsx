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

  return (
    <div>
      <label className="input input-lg w-full rounded-field">
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="size-[1.1em] opacity-45"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.6-3.6" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find your name"
          autoComplete="off"
          aria-label="Find your name"
        />
      </label>

      <p aria-live="polite" className="sr-only">
        {results.length} of {roster.length} names shown
      </p>

      <ul className="mt-2 max-h-[50vh] divide-y divide-base-300/70 overflow-y-auto overscroll-contain">
        {results.map((name) => (
          <li key={name}>
            <button
              type="button"
              onClick={() => router.push(`/vote?name=${encodeURIComponent(name)}`)}
              className="group flex w-full items-center gap-3 py-3.5 text-left transition-colors hover:bg-base-200/60"
            >
              <span className="flex-1 truncate text-[0.95rem] font-medium">{name}</span>

              {votedSet.has(name) ? (
                <span className="badge badge-sm border-0 bg-base-200 font-medium text-base-content/60">
                  Voted
                </span>
              ) : (
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  className="size-4 opacity-25 transition-opacity group-hover:opacity-50"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 6 6 6-6 6" />
                </svg>
              )}
            </button>
          </li>
        ))}

        {results.length === 0 && (
          <li className="py-10 text-center text-sm opacity-50">No match for “{query.trim()}”</li>
        )}
      </ul>

      {!open && (
        <div role="status" className="alert alert-warning mt-4 py-2.5 text-sm">
          Voting is closed.
        </div>
      )}
    </div>
  )
}
