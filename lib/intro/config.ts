import type { IntroConfig, Photo } from './types'

/**
 * The whole intro story: every word, photo, year, name and duration lives here.
 *
 * - Photos go in /public/intro. Set `width`/`height` to the file's real pixel size.
 * - Durations are milliseconds. `pnpm test` fails if the total goes over 70 seconds,
 *   or if a name would show for less than 200 ms.
 * - Scenes play top to bottom. Reorder, remove or add scenes freely.
 */

const photo = (src: string, width: number, height: number, alt: string, tilt = 0): Photo => ({
  src,
  width,
  height,
  alt,
  tilt,
})

export const introConfig = {
  scenes: [
    {
      type: 'memory',
      text: 'Ka remember pa mo na ato problema ra sauna kay asa mag lunch?',
      duration: 5000,
      fadeIn: 2200,
      fadeOut: 1000,
    },
    {
      type: 'memory',
      photo: photo('/pictures/1.webp', 767, 508, 'The batch at lunch', -2),
      duration: 3200,
      fadeIn: 900,
      fadeOut: 700,
    },
    {
      type: 'memory',
      year: '2013',
      text: 'Cute pa kayta, wa pa ta kabalo unsay padulngan sa ato high school life',
      photo: photo('/pictures/2.webp', 640, 480, 'First year, 2013', 1.5),
      duration: 5000,
      fadeIn: 1000,
      fadeOut: 800,
    },
    {
      type: 'memory',
      year: '2015',
      text: 'Malipay kada naay event kay way tarong klase for pila ka adlaw',
      photo: photo('/pictures/3.webp', 1280, 960, '2015', -1.5),
      duration: 4600,
      fadeIn: 900,
      fadeOut: 800,
    },
    {
      type: 'memory',
      year: '2017',
      text: '"Tinabangay" tanan para maka graduate tibuok batch',
      photo: photo('/pictures/4.webp', 960, 541, '2017', 2),
      duration: 4600,
      fadeIn: 900,
      fadeOut: 800,
    },
    {
      type: 'montage',
      photos: [
        photo('/pictures/5.webp', 720, 960, 'Memory 1', -3),
        photo('/pictures/6.webp', 1024, 768, 'Memory 2', 2.5),
        photo('/pictures/7.webp', 960, 720, 'Memory 3', -1.5),
        photo('/pictures/8.webp', 960, 720, 'Memory 4', 3),
        photo('/pictures/9.webp', 720, 540, 'Memory 5', -2),
        photo('/pictures/10.webp', 768, 768, 'Memory 6', 1.5),
        photo('/pictures/11.webp', 720, 960, 'Memory 7', -2.5),
        photo('/pictures/12.webp', 720, 960, 'Memory 8', 2),
        photo('/pictures/13.webp', 1386, 918, 'Memory 9', -1),
        photo('/pictures/14.webp', 960, 720, 'Memory 10', 1),
      ],
      interval: 600,
      settle: 600,
      fadeOut: 600,
    },
    {
      type: 'lines',
      lines: ['then life happened'],
      tone: 'whisper',
      stagger: 0,
      fadeIn: 1800,
      hold: 1000,
      fadeOut: 1200,
    },
    {
      type: 'lines',
      lines: [
        'uban nato ni larga',
        'uban nato nag start na family',
        'uban nato nag build pa sa career',
      ],
      tone: 'reflect',
      stagger: 1200,
      fadeIn: 1800,
      hold: 3200,
      fadeOut: 1200,
    },
    {
      type: 'names',
      phrase: 'Pero somehow, kita japon',
      connector: 'si',
      duration: 17400,
      firstNameHold: 1400,
      firstInterval: 850,
      lastInterval: 300,
      lastNameHold: 900,
    },
    {
      type: 'final',
      phrase: 'Pero somehow, kita japon',
      connector: 'ang',
      ending: 'Batch Dos',
      stillness: 900,
      fadeIn: 1400,
      duration: 4600,
      fadeOut: 700,
    },
    {
      type: 'tara',
      text: 'So tara!',
      duration: 2200,
      handoff: 1400,
    },
    {
      type: 'planohan',
      text: 'Ato planohan!',
      duration: 3200,
      handoff: 1400,
    },
  ],

  /** Shown in this order during "Pero somehow, kita japon si …". */
  names: [
    'Apol', 'Leila', 'Nimar', 'Jode', 'Mark', 'Lyka Mae', 'Kyle', 'Walter', 'Bless', 'Erica',
    'Kaye', 'Jean Roy', 'Hannah', 'Jarvy', 'Niña', 'Daboy', 'Rexx', 'Jean Keth', 'Elisha', 'Sophia',
    'Vijay', 'Leela', 'Blaire', 'Follen', 'Selah', 'Justin', 'Lyka Renette', 'Zoe', 'James', 'Chris',
    'Bea', 'Dawn', 'Ester', 'Alfren', 'Iris', 'Merbelle', 'Ran', 'Al', 'Avril', 'Reinmar',
    'Marielle', 'Jenny', 'Kelsey', 'Jean Marie', 'Daniel', 'Marie', 'Princes', 'Gwyneth', 'Wayne', 'Fethiea',
    'Jola', 'Joshua', 'Caithly', 'Alyssa', 'Naureen', 'Mangel', 'Rainier', 'Shara', 'Princess', 'Ivan',
    'John Alfred', 'Kenneth', 'PV', 'Blessie', 'Sarah', 'Joefelyn', 'Nicole', 'Mary', 'Nestor', 'Jasmin',
    'Jam', 'Denise', 'Patrio', 'Lovely', 'Henry',
  ],
} satisfies IntroConfig
