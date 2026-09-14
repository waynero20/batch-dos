import { PROGRAM, PROGRAM_KIND_LABEL, type ProgramItem, type ProgramKind } from '@/lib/program'

/** Games and the chill night are what people actually turn up for, so they get a mark. */
const HIGHLIGHTED: readonly ProgramKind[] = ['games', 'night']

export function ProgramTimeline({ items = PROGRAM }: { items?: readonly ProgramItem[] } = {}) {
  return (
    <ol className="relative lg:text-[0.9375rem]">
      {items.map((item, i) => {
        const last = i === items.length - 1
        return (
          <li key={`${item.start}-${item.title}`} className="relative flex gap-3.5 pb-5 last:pb-0 lg:pb-6">
            {/* Rail. Stops at the final dot rather than running past it. */}
            {!last && (
              <span
                aria-hidden
                className="absolute left-[4.55rem] top-2 h-full w-px bg-base-300"
              />
            )}

            <time className="w-16 shrink-0 pt-px text-right text-xs tabular-nums opacity-50">
              {item.start}
            </time>

            <span
              aria-hidden
              className={`relative z-10 mt-[0.3rem] size-[7px] shrink-0 rounded-full ring-4 ring-base-100 ${
                HIGHLIGHTED.includes(item.kind) ? 'bg-primary' : 'bg-base-300'
              }`}
            />

            <div className="min-w-0 flex-1 pb-0.5">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-[0.9375rem] font-medium leading-snug">{item.title}</h3>
                {HIGHLIGHTED.includes(item.kind) && (
                  <span className="shrink-0 text-[0.625rem] font-medium uppercase tracking-wider text-primary">
                    {PROGRAM_KIND_LABEL[item.kind]}
                  </span>
                )}
              </div>
              {item.end && (
                <p className="mt-0.5 text-xs opacity-40">
                  {item.end === 'till late' ? 'till late' : `until ${item.end}`}
                </p>
              )}
              {item.note && (
                <p className="mt-1 max-w-[46ch] text-[0.8125rem] leading-relaxed opacity-55 lg:border-l lg:border-base-300 lg:pl-4">{item.note}</p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
