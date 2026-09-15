/**
 * Ballot content, transcribed from Reunion-Proposal.pdf.
 *
 * The deck is image-only, so nothing here can be regenerated automatically —
 * if the committee revises the proposal, these values are edited by hand.
 */

/** Province and city are mutually exclusive tracks: the chosen date fixes the track,
 *  and the track determines which venues are reachable. */
export type Track = 'province' | 'city'

export const TRACK_LABEL: Record<Track, string> = {
  province: 'Province',
  city: 'City',
}

export type DateOption = {
  id: string
  label: string
  /**
   * The actual day, so the ballot can draw a calendar rather than three cards.
   *
   * The proposal names only "December 26" and so on; these are the next occurrences
   * of those dates, and all three land on a Saturday. Revise here if the committee
   * means a different year.
   */
  iso: string
  track: Track
}

export const DATES = [
  { id: 'dec-26', label: 'December 26', iso: '2026-12-26', track: 'province' },
  { id: 'jan-2', label: 'January 2', iso: '2027-01-02', track: 'province' },
  { id: 'jan-9', label: 'January 9', iso: '2027-01-09', track: 'city' },
] as const satisfies readonly DateOption[]

export type VenuePhoto = {
  src: string
  alt: string
  /** Intrinsic pixels, kept as a record of what each source file can actually fill.
   *  Adding a photo? Run: sips -g pixelWidth -g pixelHeight <file> */
  w: number
  h: number
  /** object-position. Set only where a centred crop would cut the subject or leave
   *  the venue's own watermark in frame. */
  focus?: string
}

export type VenueOption = {
  id: string
  name: string
  track: Track
  description: string
  location: string
  features: readonly string[]
  /** First photo is the card's hero. The flow shows only the hero; the rest are the
   *  committee's reference for the deck. */
  photos: readonly VenuePhoto[]
  /** Closing line for a venue with a single photo, so the one-photo card reads as the
   *  fullest rather than the emptiest. Ignored when the venue has extras. */
  pull?: string
}

export const VENUES = [
  {
    id: 'purita-farms',
    name: 'Purita Farms',
    track: 'province',
    description: 'Vacation house with a pool and a pickleball court.',
    location: 'San Remigio',
    features: ['Pool', 'Pickleball', 'Sleeps over', 'Kitchen'],
    photos: [
      {
        src: '/venues/purita-farms-1.jpg',
        alt: 'Aerial view of Purita Farms at sunset — a green pagoda roof above a curved pool deck, surrounded by dense trees.',
        w: 2048,
        h: 1536,
      },
    ],
    pull: 'The pool, the pickleball court, and a roof to sleep under.',
  },
  {
    id: 'bakhawan-beach-home',
    name: 'Bakhawan Beach Home',
    track: 'province',
    description: 'Beach house with a pickleball court and a pool table.',
    location: 'Daanbantayan',
    features: ['Beachfront', 'Pickleball', 'Sleeps over', 'Kitchen'],
    photos: [
      {
        src: '/venues/bakhawan-beach-home-1.jpg',
        alt: 'Turquoise shallows off Bakhawan Beach Home, with an open-air hut on the sand under trees.',
        w: 828,
        h: 884,
        focus: '50% 60%',
      },
      {
        src: '/venues/bakhawan-beach-home-2.jpg',
        alt: 'The beach house seen from the sand — a long covered porch shaded by trees.',
        w: 1080,
        h: 593,
        focus: '50% 55%',
      },
      {
        src: '/venues/bakhawan-beach-home-3.jpg',
        alt: 'A pool table on the tiled deck beneath a bamboo roof, open to the sea.',
        w: 940,
        h: 788,
        focus: '40% 40%',
      },
    ],
  },
  {
    id: 'island-hopping',
    name: 'Island Hopping',
    track: 'city',
    description: 'A day on the water, island to island.',
    location: 'Lapu-Lapu',
    features: ['Fits 60', 'Day trip'],
    photos: [
      {
        src: '/venues/island-hopping-1.jpg',
        alt: 'The bow of the boat with beanbags on a pink deck, turquoise water and a banana boat alongside.',
        w: 1288,
        h: 966,
      },
      {
        src: '/venues/island-hopping-2.jpg',
        alt: 'The boat full of people at sunset, seated around tables under the canopy.',
        w: 1440,
        h: 1080,
      },
      {
        src: '/venues/island-hopping-3.jpg',
        alt: 'Looking down the length of the deck at dawn, benches and beanbags either side of the mast.',
        w: 960,
        h: 720,
      },
      {
        src: '/venues/island-hopping-4.jpg',
        alt: 'The shaded lounge deck with a long table, armchair and scattered cushions.',
        w: 960,
        h: 720,
      },
      {
        src: '/venues/island-hopping-5.jpg',
        alt: 'The outrigger moored at the shore, passengers boarding across the gangplank.',
        w: 720,
        h: 960,
        focus: '50% 45%',
      },
    ],
  },
  {
    id: 'providence-townhomes',
    name: 'Providence Townhomes',
    track: 'city',
    description: 'Four-level townhome with rooms for the night.',
    location: 'Cebu City',
    features: ['Four levels', 'Sleeps over', 'Home cinema', 'In the city'],
    photos: [
      {
        src: '/venues/providence-townhomes-2.jpg',
        alt: 'The lounge and home cinema — a projector screen, deep armchairs, a moss wall and life-size superhero figures.',
        w: 2048,
        h: 1364,
      },
      {
        src: '/venues/providence-townhomes-1.jpg',
        alt: 'The open-plan living, dining and kitchen area, with a stone feature wall and a long table.',
        w: 960,
        h: 640,
      },
      {
        src: '/venues/providence-townhomes-3.jpg',
        alt: 'A themed bedroom lit in blue and red, with a projector, games console and a wall of film posters.',
        w: 2048,
        h: 1516,
      },
    ],
  },
] as const satisfies readonly VenueOption[]

