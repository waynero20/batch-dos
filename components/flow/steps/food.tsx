'use client'

import { FOOD } from '@/lib/ballot'
import { Deck } from '../deck'
import { OptionCard } from '../option-card'

/**
 * The caterer as a price list.
 *
 * What separates these three is what they cost and how they are sold — by package, by
 * tray, by head — so the card is built around the prices rather than around three
 * sentences that happen to contain them. Equal heights, so the numbers line up across
 * the row on a wide screen.
 */
export function FoodStep({ value, onChoose }: { value?: string; onChoose: (id: string) => void }) {
  return (
    <Deck
      items={FOOD}
      cols="md:grid-cols-3"
      max="max-w-4xl"
      height="h-[calc(min(48dvh,23rem)+1rem)]"
      render={(f, i) => {
        // `as const satisfies` narrows each entry to its own literal type, so an
        // optional field only exists on the entries that declare it.
        const place = 'place' in f ? f.place : undefined
        return (
        <OptionCard selected={value === f.id} onSelect={() => onChoose(f.id)}>
          <div className="shrink-0 px-4 pb-3 pt-5 lg:pt-6">
            <span className="eyebrow">Caterer {String(i + 1).padStart(2, '0')}</span>
            <p className="h-display mt-1.5 text-[1.25rem] lg:text-[1.4375rem]">{f.name}</p>
            <p className="mt-1 text-[0.75rem] opacity-45 lg:text-[0.8125rem]">{f.tagline}</p>
          </div>

          <ul className="min-h-0 flex-1 border-t border-base-300/70 px-4">
            {f.rows.map((row) => (
              <li key={row.label} className="border-b border-base-300/50 py-2 last:border-0">
                <p className="text-[0.625rem] font-medium uppercase tracking-[0.12em] opacity-40">
                  {row.label}
                </p>
                <p className="folio mt-0.5 text-[1.0625rem] lg:text-[1.125rem]">{row.price}</p>
                {row.note && (
                  <p className="text-[0.6875rem] leading-snug opacity-45">{row.note}</p>
                )}
              </li>
            ))}
          </ul>

          {/* Pushed to the foot so the two-row card still fills its share of the row. */}
          <p className="caption shrink-0 border-t border-base-300/70 px-4 py-2">
            {place ?? 'Package size follows the final headcount.'}
          </p>
        </OptionCard>
        )
      }}
    />
  )
}
