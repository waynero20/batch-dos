'use client'

import Image from 'next/image'
import type { VenueOption } from '@/lib/ballot'
import { Deck } from '../deck'
import { OptionCard } from '../option-card'

/** Two venues per track, always — so each card owns half a wide screen or the whole
 *  of a phone. One `sizes` covers both, with no per-venue grading to drift. */
const SIZES = '(max-width: 767px) 92vw, (max-width: 1279px) 46vw, 520px'

/**
 * The venue as a photograph, not a tile.
 *
 * The card is the picture: no white body, nothing cropped down to make room for a
 * description that the feature list already covers. Name, place and what is there sit
 * over a scrim at the foot of the image, which is the only part of the photo that can
 * afford to carry type.
 */
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
      cols="md:grid-cols-2"
      max="max-w-4xl"
      height="h-[calc(min(54dvh,26rem)+1rem)]"
      render={(v) => {
        const hero = v.photos[0]!
        return (
          <OptionCard selected={value === v.id} onSelect={() => onChoose(v.id)}>
            <div className="absolute inset-0">
              <Image
                src={hero.src}
                alt={hero.alt}
                fill
                priority
                sizes={SIZES}
                style={hero.focus ? { objectPosition: hero.focus } : undefined}
                className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.05]"
              />
            </div>

            {/* Deep enough to hold three lines of white type at the foot of any of the
                four photos, two of which are bright sky. */}
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-black/90 via-black/55 to-transparent"
            />

            <div className="relative z-10 mt-auto w-full px-5 pb-5 pt-8">
              <p className="h-display text-[1.5rem] leading-tight text-white lg:text-[1.875rem]">
                {v.name}
              </p>
              <p className="mt-1 text-[0.8125rem] text-white/70 lg:text-sm">{v.location}</p>
              {/* Each feature is its own nowrap span, so a narrow card breaks between
                  them and never down the middle of "Sleeps over". */}
              {/* Separated by space, not by a dot: with four features the line wraps
                  on a phone, and any punctuation between them is left dangling at the
                  break. Each feature stays nowrap so "Sleeps over" never splits. */}
              <p className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[0.625rem] font-medium uppercase tracking-[0.14em] text-white/60 lg:text-[0.6875rem]">
                {v.features.map((feature) => (
                  <span key={feature} className="whitespace-nowrap">
                    {feature}
                  </span>
                ))}
              </p>
            </div>
          </OptionCard>
        )
      }}
    />
  )
}
