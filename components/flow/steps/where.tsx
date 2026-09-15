'use client'

import Image from 'next/image'
import type { VenueOption } from '@/lib/ballot'
import { Deck } from '../deck'
import { OptionCard } from '../option-card'

/** Two venues per track, always — so each card owns half a wide screen or the whole
 *  of a phone. One `sizes` covers both, with no per-venue grading to drift. */
const SIZES = '(max-width: 767px) 100vw, (max-width: 1279px) 46vw, 520px'

export function WhereStep({
  venues,
  value,
  onChoose,
}: {
  venues: readonly VenueOption[]
  value?: string
  onChoose: (id: string) => void
}) {
  return (
    <Deck
      items={venues}
      label="Venues"
      cols="md:grid-cols-2"
      max="max-w-4xl"
      height="h-[min(46dvh,22rem)]"
      render={(v) => {
        const hero = v.photos[0]!
        return (
          <OptionCard selected={value === v.id} onSelect={() => onChoose(v.id)}>
            {/* The photo takes whatever height is left after the body — that is what
                keeps a tall phone and a short laptop on the same one screen. */}
            <div className="relative min-h-0 flex-1 bg-base-200">
              <Image
                src={hero.src}
                alt={hero.alt}
                fill
                priority
                sizes={SIZES}
                style={hero.focus ? { objectPosition: hero.focus } : undefined}
                className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
              />
              <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 to-transparent"
              />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="h-display text-[1.375rem] text-white lg:text-[1.625rem]">{v.name}</p>
                <p className="text-xs text-white/70">{v.location}</p>
              </div>
            </div>

            <div className="shrink-0 px-4 py-3.5">
              <p className="line-clamp-2 text-[0.8125rem] leading-relaxed opacity-60">
                {v.description}
              </p>
              <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                {v.features.map((f) => (
                  <span key={f} className="chip">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </OptionCard>
        )
      }}
    />
  )
}
