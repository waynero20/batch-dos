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
      photo: photo('/intro/opening.svg', 1200, 900, 'Placeholder: the batch at lunch', -2),
      duration: 3200,
      fadeIn: 900,
      fadeOut: 700,
    },
    {
      type: 'memory',
      year: '2013',
      text: 'Cute pa kayta, wa pa ta kabalo unsay padulngan sa ato high school life',
      photo: photo('/intro/2013.svg', 900, 1200, 'Placeholder: first year, 2013', 1.5),
      duration: 5000,
      fadeIn: 1000,
      fadeOut: 800,
    },
    {
      type: 'memory',
      year: '2015',
      text: '[PLACEHOLDER TEXT]',
      photo: photo('/intro/2015.svg', 1200, 900, 'Placeholder: 2015', -1.5),
      duration: 4600,
      fadeIn: 900,
      fadeOut: 800,
    },
    {
      type: 'memory',
      year: '2017',
      text: '[PLACEHOLDER TEXT]',
      photo: photo('/intro/2017.svg', 1080, 1080, 'Placeholder: 2017', 2),
      duration: 4600,
      fadeIn: 900,
      fadeOut: 800,
    },
    {
      type: 'montage',
      photos: [
        photo('/intro/montage-01.svg', 1200, 900, 'Placeholder memory 1', -3),
        photo('/intro/montage-02.svg', 900, 1200, 'Placeholder memory 2', 2.5),
        photo('/intro/montage-03.svg', 1080, 1080, 'Placeholder memory 3', -1.5),
        photo('/intro/montage-04.svg', 1200, 900, 'Placeholder memory 4', 3),
        photo('/intro/montage-05.svg', 1200, 900, 'Placeholder memory 5', -2),
        photo('/intro/montage-06.svg', 900, 1200, 'Placeholder memory 6', 1.5),
        photo('/intro/montage-07.svg', 1200, 900, 'Placeholder memory 7', -2.5),
        photo('/intro/montage-08.svg', 1080, 1080, 'Placeholder memory 8', 2),
        photo('/intro/montage-09.svg', 900, 1200, 'Placeholder memory 9', -1),
        photo('/intro/montage-10.svg', 1200, 900, 'Placeholder memory 10', 1),
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
      stagger: 900,
      fadeIn: 1400,
      hold: 2200,
      fadeOut: 1200,
    },
    {
      type: 'names',
      phrase: 'Pero somehow, kita japon',
      connector: 'si',
      duration: 19000,
      firstNameHold: 2000,
      firstInterval: 850,
      lastInterval: 200,
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
      text: 'Planohan nato kung',
      duration: 3200,
      handoff: 1400,
    },
  ],

  /** Shown in this order during "Pero somehow, kita japon si …". */
  names: [
    'Apol', 'Leila', 'Nimar', 'Jode', 'Mark', 'Lyka Mae', 'Kyle', 'Walter', 'Bless', 'Erica',
    'Kaye', 'Jean Roy', 'Hannah', 'Jarvy', 'Niña', 'Daboy', 'Rexx', 'Jean Keth', 'Elisha', 'Sophia',
    'Leela', 'Blaire', 'Follen', 'Selah', 'Justin', 'Lyka Renette', 'Zoe', 'James', 'Chris', 'Bea',
    'Dawn', 'Ester', 'Alfren', 'Iris', 'Merbelle', 'Ran', 'Al', 'Avril', 'Reinmar', 'Marielle',
    'Jenny', 'Kelsey', 'Jean Marie', 'Daniel', 'Marie', 'Princes', 'Gwyneth', 'Wayne', 'Fethiea', 'Jola',
    'Joshua', 'Caithly', 'Alyssa', 'Naureen', 'Mangel', 'Rainier', 'Shara', 'Princess', 'Ivan', 'Kenneth',
    'PV', 'Blessie', 'Sarah', 'Joefelyn', 'Nicole', 'Mary', 'Nestor', 'Jasmin', 'Jam', 'Denise',
    'Patrio', 'Lovely', 'Henry',
  ],
} satisfies IntroConfig
