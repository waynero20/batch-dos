/**
 * Typeahead over the masterlist.
 *
 * The flow's first screen replaces the A–Z list with an input, so this is the only
 * way in — it has to forgive how people actually type their own name: first name
 * first, no comma, and without reaching for the ñ.
 *
 * Kept out of `lib/roster.ts`, which `pnpm seed` regenerates wholesale.
 */

/** Accents folded and the filing comma dropped: "Perez, Niña" -> "perez nina". */
const fold = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/,/g, ' ')
    .toLowerCase()

/** Lower is better. A term that opens the name beats one that opens a word, which
 *  beats one buried inside it — so "ros" offers the Ros- surnames before Axlrose.
 *
 *  Every occurrence is weighed, not just the first: in "Veran, Ran Clark" the leading
 *  "Ve(ran)" would otherwise mask the real "Ran" and file him under his own surname. */
function termRank(haystack: string, term: string): number | null {
  let best: number | null = null

  for (let at = haystack.indexOf(term); at >= 0; at = haystack.indexOf(term, at + 1)) {
    const rank = at === 0 ? 0 : haystack[at - 1] === ' ' ? 1 : 2
    if (rank === 0) return 0
    if (best === null || rank < best) best = rank
  }

  return best
}

export const DEFAULT_LIMIT = 6

/**
 * Names matching every term in `query`, best first, capped at `limit`.
 * An empty query matches nothing — the screen shows a count instead of all 73 names.
 */
export function rankRoster(
  roster: readonly string[],
  query: string,
  limit: number = DEFAULT_LIMIT,
): string[] {
  const terms = fold(query).split(/\s+/).filter(Boolean)
  if (terms.length === 0) return []

  const scored: { name: string; score: number }[] = []

  for (const name of roster) {
    const haystack = fold(name)
    let score = 0

    for (const term of terms) {
      const rank = termRank(haystack, term)
      if (rank === null) {
        score = -1
        break
      }
      score += rank
    }

    if (score >= 0) scored.push({ name, score })
  }

  return scored
    .sort((a, b) => a.score - b.score || a.name.localeCompare(b.name))
    .slice(0, limit)
    .map((s) => s.name)
}
