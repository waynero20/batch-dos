/**
 * The stage is one big "next" target, but the Skip and Next buttons sit on top of it.
 * Without this, a tap on either would run its own handler *and* advance the scene
 * underneath it — Skip would leave mid-fade from the wrong scene, Next would jump two.
 */

/** Only the part of an event target we need. Plain objects stand in for it under `node`. */
type ClickTarget = { closest?: (selector: string) => unknown } | null | undefined

export function advancesOnClick(target: ClickTarget): boolean {
  return target?.closest?.('button') == null
}
