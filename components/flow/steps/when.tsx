'use client'

import { DATES, TRACK_LABEL, venueSummaryForTrack } from '@/lib/ballot'
import { Deck } from '../deck'
import { OptionCard } from '../option-card'

export function WhenStep({ value, onChoose }: { value?: string; onChoose: (id: string) => void }) {
  return (
    <Deck
      items={DATES}
      label="Dates"
      cols="md:grid-cols-3"
      max="max-w-3xl"
      render={(d) => {
        const [month, day] = d.label.split(' ')
        const selected = value === d.id
        return (
          <OptionCard selected={selected} onSelect={() => onChoose(d.id)}>
            <div className="flex flex-col items-center px-5 pb-5 pt-7">
              <span className="eyebrow">{TRACK_LABEL[d.track]}</span>
              <span
                className={`folio mt-2.5 text-[3.25rem] transition-colors duration-300 ${
                  selected ? 'text-primary' : ''
                }`}
              >
                {day}
              </span>
              <span className="mt-0.5 text-sm opacity-45">{month}</span>
            </div>
            <div className="border-t border-base-300/70 px-4 py-3">
              <p className="text-[0.75rem] leading-relaxed opacity-45">
                {venueSummaryForTrack(d.track)}
              </p>
            </div>
          </OptionCard>
        )
      }}
    />
  )
}
