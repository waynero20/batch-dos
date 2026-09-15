'use client'

import Image from 'next/image'
import type { VenueOption } from '@/lib/ballot'
import { Deck } from '../deck'
import { OptionCard } from '../option-card'

/** Two venues per track, always — so each card owns half a wide screen or the whole
 *  of a phone. One `sizes` covers both, with no per-venue grading to drift. */
const SIZES = '(max-width: 767px) 100vw, (max-width: 1439px) 46vw, 640px'

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
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              />
              <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/75 to-transparent"
              />
              {/* Bottom-left always — never the right corners, where the venues' own
                  watermark pills sit. */}
              <div className="absolute inset-x-0 bottom-0 p-4 lg:p-5">
                <p className="h-display text-xl text-white lg:text-[1.75rem]">{v.name}</p>
                <p className="text-xs text-white/75 lg:text-sm">{v.location}</p>
              </div>
            </div>

            <div className="shrink-0 p-4 lg:p-5">
              <p className="line-clamp-2 text-[0.8125rem] leading-relaxed opacity-65 lg:text-sm">
                {v.description}
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {v.features.map((f) => (
                  <span key={f} className="badge badge-xs border-0 bg-base-200 opacity-70 lg:badge-sm">
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
