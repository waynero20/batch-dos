import type { ReactNode } from 'react'

/**
 * "Pero somehow, kita japon si" on one line, the name large beneath it. The names scene and the
 * final scene share this exact layout so the phrase does not shift by a pixel between them.
 * The connector sits in a fixed-width slot, so "si" becoming "ang" cannot re-centre the line.
 */
export function Phrase({ lead, connector, children }: { lead: string; connector: ReactNode; children: ReactNode }) {
  return (
    <p className="intro-phrase">
      <span className="intro-phrase-lead">
        {lead} <span className="intro-connector">{connector}</span>
      </span>
      <span className="intro-phrase-name">{children}</span>
    </p>
  )
}
