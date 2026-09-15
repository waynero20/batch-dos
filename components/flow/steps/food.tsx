'use client'

import { FOOD } from '@/lib/ballot'
import { Deck } from '../deck'
import { OptionCard } from '../option-card'

export function FoodStep({ value, onChoose }: { value?: string; onChoose: (id: string) => void }) {
  return (
    <Deck
      items={FOOD}
      label="Caterers"
      cols="md:grid-cols-3"
      max="max-w-4xl"
      render={(f, i) => (
        <OptionCard selected={value === f.id} onSelect={() => onChoose(f.id)}>
          <div className="px-5 pb-4 pt-6">
            <span className="eyebrow">Caterer {String(i + 1).padStart(2, '0')}</span>
            <p className="h-display mt-1.5 text-[1.375rem] lg:text-[1.5rem]">{f.name}</p>
            <p className="mt-1 text-[0.8125rem] opacity-50">{f.tagline}</p>
          </div>
          <ul className="border-t border-base-300/70 px-4 py-1 tabular-nums">
            {f.details.map((d) => (
              <li
                key={d}
                className="border-b border-base-300/50 py-2 text-[0.75rem] leading-snug opacity-60 last:border-0"
              >
                {d}
              </li>
            ))}
          </ul>
        </OptionCard>
      )}
    />
  )
}
