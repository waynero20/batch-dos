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
  sublabel: string
  track: Track
}

export const DATES = [
  { id: 'dec-26', label: 'December 26', sublabel: 'Biyernes sa Pasko', track: 'province' },
  { id: 'jan-2', label: 'January 2', sublabel: 'Human sa Bag-ong Tuig', track: 'province' },
  { id: 'jan-9', label: 'January 9', sublabel: 'Ikaduhang semana', track: 'city' },
] as const satisfies readonly DateOption[]

export type VenueOption = {
  id: string
  name: string
  track: Track
  description: string
  location: string
  features: readonly string[]
}

export const VENUES = [
  {
    id: 'purita-farms',
    name: 'Purita Farms',
    track: 'province',
    description:
      'Vacation house with a pool and a pickleball court. Has rooms for an overnight stay and a working kitchen.',
    location: 'Barangay Bangkal Poblacion, San Remigio',
    features: ['Pool', 'Pickleball court', 'Overnight rooms', 'Working kitchen'],
  },
  {
    id: 'bakhawan-beach-home',
    name: 'Bakhawan Beach Home',
    track: 'province',
    description:
      'Beach house with a pickleball court. Has rooms for an overnight stay and a working kitchen. Also has a pool table.',
    location: 'Barangay Bakhawan, Daanbantayan',
    features: ['Beachfront', 'Pickleball court', 'Overnight rooms', 'Working kitchen', 'Pool table'],
  },
  {
    id: 'island-hopping',
    name: 'Island Hopping',
    track: 'city',
    description: 'Island hopping in Lapu-Lapu. Can fit up to 60 people.',
    location: 'Lapu-Lapu City',
    features: ['Boat for up to 60 pax', 'Island stops', 'Day trip'],
  },
  {
    id: 'providence-townhomes',
    name: 'Providence Townhomes',
    track: 'city',
    description: '4-level townhome with rooms for overnight stay.',
    location: 'Providence Street, Cebu City',
    features: ['4 levels', 'Overnight rooms', 'In the city'],
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
    name: 'Food Packages / Bilao',
    tagline: 'Lechon, bilao and full catering service',
    details: [
      'Packages A–G · ₱3,000–₱15,000 · good for 15–40 pax',
      'Whole lechon, lechon belly, puso and 3–4 dishes',
      'Bilao ₱1,200–₱3,000 · good for 10–25 pax',
      'Catering ₱250 / ₱300 / ₱350 per pax',
      'Includes buffet set-up, tables and chairs',
    ],
  },
  {
    id: 'rodmers',
    name: "Rodmer's Lechon & Bellychon",
    tagline: 'Food trays, flat tray pricing',
    details: [
      'Chicken and poultry · ₱1,200 per tray',
      'Pork · ₱1,200 per tray',
      'Seafood · ₱1,200 per tray',
      'Pasta, noodles and vegetables · ₱700 per tray',
      'Sto. Niño Village, Poblacion, Medellin, Cebu',
    ],
  },
  {
    id: 'food-trays',
    name: 'Food Trays',
    tagline: 'Itemised menu, pick per dish',
    details: [
      'Small · good for 10–15 pax',
      'Medium · good for 20–25 pax',
      'Large · good for 40–50 pax',
      'Pork, beef, seafood, chicken, noodles',
      'Desserts from ₱120 per tub',
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
  sublabel: string
}

export const ATTENDANCE = [
  { id: 'yes', label: 'Oo, apil ko!', sublabel: "I'm in" },
  { id: 'maybe', label: 'Dili pa sure', sublabel: 'Not sure yet' },
  { id: 'no', label: 'Dili ko maka-apil', sublabel: "I can't make it" },
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
