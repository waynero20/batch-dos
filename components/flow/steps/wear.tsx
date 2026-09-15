'use client'

import { PALETTES } from '@/lib/ballot'
import { Deck } from '../deck'
import { OptionCard } from '../option-card'

export function WearStep({
  value,
  onChoose,
}: {
  value?: string
  onChoose: (id: string) => void
}) {
  return (
    <Deck
      items={PALETTES}
      cols="md:grid-cols-2 lg:grid-cols-4"
      render={(p) => (
        <OptionCard selected={value === p.id} onSelect={() => onChoose(p.id)}>
          {/* flex does the arithmetic, so 5-swatch and 3-swatch palettes fill the same
              field exactly. swatches[0] is the dark anchor in all four, so white type
              at top-left is legible without a scrim. */}
          <div className="relative flex min-h-0 flex-1">
            {p.swatches.map((hex, i) => (
              <span key={hex} style={{ backgroundColor: hex, flex: i === 0 ? '2 1 0%' : '1 1 0%' }} />
            ))}
            <p className="h-display absolute left-4 top-4 text-xl text-white lg:text-2xl">{p.name}</p>
          </div>
          <div className="shrink-0 p-4 lg:p-5">
            <p className="text-[0.8125rem] opacity-55 lg:text-sm">{p.description}</p>
          </div>
        </OptionCard>
      )}
    />
  )
}
