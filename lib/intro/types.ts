/** All durations are milliseconds. */

export type Photo = {
  /** Path under /public, e.g. "/intro/2013.jpg". */
  src: string
  /** Intrinsic pixel size of the file. Used for aspect ratio, never for display size. */
  width: number
  height: number
  alt: string
  /** Resting rotation in degrees. Keep it small: ±1–3. */
  tilt?: number
}

/**
 * Text, a photo, or a year with a photo and text. Whichever fields are set are shown.
 * Everything fades in over `fadeIn` and the whole scene fades out over its last `fadeOut`.
 */
export type MemoryScene = {
  type: 'memory'
  year?: string
  text?: string
  photo?: Photo
  duration: number
  fadeIn: number
  fadeOut: number
}

/** Prints dealt onto a stack, one every `interval`, in list order. */
export type MontageScene = {
  type: 'montage'
  photos: Photo[]
  interval: number
  /** Time after the last print is dealt before the next scene. The scene fades out in its last `fadeOut`. */
  settle: number
  fadeOut: number
}

/** Lines that fade in one after another and leave together. */
export type LinesScene = {
  type: 'lines'
  lines: string[]
  /** Delay between one line starting to appear and the next. */
  stagger: number
  fadeIn: number
  /** How long everything stays fully visible once the last line has arrived. */
  hold: number
  fadeOut: number
  tone: 'whisper' | 'reflect'
}

/** A fixed phrase with a name that changes, slow at first and faster and faster. */
export type NamesScene = {
  type: 'names'
  /** Stays on screen. The names themselves come from `IntroConfig.names`. */
  phrase: string
  /** Word before the name, e.g. "si". Sits in a fixed-width slot so the phrase never moves. */
  connector: string
  duration: number
  /** How long the first name stays up before the names start moving. */
  firstNameHold: number
  /** How long the second name stays up; the pace accelerates from here. */
  firstInterval: number
  /** The fastest pace the acceleration reaches, just before the closing name. */
  lastInterval: number
  /** How long the very last name lingers and fades out, breaking the accelerating pace. */
  lastNameHold: number
}

/** The conclusion: the names stop, a moment of stillness, then the ending. */
export type FinalScene = {
  type: 'final'
  phrase: string
  connector: string
  ending: string
  stillness: number
  fadeIn: number
  duration: number
  fadeOut: number
}

/** The climax, which then fades into the RSVP page over `handoff`. */
export type TaraScene = {
  type: 'tara'
  text: string
  duration: number
  handoff: number
}

/** Same paper, same pen as `TaraScene` — the next line written on it. Can also close the intro. */
export type PlanohanScene = {
  type: 'planohan'
  text: string
  duration: number
  handoff: number
}

export type Scene =
  | MemoryScene
  | MontageScene
  | LinesScene
  | NamesScene
  | FinalScene
  | TaraScene
  | PlanohanScene

export type IntroConfig = {
  scenes: Scene[]
  names: string[]
}
