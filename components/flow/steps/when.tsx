'use client'

import { DATES, TRACK_LABEL, venueSummaryForTrack } from '@/lib/ballot'
import { Deck } from '../deck'
import { OptionCard } from '../option-card'

export function WhenStep({
  value,
  onChoose,
}: {
  value?: string
  onChoose: (id: string) => void
}) {
  return (
    <Deck
      items={DATES}
      cols="md:grid-cols-3"
      fill={false}
      render={(d) => {
        const [month, day] = d.label.split(' ')
        const selected = value === d.id
        return (
          <OptionCard selected={selected} onSelect={() => onChoose(d.id)}>
            <div
              className={`flex shrink-0 flex-col justify-end px-5 pb-4 pt-6 transition-colors duration-150 ${
                selected ? 'bg-primary text-primary-content' : 'bg-base-200'
              }`}
            >
              <span className="eyebrow">{TRACK_LABEL[d.track]}</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-sm opacity-55">{month}</span>
                <span className="folio text-[2.5rem] lg:text-[3rem]">{day}</span>
              </div>
            </div>
            <div className="min-h-0 flex-1 p-4 lg:p-5">
              <p className="text-[0.8125rem] leading-relaxed opacity-50">
                {venueSummaryForTrack(d.track)}
              </p>
            </div>
          </OptionCard>
        )
      }}
    />
  )
}
