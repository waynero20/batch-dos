'use client'

import { FOOD } from '@/lib/ballot'
import { Deck } from '../deck'
import { OptionCard } from '../option-card'

export function FoodStep({
  value,
  onChoose,
}: {
  value?: string
  onChoose: (id: string) => void
}) {
  return (
    <Deck
      items={FOOD}
      cols="md:grid-cols-3"
      fill={false}
      render={(f, i) => {
        const selected = value === f.id
        return (
          <OptionCard selected={selected} onSelect={() => onChoose(f.id)}>
            <div
              className={`flex shrink-0 flex-col justify-end px-5 pb-4 pt-6 transition-colors duration-150 ${
                selected ? 'bg-primary text-primary-content' : 'bg-base-200'
              }`}
            >
              <span className="eyebrow">Caterer {String(i + 1).padStart(2, '0')}</span>
              <span className="h-display mt-1 text-[1.375rem] lg:text-[1.625rem]">{f.name}</span>
            </div>

            <div className="flex min-h-0 flex-1 flex-col p-4 lg:p-5">
              <p className="shrink-0 text-[0.8125rem] opacity-65">{f.tagline}</p>
              <ul className="mt-3 min-h-0 tabular-nums">
                {f.details.map((d) => (
                  <li
                    key={d}
                    className="border-b border-base-300/60 py-2 text-[0.75rem] leading-snug opacity-70 last:border-0 lg:text-[0.8125rem]"
                  >
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </OptionCard>
        )
      }}
    />
  )
}
