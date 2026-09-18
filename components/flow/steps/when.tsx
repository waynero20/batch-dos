'use client'

import { DATES, TRACK_LABEL } from '@/lib/ballot'
import { Deck } from '../deck'
import { OptionCard } from '../option-card'

const WEEKDAY = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'UTC' })

/**
 * The three dates, directly.
 *
 * Only three days are ever pickable, so paging through a calendar to find them made
 * someone hunt for what a single glance could show. Each is its own card: the day,
 * the weekday, and which track it commits to.
 */
export function WhenStep({ value, onChoose }: { value?: string; onChoose: (id: string) => void }) {
  return (
    <Deck
      items={DATES}
      label="Dates"
      cols="md:grid-cols-3"
      max="max-w-3xl"
      render={(d) => (
        <OptionCard selected={value === d.id} onSelect={() => onChoose(d.id)}>
          <div className="px-5 py-6 text-center">
            <span className="eyebrow">{TRACK_LABEL[d.track]}</span>
            <p className="h-display mt-2 text-[1.75rem] lg:text-[2rem]">{d.label}</p>
            <p className="mt-1 text-[0.8125rem] opacity-45">
              {WEEKDAY.format(new Date(`${d.iso}T00:00:00Z`))}
            </p>
          </div>
        </OptionCard>
      )}
    />
  )
}
