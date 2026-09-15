import type { CSSProperties } from 'react'

export const ms = (n: number) => `${n}ms`

/** Scene timings as the CSS custom properties intro.css choreographs from. */
export function timingVars(t: { d?: number; in?: number; out?: number }, extra: Record<string, string | number> = {}) {
  const vars: Record<string, string | number> = { ...extra }
  if (t.d !== undefined) vars['--d'] = ms(t.d)
  if (t.in !== undefined) vars['--in'] = ms(t.in)
  if (t.out !== undefined) vars['--out'] = ms(t.out)
  return vars as CSSProperties
}