export type FoodOption = {
  id: string
  name: string
  tagline: string
  details: readonly string[]
}

/** Members choose the caterer, not a specific package — package size depends on the
 *  final headcount, which this vote is partly meant to establish. */
export const FOOD = [
  {
    id: 'bilao-packages',
    name: 'Packages & Bilao',
    tagline: 'Lechon, bilao, full catering',
    details: [
      'Packages ₱3,000–15,000 · 15–40 pax',
      'Bilao ₱1,200–3,000 · 10–25 pax',
      'Catering ₱250–350 a head, tables and chairs in',
    ],
  },
  {
    id: 'rodmers',
    name: "Rodmer's Lechon",
    tagline: 'Flat tray pricing',
    details: [
      'Chicken, pork, seafood · ₱1,200 a tray',
      'Pasta and noodles · ₱700 a tray',
      'Medellin, Cebu',
    ],
  },
  {
    id: 'food-trays',
    name: 'Food Trays',
    tagline: 'Itemised, pick per dish',
    details: [
      'Small ₱300–1,000 · 10–15 pax',
      'Medium ₱500–2,000 · 20–25 pax',
      'Large ₱1,000–3,000 · 40–50 pax',
    ],
  },
] as const satisfies readonly FoodOption[]

export type PaletteOption = {
  id: string
  name: string
  description: string
  swatches: readonly string[]
}

/** Grouped from the moodboard slide. The deck names individual shades but never
 *  groups them, so these sets and their names are the committee's to revise. */
export const PALETTES = [
  {
    id: 'bleu-ocean',
    name: 'Bleu Océan',
    description: 'Deep navy with sky blue and butter',
    swatches: ['#0A1680', '#93B2F8', '#FBEDB0', '#F7B94C', '#FCFDFF'],
  },
  {
    id: 'space-cadet',
    name: 'Space Cadet',
    description: 'Ink navy, bright yellow, alice blue',
    swatches: ['#1A1A55', '#FEE14E', '#EFF8FF'],
  },
  {
    id: 'heritage',
    name: 'Heritage',
    description: 'Muted teal-navy with cream and stone',
    swatches: ['#104B6C', '#F5EFC1', '#E3DED8'],
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    description: 'Slate blue, deep gold and sand',
    swatches: ['#224668', '#C9930A', '#D5BFA7'],
  },
] as const satisfies readonly PaletteOption[]

export type AttendanceOption = {
  id: string
  label: string
}

export const ATTENDANCE = [
  { id: 'yes', label: "I'm in" },
  { id: 'maybe', label: 'Not sure yet' },
  { id: 'no', label: "Can't make it" },
] as const satisfies readonly AttendanceOption[]

export type DateId = (typeof DATES)[number]['id']
export type VenueId = (typeof VENUES)[number]['id']
export type FoodId = (typeof FOOD)[number]['id']
export type PaletteId = (typeof PALETTES)[number]['id']
export type AttendanceId = (typeof ATTENDANCE)[number]['id']

export const trackForDate = (id: DateId): Track =>
  DATES.find((d) => d.id === id)!.track

export const venuesForTrack = (track: Track): readonly VenueOption[] =>
  VENUES.filter((v) => v.track === track)

/** One source of truth for the RSVP receipt. */
export const planRows = (d: {
  dateId?: string
  venueId?: string
  foodId?: string
  paletteId?: string
}) =>
  [
    { step: 1, label: 'When', value: DATES.find((x) => x.id === d.dateId)?.label },
    { step: 2, label: 'Where', value: VENUES.find((x) => x.id === d.venueId)?.name },
    { step: 3, label: 'Food', value: FOOD.find((x) => x.id === d.foodId)?.name },
    { step: 4, label: 'Wear', value: PALETTES.find((x) => x.id === d.paletteId)?.name },
  ] as const

/**
 * The flow, one screen per entry.
 *
 * `field` is the draft key the screen fills, or null for a screen that shows rather
 * than asks. Screens carry a question and nothing else — no standfirst, no step
 * number: whatever a sentence underneath would have explained, the screen itself has
 * to say.
 */
export type FlowStep = {
  id: string
  short: string
  title: string
  field: 'dateId' | 'venueId' | 'foodId' | 'paletteId' | 'attending' | null
}

