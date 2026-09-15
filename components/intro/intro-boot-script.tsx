export const INTRO_SEEN_KEY = 'batchdos:intro-seen'

/**
 * Runs before first paint so a returning visitor never sees a black flash while React loads,
 * and a first-time visitor never sees the RSVP page flash before the intro. `?intro` forces
 * a replay. Rendered once from the root layout.
 */
const script = `try{var d=document.documentElement;var f=/[?&]intro(=|&|$)/.test(location.search);d.dataset.intro=(!f&&localStorage.getItem(${JSON.stringify(INTRO_SEEN_KEY)}))?'seen':'play'}catch(e){document.documentElement.dataset.intro='play'}`

export function IntroBootScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
