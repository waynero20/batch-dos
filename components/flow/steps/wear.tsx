'use client'

import { PALETTES } from '@/lib/ballot'
import { Deck } from '../deck'
import { OptionCard } from '../option-card'

export function WearStep({ value, onChoose }: { value?: string; onChoose: (id: string) => void }) {
  return (
    <Deck
      items={PALETTES}
      label="Colour palettes"
      cols="md:grid-cols-2 lg:grid-cols-4"
      max="max-w-5xl"
      height="h-[min(38dvh,18rem)]"
      render={(p) => (
        <OptionCard selected={value === p.id} onSelect={() => onChoose(p.id)}>
          {/* flex does the arithmetic, so 5-swatch and 3-swatch palettes fill the same
              field exactly. The name sits below rather than over the swatches, so it
              never depends on the first swatch happening to be dark. */}
          <div className="flex min-h-0 flex-1">
            {p.swatches.map((hex, i) => (
              <span key={hex} style={{ backgroundColor: hex, flex: i === 0 ? '2 1 0%' : '1 1 0%' }} />
            ))}
          </div>
          <div className="shrink-0 px-3 py-3.5">
            <p className="h-display text-base lg:text-lg">{p.name}</p>
            <p className="mt-0.5 text-[0.75rem] leading-snug opacity-45">{p.description}</p>
          </div>
        </OptionCard>
      )}
    />
  )
}