export const FLOW_STEPS = [
  {
    id: 'who',
    short: 'Who',
    title: 'Who are you?',
    field: null,
  },
  {
    id: 'when',
    short: 'When',
    title: 'When should we meet?',
    field: 'dateId',
  },
  {
    id: 'where',
    short: 'Where',
    title: 'Where should we go?',
    field: 'venueId',
  },
  {
    id: 'food',
    short: 'Food',
    title: 'What should we eat?',
    field: 'foodId',
  },
  {
    id: 'wear',
    short: 'Wear',
    title: 'What should we wear?',
    field: 'paletteId',
  },
  {
    id: 'day',
    short: 'Day',
    title: 'Here’s the day',
    field: null,
  },
  {
    id: 'rsvp',
    short: 'RSVP',
    title: 'Are you coming?',
    field: 'attending',
  },
] as const satisfies readonly FlowStep[]

/** Index of the identity screen, of the first real question, and of the last screen. */
export const WHO_STEP = 0
export const FIRST_QUESTION = 1
export const LAST_STEP = FLOW_STEPS.length - 1

/** A ballot in progress: every answer optional until it is given. */
export type BallotDraft = Partial<Record<Exclude<FlowStep['field'], null>, string>>

/**
 * How far a saved draft legitimately got: its first unanswered question, or the last
 * screen if every answer is already in and it was never submitted.
 *
 * This is how far the progress bar unlocks — it is NOT where the flow opens. Landing
 * someone on question four because a draft they do not remember says so reads as a
 * bug: they never saw the date they supposedly picked. The ballot always opens on its
 * first question, with the saved answers already selected, and the steps behind this
 * mark stay tappable for anyone who does want to skip ahead.
 */
export function reachedThrough(draft: BallotDraft): number {
  for (let i = FIRST_QUESTION; i < FLOW_STEPS.length; i++) {
    const field = FLOW_STEPS[i]!.field
    if (field && !draft[field]) return i
  }
  return LAST_STEP
}

export const VENUE_CLEARED_NOTE = 'Cleared — that date changes the venues.'

/** "Purita Farms or Bakhawan Beach Home" — shown under a date so the choice it
 *  commits you to is visible before you make it. */
export const venueSummaryForTrack = (track: Track): string => {
  const names = venuesForTrack(track).map((v) => v.name)
  return names.length <= 1
    ? (names[0] ?? '')
    : `${names.slice(0, -1).join(', ')} or ${names.at(-1)}`
}

/* -------------------------------------------------------------------------- */
/* Calendar                                                                    */
/* -------------------------------------------------------------------------- */

export const WEEKDAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const

export type CalendarCell = {
  iso: string
  day: number
  /** False for the leading and trailing days borrowed from the neighbouring months. */
  inMonth: boolean
  /** Set only on the days the batch can actually pick. */
  dateId?: DateId
}

export type MonthGrid = {
  year: number
  /** 0-11. */
  month: number
  label: string
  /** Always six Sunday-to-Saturday weeks, so the grid does not change height
   *  when you page between months. */
  weeks: CalendarCell[][]
}

const atUTC = (iso: string) => new Date(`${iso}T00:00:00Z`)
const isoOf = (d: Date) => d.toISOString().slice(0, 10)

/** One full month, drawn the way a calendar is: six weeks, Sunday first, with the
 *  neighbouring months' days filling the corners. */
export function monthGrid(year: number, month: number): MonthGrid {
  const first = new Date(Date.UTC(year, month, 1))
  const cursor = new Date(first)
  cursor.setUTCDate(1 - first.getUTCDay())

  const weeks: CalendarCell[][] = []
  for (let w = 0; w < 6; w++) {
    const week: CalendarCell[] = []
    for (let d = 0; d < 7; d++) {
      const iso = isoOf(cursor)
      week.push({
        iso,
        day: cursor.getUTCDate(),
        inMonth: cursor.getUTCMonth() === month,
        dateId: DATES.find((o) => o.iso === iso)?.id,
      })
      cursor.setUTCDate(cursor.getUTCDate() + 1)
    }
    weeks.push(week)
  }

  return { year, month, label: `${MONTHS[month]} ${year}`, weeks }
}

/**
 * The months worth paging through: only those holding a date the batch can pick.
 *
 * The calendar is a real one, but it is not an open-ended date picker — there is no
 * reason to let anyone wander into March.
 */
export function candidateMonths(): { year: number; month: number }[] {
  const seen = new Map<string, { year: number; month: number }>()
  for (const option of DATES) {
    const d = atUTC(option.iso)
    const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}`
    if (!seen.has(key)) seen.set(key, { year: d.getUTCFullYear(), month: d.getUTCMonth() })
  }
  return [...seen.values()].sort((a, b) => a.year - b.year || a.month - b.month)
}

/** Which month a given option falls in, as an index into `candidateMonths()`. */
export function monthIndexOf(dateId: DateId): number {
  const option = DATES.find((d) => d.id === dateId)!
  const d = atUTC(option.iso)
  return candidateMonths().findIndex(
    (m) => m.year === d.getUTCFullYear() && m.month === d.getUTCMonth(),
  )
}
