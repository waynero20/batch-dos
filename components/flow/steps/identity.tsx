'use client'

import { useEffect, useMemo, useState } from 'react'
import { rankRoster } from '@/lib/roster-search'

/**
 * The way in. An input instead of 73 names, because the list was the one screen that
 * could never honour the no-scroll rule.
 *
 * Already-voted names stay selectable: `submitBallot` rewrites a member's row in
 * place, so coming back to change an answer is supported, and hiding those names
 * would only make it look broken.
 */
export function IdentityStep({
  roster,
  voted,
  value,
  onPick,
}: {
  roster: readonly string[]
  voted: readonly string[]
  value?: string
  onPick: (name: string) => void
}) {
  const [query, setQuery] = useState(value ?? '')
  const [cursor, setCursor] = useState(0)
  const listId = 'roster-results'

  const votedSet = useMemo(() => new Set(voted), [voted])
  const results = useMemo(() => rankRoster(roster, query), [roster, query])

  // A fresh query invalidates wherever the arrow keys had got to.
  useEffect(() => setCursor(0), [query])

  const typing = query.trim().length > 0

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center">
      <label className="field shrink-0">
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="size-[1.15em] shrink-0 opacity-35"
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
          onKeyDown={(e) => {
            if (results.length === 0) return
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setCursor((c) => Math.min(c + 1, results.length - 1))
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setCursor((c) => Math.max(c - 1, 0))
            } else if (e.key === 'Enter') {
              e.preventDefault()
              const name = results[cursor]
              if (name) onPick(name)
            }
          }}
          placeholder="Type your name"
          autoComplete="off"
          autoCapitalize="words"
          aria-label="Type your name"
          aria-controls={listId}
          aria-expanded={typing}
        />
      </label>

      <p aria-live="polite" className="sr-only">
        {typing ? `${results.length} names match` : ''}
      </p>

      <div id={listId} className="mt-3 w-full">
        {typing && results.length === 0 && (
          <p className="pt-3 text-center text-sm opacity-45">
            No match for “{query.trim()}”. Try your surname, or tell the committee.
          </p>
        )}

        <ul className="w-full">
          {results.map((name, i) => (
            <li key={name}>
              <button
                type="button"
                onClick={() => onPick(name)}
                onMouseEnter={() => setCursor(i)}
                aria-current={value === name ? 'true' : undefined}
                className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 transition-colors duration-200 ${
                  i === cursor ? 'bg-base-200' : ''
                }`}
              >
                <span
                  className={`truncate text-[0.95rem] ${
                    value === name ? 'font-semibold text-primary' : 'font-medium'
                  }`}
                >
                  {name}
                </span>
                {votedSet.has(name) && <span className="chip shrink-0">Voted</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
