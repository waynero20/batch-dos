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
  track: Track
}

export const DATES = [
  { id: 'dec-26', label: 'December 26', track: 'province' },
  { id: 'jan-2', label: 'January 2', track: 'province' },
  { id: 'jan-9', label: 'January 9', track: 'city' },
] as const satisfies readonly DateOption[]

export type VenuePhoto = { src: string; alt: string }

export type VenueOption = {
  id: string
  name: string
  track: Track
  description: string
  location: string
  features: readonly string[]
  /**
   * First photo is the card's hero. Purita Farms and Bakhawan use photos supplied by
   * the committee; the two city venues use crops lifted from the proposal deck, which
   * is the only imagery that exists for them so far and is noticeably lower resolution.
   */
  photos: readonly VenuePhoto[]
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
      },
    ],
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
      },
      {
        src: '/venues/bakhawan-beach-home-2.jpg',
        alt: 'The beach house seen from the sand — a long covered porch shaded by trees.',
      },
      {
        src: '/venues/bakhawan-beach-home-3.jpg',
        alt: 'A pool table on the tiled deck beneath a bamboo roof, open to the sea.',
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
        alt: 'The deck of the boat under a shade sail, open sea and clear sky beyond.',
      },
    ],
  },
  {
    id: 'providence-townhomes',
    name: 'Providence Townhomes',
    track: 'city',
    description: 'Four-level townhome with rooms for the night.',
    location: 'Cebu City',
    features: ['Four levels', 'Sleeps over', 'In the city'],
    photos: [
      {
        src: '/venues/providence-townhomes-1.jpg',
        alt: 'The townhome interior — open-plan kitchen and dining area with a stone feature wall.',
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

/** "Purita Farms or Bakhawan Beach Home" — shown under a date so the choice it
 *  commits you to is visible before you make it. */
export const venueSummaryForTrack = (track: Track): string => {
  const names = venuesForTrack(track).map((v) => v.name)
  return names.length <= 1
    ? (names[0] ?? '')
    : `${names.slice(0, -1).join(', ')} or ${names.at(-1)}`
}
