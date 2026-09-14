I have complete verified ground truth. Writing the spec now.

---

# BUILD SPEC — Batch DOS Reunion, full-width revamp

**Backbone:** *The Issue* (editorial shell, standing rail, folio furniture).
**Grafted:** the frame-invariant plate + weighted paint-chip (*The Long Wall*), data-derived photo grading + shared `planRows` (*The Plan Rail*), the venue-reset notice + "never upscale, fill with type" (*Establishing Shot*).
**Verified against source and `sips` on 2026-09-14.** Every number below is measured, not quoted.

---

## 0. MUST NOT CHANGE

Presentation only. Do not touch:

| Thing | Where | Why |
|---|---|---|
| Track rule (date fixes venue set) | `lib/ballot.ts:236-240`, `lib/schema.ts:34-46` | Server-enforced; a layout that implies a cross-track pair produces a submit error |
| The silent `venueId` drop | `ballot-form.tsx:88-93` | Keep the *logic* exactly; we only add a caption that narrates it |
| Zod schema / `superRefine` | `lib/schema.ts` | — |
| Sheets writes, `submitBallot` | `app/actions.ts`, `lib/sheets.ts` | Server-only, `serverExternalPackages` |
| `matches()`, `router.push('/vote?name=…')`, `aria-live` announcer | `roster-picker.tsx:13-20, 57-66` | Search behaviour is done |
| localStorage draft key + shape | `ballot-form.tsx:41,53-68,104` | Adding `step` is a behaviour change — see §15 |
| Committee secret gate, `notFound()`, `force-dynamic` | `results/[secret]/page.tsx:6,15-18` | — |
| `count / max` bar rule, single navy series | `results:61,83` | Deliberate |
| `revalidate = 30`, `votedNames()` swallowing failures | `page.tsx:8-19` | Picker must render correctly with zero Voted badges |
| `env(safe-area-inset-bottom)` | `ballot-form.tsx:280` | — |
| `.step:before` **width/inset**; `w-16` + `gap-3.5` + `left-[4.55rem]` | `globals.css:100`, `program-timeline.tsx:17,21` | Hand-tuned; we scale type only, never this geometry |

**Fixed-footer hazard:** never add `transform`, `filter`, `backdrop-filter`, `perspective`, `contain` or `will-change` to `ballot-form.tsx:116` or any ancestor of the action bar. Nothing in this spec does. The header's `backdrop-blur-md` is a sibling — keep it that way.

---

## 1. THE ASSET INVENTORY IS NOT WHAT THE BRIEF SAYS

Measured with `sips`. **13 venue photos, not 7.** The brief, `README.md:90-93` and the doc comment at `lib/ballot.ts:38-42` are all stale and describe files that no longer exist.

| File | px | ratio | cap @2× | notes |
|---|---|---|---|---|
| `cover.jpg` | 1920×1080 | 1.778 | 960 | |
| `purita-farms-1` | 2048×1536 | 1.333 | **1024** | sunset aerial, pagoda + curved pool. Clean. |
| `bakhawan-1` | 828×884 | 0.937 | **414** | watermark pill **top-right** (y 5–14%) |
| `bakhawan-2` | 1080×593 | 1.821 | 540 | watermark pill **top-right** (y 12–24%) |
| `bakhawan-3` | 940×788 | 1.193 | 470 | watermark pill **bottom-right** (y 79–88%) |
| `island-hopping-1` | 1288×966 | 1.333 | **644** | pink deck, beanbags, turquoise. Bright, clean, no people |
| `island-hopping-2` | 1440×1080 | 1.333 | 720 | **crowded party boat, swimwear** — see §15 |
| `island-hopping-3` | 960×720 | 1.333 | 480 | |
| `island-hopping-4` | 960×720 | 1.333 | 480 | |
| `island-hopping-5` | 720×960 | 0.750 | 360 | portrait, boat moored |
| `providence-1` | 960×640 | 1.500 | 480 | open-plan living/dining. Clean, bright |
| `providence-2` | 2048×1364 | 1.501 | **1024** | home cinema, moss wall, superhero figures. Striking |
| `providence-3` | 2048×1516 | 1.351 | **1024** | Star Wars bedroom, blue/red lighting |
| `providence-4` | 1259×1259 | 1.000 | 629 | CGI render, **developer logo across bottom ~20%** |

**Real photo counts: Purita 1, Bakhawan 3, Island Hopping 5, Providence 4.**

Three consequences that kill every prior direction and are fixed here:

1. There is **no low-resolution city track**. Island Hopping and Providence have the *deepest* galleries and two 2048px files. Any "matte the deck crops / real photos to follow" treatment would print a visible falsehood. **It is deleted entirely.**
2. Any tail switch hardcoded to 0/1/2 extras leaves two of four venues unrendered. The tail here switches on `extras.length` with a branch for **0 / 1–2 / 3 / 4+**.
3. The binding resolution constraint is **Bakhawan's 828px hero (cap 414 CSS px)** — not the city venues. Layout must never ask it for more.

**Also fix the prose** (they are now wrong and will mislead the next person):
- `README.md:90-93` → replace with the table above in miniature: "All four venues have committee photos. Counts are uneven by design — 1 / 3 / 5 / 4 — and the venue card grades itself from each file's intrinsic pixels."
- `lib/ballot.ts:38-42` doc comment → delete the "crops lifted from the proposal deck" sentence.

---

## 2. `app/globals.css` — additions only

Nothing existing is removed except where noted. Append after the current `@layer components` block.

```css
@layer components {
  /* One container for every route. Replaces every max-w-md / max-w-xl. */
  .shell {
    width: 100%;
    margin-inline: auto;
    max-width: 90rem;          /* 1440px ceiling — composed, not sprawling */
    padding-inline: 1.25rem;
  }
  @media (width >= 40rem) { .shell { padding-inline: 2rem; } }
  @media (width >= 64rem) { .shell { padding-inline: 2.5rem; } }
  @media (width >= 80rem) { .shell { padding-inline: 3.5rem; } }

  /* Magazine furniture. Sizes always set at the call site, like .h-display. */
  .folio {
    font-family: var(--font-display);
    font-weight: 600;
    letter-spacing: -0.02em;
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }
  .caption { font-size: 0.8125rem; line-height: 1.5; opacity: 0.5; }
  .pull {
    font-family: var(--font-display);
    font-weight: 600;
    letter-spacing: -0.025em;
    line-height: 1.18;
    text-wrap: balance;
  }
  .rule-heavy { height: 2px; background-color: var(--color-base-content); }
}

/* Six steps must fit a 360px phone. daisyUI's default is min-width:4rem
   (6 × 4rem = 384px), which forces .steps' own overflow-x to scroll. */
.steps .step { min-width: 3.25rem; }
@media (width >= 48rem) { .steps .step { min-width: 4rem; } }
@media (width >= 64rem) {
  .steps .step:after { width: 1.75rem; height: 1.75rem; font-size: 0.75rem; }
}

/* Staggered arrival for the rail's blocks. Same curve, same keyframe as .rise. */
.rise-1 { animation: rise 260ms cubic-bezier(0.22,0.85,0.3,1)  60ms both; }
.rise-2 { animation: rise 260ms cubic-bezier(0.22,0.85,0.3,1) 120ms both; }
.rise-3 { animation: rise 260ms cubic-bezier(0.22,0.85,0.3,1) 180ms both; }
```

**Edit the existing reduced-motion block** (`globals.css:115-122`) — add one line. Without it, staggered items sit invisible for up to 180ms on machines that asked for stillness, because zeroing `animation-duration` does not zero `animation-delay`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-delay: 0ms !important;      /* ← ADD */
    transition-duration: 0.01ms !important;
  }
}
```

**Deliberately NOT added:** `.dropcap` (`::first-letter` swallows leading punctuation — an unwritten rule the next editor breaks); `steps-vertical` (would require re-scoping `.steps .step:before{height:2px}`, which silently collapses the vertical rail — confirmed in `node_modules/daisyui/daisyui.css`); any `.plate--matte` treatment (see §1).

---

## 3. `lib/ballot.ts` — the only data change

Three additive fields and three helpers. Layout-relevant facts now live here, which stretches "wording only" — justified because grading from intrinsic pixels is what makes the venue step survive the committee changing photos again (it already has, twice).

```ts
export type VenuePhoto = {
  src: string
  alt: string
  /** Intrinsic pixels. The venue card grades itself from these — never from an id.
   *  If you add a photo, run: sips -g pixelWidth -g pixelHeight <file> */
  w: number
  h: number
  /** object-position. Only set where a centred crop would cut the subject or
   *  leave the venue's own watermark in frame. */
  focus?: string
}

export type VenueOption = {
  /* …unchanged… */
  /** Closing line for a venue with a single photo, so the one-photo card is the
   *  fullest rather than the emptiest. Ignored when the venue has extras. */
  pull?: string
}
```

Populate `w`/`h` from the §1 table. Set `focus` on exactly five files:

| Photo | `focus` | Why |
|---|---|---|
| `bakhawan-1` | `'50% 60%'` | biases down so a 4:3 mobile crop clears the top-right watermark (ends y 14%) |
| `bakhawan-2` | `'50% 55%'` | pushes the top-right pill toward the edge |
| `bakhawan-3` | `'40% 40%'` | favours the pool table, drives the bottom-right pill out of a 3:2 thumb |
| `island-hopping-5` | `'50% 45%'` | portrait source into a 3:2 thumb — keeps the boat, sheds sky |
| `providence-4` | `'50% 22%'` | removes the developer logo from the bottom fifth in a 3:2 thumb |

Add `pull` to Purita only: `'The pool, the pickleball court, and a roof to sleep under.'`

**Helpers** (append near `venueSummaryForTrack`):

```ts
/** Max CSS width at which a photo still resolves at ~2× DPR. */
export const photoCap = (p: VenuePhoto) => Math.floor(p.w / 2)

/** span + sizes travel together so they can never drift apart. */
const VENUE_WIDTH = {
  wide:   { span: 'xl:col-span-7', sizes: '(max-width:639px) 100vw, (max-width:767px) 512px, (max-width:1023px) 46vw, (max-width:1279px) 34vw, (max-width:1439px) 38vw, 542px' },
  equal:  { span: 'xl:col-span-6', sizes: '(max-width:639px) 100vw, (max-width:767px) 512px, (max-width:1023px) 46vw, (max-width:1279px) 34vw, (max-width:1439px) 32vw, 459px' },
  narrow: { span: 'xl:col-span-5', sizes: '(max-width:639px) 100vw, (max-width:767px) 512px, (max-width:1023px) 46vw, (max-width:1279px) 34vw, (max-width:1439px) 27vw, 378px' },
} as const

/**
 * The wider column goes to the hero that has the pixels to fill it — graded from
 * the files, never from a venue id. Re-shoot a photo and the layout re-grades
 * itself with no code change. Only skews on a real (≥25%) resolution advantage.
 */
export const venueLayout = (pair: readonly VenueOption[]) => {
  if (pair.length !== 2) return pair.map(() => VENUE_WIDTH.equal)
  const [a, b] = pair
  const ca = photoCap(a.photos[0]!)
  const cb = photoCap(b.photos[0]!)
  if (ca >= cb * 1.25) return [VENUE_WIDTH.wide, VENUE_WIDTH.narrow]
  if (cb >= ca * 1.25) return [VENUE_WIDTH.narrow, VENUE_WIDTH.wide]
  return [VENUE_WIDTH.equal, VENUE_WIDTH.equal]
}

/** One source of truth for the rail card, the mobile chip strip and <Summary>. */
export const planRows = (d: { dateId?: string; venueId?: string; foodId?: string; paletteId?: string }) => [
  { step: 0, label: 'When',  value: DATES.find((x) => x.id === d.dateId)?.label },
  { step: 1, label: 'Where', value: VENUES.find((x) => x.id === d.venueId)?.name },
  { step: 2, label: 'Food',  value: FOOD.find((x) => x.id === d.foodId)?.name },
  { step: 3, label: 'Wear',  value: PALETTES.find((x) => x.id === d.paletteId)?.name },
] as const
```

**Verification of the grading rule against the real files:**
- Province — Purita cap 1024 vs Bakhawan cap 414 → `1024 ≥ 517` → **wide / narrow**. Purita hero 542px (cap 1024 ✓), Bakhawan hero 378px (cap 414 ✓, exact fit).
- City — Island `island-1` cap 644 vs Providence `providence-1` cap 480 → `644 ≥ 600` → **wide / narrow**. Island 542px ✓, Providence 378px ✓.
- If you adopt the Providence reorder (§15), caps become 644 vs 1024 → **narrow / wide**. Island 378 ✓, Providence 542 ✓. Still correct, no code change.

**Step standfirsts** — add here, per `README.md:82` (wording lives only in this file):

```ts
export const STEP_NOTE = [
  'Two province dates, one in the city. Your date decides which places are on the table.',
  null, // step 1 keeps its existing dynamic track sentence — it is load-bearing
  'Three caterers, priced by tray and by head. The final package follows the headcount.',
  'Four palettes off the moodboard. Blue, white, yellow — the batch colours, nine years on.',
  'Same plan wherever we land. One last question after this.',
  'Check the card, then tell us if you’re coming.',
] as const

export const VENUE_CLEARED_NOTE = 'Cleared — that date changes the venues.'
```

---

## 4. THE GOVERNING IMAGE RULE

Two rules. Both are the fix for the flaw that sank the winning direction.

**Rule A — a crop box is never taller in aspect than its source.**
`next/image` picks a file by **width**. With `object-cover`, if the box is *taller* in aspect than the source, the render is scaled by **height**, so the width in `sizes` no longer governs sharpness — you need a served width of `2 × boxHeight × sourceAspect`. This is exactly why a 2:3 crop of Purita would have shipped visibly soft while the spec claimed it was sharp past DPR 2. Keeping every box wider-or-equal than its source makes `sizes` = rendered CSS width, always, and the arithmetic trivial.

Applied: hero box is `aspect-[4/3]` on mobile, `aspect-[16/10]` from `sm`. Every hero source is ≤ 1.6 (Purita 1.333, Bakhawan-1 0.937, island-1 1.333, providence-1 1.500) so `16/10` is safe universally, and `4/3` is safe for all but `providence-1` (1.500 > 1.333 → renders at ~1.75× DPR on a phone instead of 2×; invisible in practice, and the §15 reorder removes it entirely).

**Rule B — never ask a file for more CSS width than `floor(w / 2)`.** Enforced by `venueLayout`, and checked in the density ledger (§13). Nothing in this spec exceeds its cap.

---

## 5. `app/layout.tsx`

The highest-leverage change in the project and it is not a layout change at all: the link is shared **once** into a Messenger group chat and currently unfurls with no picture.

```ts
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: 'Batch DOS Reunion',
  description: 'Nine years later. Help the batch decide.',
  openGraph: {
    title: 'Batch DOS Reunion',
    description: 'Nine years later. Help the batch decide.',
    type: 'website',
    images: [{ url: '/cover.jpg', width: 1920, height: 1080,
               alt: "Asa na' ta? — nine years later." }],
  },
  twitter: { card: 'summary_large_image' },
}
```

Add `NEXT_PUBLIC_SITE_URL` to `.env.example`. `cover.jpg` is already exactly the OG card shape. **`viewport.themeColor: '#ffffff'` stays correct** — the top-left of every page in this spec is still white ground.

---

## 6. `app/page.tsx` — the landing

`cover.jpg` is **never** placed in a box wider than 16:9. Verified by inspection: the class photo's top edge sits at y ≈ 8.8% and the kraft folder bleeds off the bottom, so a 21:9 band with `object-cover` clips the batch's own class photo. A 16:9 box makes `object-cover` a no-op.

**Mobile (base → `lg`)** — structurally today's page, unconstrained width:

```jsx
<main className="min-h-dvh">
  <div className="relative aspect-[16/9] w-full overflow-hidden bg-base-200">
    <Image src="/cover.jpg" alt={…} fill priority
           sizes="(max-width:1023px) 100vw, (max-width:1439px) 46vw, 662px"
           className="object-cover" />
  </div>
  <section className="shell pb-16 pt-8">…masthead…</section>
  <div className="shell"><div className="divider my-7 opacity-30" /></div>
  <section className="shell rise pb-16">…register…</section>
</main>
```

Masthead: `h1.h-display text-[2.5rem]`, subhead `mt-2.5 text-[0.95rem] leading-relaxed opacity-55 max-w-[38ch]`.

**Desktop (`lg` 1024+)** — a cover spread. The cover is *mounted*, not cropped:

```jsx
<section className="shell lg:grid lg:min-h-[82dvh] lg:grid-cols-[1fr_1.1fr]
                    lg:items-center lg:gap-16 lg:pt-14">
  <header className="rise lg:order-1">
    <p className="eyebrow">Cebu · Nine years later</p>
    <h1 className="h-display mt-4 text-[2.5rem] lg:text-[4.25rem] xl:text-[5rem]">Batch DOS Reunion</h1>
    <p className="mt-5 max-w-[38ch] text-[0.95rem] leading-relaxed opacity-55 lg:text-lg">…</p>
    <div className="rule-heavy mt-8 lg:mt-10" />
    <div className="flex items-baseline justify-between pt-4">
      <span className="folio text-sm">73 NAMES</span>
      <span className="eyebrow">{voted.length}/{ROSTER.length} VOTED</span>
      <span className="eyebrow">ISSUE ONE</span>
    </div>
    <p className="eyebrow mt-6 hidden items-center gap-2 lg:flex">Find your name below ↓</p>
  </header>
  <div className="lg:order-2 lg:rounded-box lg:overflow-hidden">
    {/* the same 16:9 Image node — one DOM node, breakpoint-prefixed wrapper only */}
  </div>
</section>
```

At 1440 the right cell is ≈ 662px → a 662×372 cover from a 1920px source (2.9×). Below the fold, the register band opens with `border-t-2 border-base-content`, then `shell lg:grid lg:grid-cols-12 lg:gap-x-10 py-12 lg:py-16`:
- rail `lg:col-span-3 lg:sticky lg:top-10 lg:self-start` — eyebrow "The Register", `h2.h-display text-[1.75rem] lg:text-[2.25rem]` "Who are you?", `.caption mt-3 max-w-[32ch]`, then `folio text-[3.5rem] lg:text-[4.5rem]` count + "of 73 voted".
- measure `lg:col-span-9` — `<RosterPicker>`.

**Known cost:** on a laptop the member scrolls once between opening the link and finding their name. Mitigated by the "Find your name ↓" cue and a fold that lands mid-rule; not eliminated. See §15 if you'd rather not pay it.

---

## 7. `components/roster-picker.tsx`

Presentation only. `matches()`, `votedSet`, `results`, the `aria-live` announcer, `router.push`, the empty state and the `!open` `alert-warning` are **untouched**.

Two edits:

1. Search field gains `lg:h-14 lg:text-lg` on the `label.input`, and `lg:sticky lg:top-0 lg:z-10 lg:bg-base-100 lg:py-3` so it follows a long directory.
2. The list — this fixes the single worst desktop artefact (73 names in a 224px porthole on a 27-inch display):

```jsx
<ul className="mt-2 max-h-[50vh] overflow-y-auto overscroll-contain
               lg:max-h-none lg:overflow-visible
               lg:columns-2 xl:columns-3 lg:gap-x-10
               lg:[column-rule:1px_solid_var(--color-base-300)]">
```

**`divide-y` does not survive CSS multi-column** — it leaves a stray rule at the top of each column. Remove `divide-y divide-base-300/70` from the `<ul>` and put the hairline on each `<li>` instead: `className="border-b border-base-300/70 lg:break-inside-avoid"`. Row button gains `lg:py-3`.

CSS columns flow top-to-bottom then across, so **visual order still equals DOM order** and the 73 tab stops stay correct. (A grid would break this — do not swap it later.)

---

## 8. `components/ballot-form.tsx`

### 8.1 Shell

Outer `div.flex.min-h-dvh.flex-col` — **unchanged**.

**Header** (`:117`) keeps `sticky top-0 z-20 border-b border-base-300/70 bg-base-100/90 backdrop-blur-md`. Inner `div` becomes:

```jsx
<div className="shell pb-3 pt-3.5 lg:flex lg:h-16 lg:items-center lg:gap-8 lg:py-0">
```

- Mobile: unchanged — back/all-names ghost button row with truncated `{name}`, then `<Stepper>` full width beneath, then (new) the answer chip strip.
- `lg`: one 64px row. Left `lg:flex lg:shrink-0 lg:items-center lg:gap-5` — back button + `hidden lg:block .eyebrow` running head "Batch DOS Reunion — The Ballot". Centre `lg:min-w-0 lg:flex-1 lg:flex lg:justify-center` wrapping the Stepper at `lg:max-w-[44rem] lg:w-full`. **`.steps` is `display:inline-grid` — `mx-auto` will not centre it** (confirmed in daisyUI source); centre it with the flex parent above, or keep `w-full`. Right: the name, `hidden lg:block max-w-[14rem] truncate text-sm opacity-45`. The mobile name span gains `lg:hidden`.

**Mobile answer strip** — the fix for "every guidance idea is gated behind `lg:`". Rendered only once at least one answer exists, so it never shows an empty box. Costs ~28px of sticky header, and only after the first choice:

```jsx
{answered_rows.length > 0 && (
  <div className="-mx-5 mt-2.5 flex gap-1.5 overflow-x-auto px-5 lg:hidden
                  [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
    {answered_rows.map((r) => (
      <button key={r.label} type="button" onClick={() => goTo(r.step)}
challenge        className="badge badge-sm shrink-0 gap-1.5 border-base-300 bg-base-100 font-normal">
        <span className="text-[0.5625rem] uppercase tracking-[0.14em] opacity-40">{r.label}</span>
        <span className="font-medium">{r.value}</span>
      </button>
    ))}
  </div>
)}
```
*(strip the stray token on the `className` line — transcription artefact.)*

**Main** (`:137`) replaces `mx-auto w-full max-w-md flex-1 px-5 pb-36 pt-5`:

```jsx
<main className="flex-1 pb-36">
  <div key={step} className="rise shell pt-6 lg:pt-12">
    <div className="lg:grid lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-x-10
                    xl:grid-cols-[20rem_minmax(0,1fr)] xl:gap-x-14">
      <div className="lg:sticky lg:top-24 lg:self-start
                      lg:max-h-[calc(100dvh-8rem)] lg:overflow-y-auto lg:overscroll-contain">
        … rail …
      </div>
      <div className="mt-7 lg:mt-0">… measure …</div>
    </div>
  </div>
</main>
```

`key={step}` + `.rise` preserved exactly — the remount-driven 260ms gesture stays the whole motion vocabulary. `pb-36` is kept at **every** width (the action bar stays fixed at every width, same height), so there is no second number to keep in sync.

`lg:top-24` (96px) is tied to the 64px header + 32px breathing room — **move one, move the other.**

**The rail — identical furniture on all six steps.** On mobile it is not a rail; it is simply the first stacked block in DOM order, so heading order and semantics are unchanged from today.

1. `<div className="rule-heavy" />`
2. `<div className="flex items-baseline gap-3 pt-3 rise-1">` — `.folio text-[2.5rem] lg:text-[3.25rem]` showing `01`–`06`, and `.eyebrow` showing `STEPS[step].short`.
3. `<h1 className="h-display mt-4 text-[2.125rem] lg:text-[2.5rem] xl:text-[2.875rem] rise-2">{current.title}</h1>` — **one `<h1>`, rendered once.**
4. Standfirst `mt-4 max-w-[34ch] text-sm leading-relaxed opacity-55 lg:text-[0.9375rem] rise-3`. Every step now has one, from `STEP_NOTE`. **Step 1 keeps its existing dynamic track sentence verbatim** (`:141-146`) — it is the only place the track is explained.
5. The running answer card, `hidden lg:block mt-8` (mobile has the chip strip instead):

```jsx
<div className="border-t border-base-300 pt-4">
  <dl className="divide-y divide-base-300">
    {planRows(draft).map((r) => (
      <div key={r.label} className="flex items-baseline justify-between gap-3 py-2.5">
        <dt className={`eyebrow ${r.step === step ? 'text-primary opacity-100' : ''}`}>{r.label}</dt>
        <dd className={`truncate text-sm font-medium ${r.value ? '' : 'opacity-25'}`}>{r.value ?? '—'}</dd>
      </div>
    ))}
  </dl>
  {venueCleared && (
    <p className="caption mt-2 text-primary opacity-100">{VENUE_CLEARED_NOTE}</p>
  )}
</div>
```

**The venue-reset notice** — all three runner-up directions independently named this the best free win, and it fixes a real current defect: `choose()` deletes `draft.venueId` on a cross-track date change and nothing tells the member. **The reset logic at `:88-93` is untouched.** Add one piece of state:

```ts
const [venueCleared, setVenueCleared] = useState(false)
// inside choose(), in the existing `if (!stillValid)` branch:
if (!stillValid) { delete next.venueId; queueMicrotask(() => setVenueCleared(true)) }
// and in goTo():
const goTo = (next: number) => { setVenueCleared(false); setStep(next); setFurthest((f) => Math.max(f, next)) }
```
Set it outside the updater (the state setter passed to `setDraft` must stay pure).

**Action bar** keeps `fixed inset-x-0 bottom-0 z-20`, the gradient, and `pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-6`. **Remove `px-5` from the outer div** — `.shell` already supplies the inline padding, and keeping both gives the CTA 40px gutters against the content's 20px on phones:

```jsx
<div className="fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-base-100 via-base-100 to-transparent
                pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-6">
  <div className="shell lg:grid lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-x-10
                  xl:grid-cols-[20rem_minmax(0,1fr)] xl:gap-x-14">
    <div className="lg:col-start-2 lg:flex lg:items-center lg:gap-6">
      {error && <div role="alert" className="alert alert-error mb-3 py-2.5 text-sm lg:order-last lg:mb-0">{error}</div>}
      <button className="btn btn-primary btn-lg btn-block rounded-field
                         lg:w-auto lg:min-w-[16rem] lg:flex-none">…</button>
      <div className="hidden lg:flex lg:items-center lg:gap-3">
        <span className="eyebrow">Question {step + 1} of 6</span>
        <span className="h-px w-32 bg-base-300">
          <span className="block h-px bg-primary" style={{ width: `${((step + 1) / 6) * 100}%` }} />
        </span>
      </div>
    </div>
  </div>
</div>
```

`btn-block` sets `width:100%`; `lg:w-auto` overrides it. **Do not use `lg:btn-auto` — it does not exist in daisyUI 5.7.37** (confirmed: only `btn-xs|sm|md|lg|xl` exist). CTA label logic at `:295` is unchanged.

### 8.2 The `Option` primitive

Keep the single-component shape and the `media` slot. It hardcodes `p-4` and `bg-primary/[0.05]`, which every step now needs to vary — **re-signature it once**, or you cannot build any of the six steps without regressing the others:

```tsx
function Option({ selected, onSelect, media, className = '', bodyClass = 'p-4 lg:p-5', children }: {
  selected: boolean; onSelect: () => void; media?: React.ReactNode
  className?: string; bodyClass?: string; children: React.ReactNode
}) {
  return (
    <button type="button" onClick={onSelect} aria-pressed={selected}
      className={`group relative block w-full overflow-hidden rounded-box border text-left
                  transition-[border-color,background-color] duration-150 ${
        selected ? 'border-primary ring-2 ring-primary' : 'border-base-300 hover:border-base-content/25'
      } ${className}`}>
      {selected && (
        <span aria-hidden className="absolute left-3 top-3 z-10 flex size-7 items-center justify-center
                                     rounded-full bg-primary text-primary-content">
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor"
               strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m4 12.5 5.2 5.2L20 7"/></svg>
        </span>
      )}
      {media}
      <div className={`${bodyClass} ${selected ? 'bg-primary/[0.05]' : ''}`}>{children}</div>
    </button>
  )
}
```

`overflow-hidden` + `rounded-box` still clips `media`; `ring-2` still draws outside the border box so it is never clipped. Options stay individual `<button aria-pressed>` — **not** a radiogroup; that interaction model is marked done.

**Selection medallion is top-LEFT, deliberately.** Verified by inspection: Bakhawan's watermark pills are top-right (`-1`, `-2`) and bottom-right (`-3`). Top-left is clear sky on Purita, canopy on island-1, ceiling on providence-1, and clear on all three Bakhawan frames.

**The plate rule** (grafted from *The Long Wall*, and the answer to "food and dress code must still feel premium"): **every `Option` in the app has a rectangle at the top of the card** — a photograph on venues, a numeral on dates, a rate-card header on food, the swatches on dress, a glyph on RSVP. Scrolled at speed, the food step and the venue step share one silhouette, so nothing reads as the screen where the design ran out. It is a constant *device*, not a constant height.

### 8.3 Step 0 — Dates

Grid: `grid gap-3 sm:grid-cols-3 sm:gap-4 lg:gap-5`.

Plate (`h-24 lg:h-28`, flips to navy on select — the most expensive-looking thing a single-accent palette can do, at zero new colour):

```jsx
media={
  <div className={`flex h-24 flex-col justify-end px-5 pb-4 transition-colors duration-150 lg:h-28 ${
    selected ? 'bg-primary text-primary-content' : 'bg-base-200'}`}>
    <span className="eyebrow">{TRACK_LABEL[d.track]}</span>
    <div className="mt-1 flex items-baseline gap-1.5">
      <span className="text-sm opacity-55">{month}</span>
      <span className="folio text-[2.5rem]">{day}</span>
    </div>
  </div>
}
```
`const [month, day] = d.label.split(' ')` — no data change.

Body keeps **both** existing signals: the track badge is now on the plate, and `venueSummaryForTrack(d.track)` stays at `text-[0.8125rem] leading-relaxed opacity-50`. **Do not drop it** — naming the venues a date commits you to, one screen early, is the best piece of guidance in the current build.

### 8.4 Step 1 — Venues

```jsx
<div className="grid gap-4 md:grid-cols-2 md:gap-5 md:items-start
                xl:grid-cols-12 xl:gap-8">
```
At `md`–`lg` both cards are equal 2-up. At `xl` the 12-column grid engages and `venueLayout()` supplies each card's `xl:col-span-*`. `items-start` stops the one-photo Purita card being stretched to the height of a five-photo Island card.

```jsx
const layout = venueLayout(venues)
venues.map((v, i) => {
  const hero = v.photos[0]!
  const extras = v.photos.slice(1)
  return (
    <Option key={v.id} className={`${layout[i]!.span} lg:col-span-6`} bodyClass="p-4 lg:p-6" …>
      media={
        <div className="relative aspect-[4/3] w-full bg-base-200 sm:aspect-[16/10]">
          <Image src={hero.src} alt={hero.alt} fill priority
                 sizes={layout[i]!.sizes}
                 style={hero.focus ? { objectPosition: hero.focus } : undefined}
                 className="object-cover transition-transform duration-500 ease-out
                            group-hover:scale-[1.03] group-focus-visible:scale-[1.03]" />
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/75 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-3.5 lg:p-5">
            <p className="h-display text-xl text-white lg:text-[1.75rem]">{v.name}</p>
            <p className="text-xs text-white/75 lg:text-sm">{v.location}</p>
          </div>
        </div>
      }
```

Name plate **bottom-left, always** — never top-right (watermarks) and never bottom-right (`bakhawan-3`, `providence-4`). Never pair `objectPosition` with a Tailwind `object-*` position class on the same element. `priority` on both heroes: the step only ever shows two cards and both are above the fold at `md`+.

Body: description `text-sm leading-relaxed opacity-70 lg:text-[0.9375rem] lg:max-w-[44ch]`; features as `badge badge-xs lg:badge-sm border-0 bg-base-200` in `flex flex-wrap gap-1.5 lg:gap-2` (counts are 4/4/2/4 — a wrapping row absorbs that); then `mt-4 border-t border-base-300 pt-4` and **the tail**.

**The tail switches on `extras.length` and covers every count, including counts that do not exist yet.** This is the generalisation of the existing `photos.length > 1` guard at `:210` — which was already correct in principle:

| extras | branch | renders |
|---|---|---|
| **0** (Purita) | pull quote | `.pull text-[1.375rem] lg:text-[1.625rem] border-l-2 border-primary pl-4 lg:pl-5` from `v.pull`, then `.caption mt-3` with `v.location`. The one-photo venue becomes the *fullest* card, not the emptiest — and its hero is the largest image in the ballot. |
| **1–2** (Bakhawan) | `grid grid-cols-2 gap-1.5` | |
| **3** (Providence) | `grid grid-cols-3 gap-1.5` | |
| **4+** (Island Hopping) | `grid grid-cols-4 gap-1.5` | a 5th wraps to a second row, left-aligned — a contact sheet, not a bug |

```ts
const cols = extras.length <= 2 ? 'grid-cols-2' : extras.length === 3 ? 'grid-cols-3' : 'grid-cols-4'
```

**Every thumbnail is `aspect-[3/2]`, regardless of column count.** Uniform ratio is what lets `focus` crop watermarks out (a square thumb of the 1:1 `providence-4` cannot crop its logo away; a 3:2 thumb with `focus:'50% 22%'` can). Thumb markup:

```jsx
<div className={`mt-3 grid gap-1.5 ${cols}`}>
  {extras.map((p) => (
    <div key={p.src} className="relative aspect-[3/2] overflow-hidden rounded-selector bg-base-200">
      <Image src={p.src} alt={p.alt} fill loading="lazy"
             sizes="(max-width:767px) 24vw, 140px"
             style={p.focus ? { objectPosition: p.focus } : undefined}
             className="object-cover" />
    </div>
  ))}
</div>
```

**No nested interactive element inside the card** — no lightbox trigger, no "more photos" button, and deliberately **no horizontal scroll strip**: a swipe-to-scroll container inside a `<button>` fires the button's click on touch. The wrapping grid needs no gesture and no JS.

### 8.5 Step 2 — Food (no photography, ever)

`grid gap-3 md:grid-cols-3 md:gap-5`, each `Option` with `className="h-full"` and `bodyClass="flex h-full flex-col p-4 lg:p-6"` so the three cards are equal height and their ruled rows line up across the row.

Plate = the menu header:
```jsx
media={
  <div className={`flex h-24 flex-col justify-end px-5 pb-4 transition-colors duration-150 lg:h-28 ${
    selected ? 'bg-primary text-primary-content' : 'bg-base-200'}`}>
    <span className="eyebrow">Caterer {String(i + 1).padStart(2, '0')}</span>
    <span className="h-display mt-1 text-[1.375rem] lg:text-[1.625rem]">{f.name}</span>
  </div>
}
```

Body: a short black rule `h-0.5 w-10 bg-base-content` (the classic menu mark — the thing that makes a text-only card feel *set* rather than typed), tagline `mt-4 text-sm opacity-65`, then the three `details` as a ruled list:

```jsx
<ul className="mt-5 tabular-nums">
  {f.details.map((d) => (
    <li key={d} className="border-b border-base-300/60 py-2.5 text-[0.8125rem] leading-snug opacity-70 last:border-0">{d}</li>
  ))}
</ul>
<p className="caption mt-auto pt-5">Package size follows the final headcount.</p>
```

The `details` are freeform strings (`'Packages ₱3,000–15,000 · 15–40 pax'`, `'Medellin, Cebu'`) — **do not try to parse the `·` into aligned price columns.** `tabular-nums` alone keeps the figures even; there is no column to align and splitting the strings is brittle. Every caterer has exactly three `details`, so the three cards are naturally flush.

### 8.6 Step 3 — Dress code (no photography, ever)

`grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4 xl:gap-5`. The swatch band grows from `h-14` to the whole plate, and the **first swatch is weighted double**:

```jsx
media={
  <div className="relative flex h-28 w-full sm:h-32 lg:h-40">
    {p.swatches.map((hex, i) => (
      <span key={hex} style={{ backgroundColor: hex, flex: i === 0 ? '2 1 0%' : '1 1 0%' }} />
    ))}
    <p className="h-display absolute left-4 top-4 text-xl text-white">{p.name}</p>
  </div>
}
```

**Why this is safe and why it is the best photoless device in the project:** `flex` does the arithmetic, so the uneven 5/3/3/3 swatch counts are invisible *by construction* — five bars and three bars fill the same field exactly, with no padding to a fake uniform. Weighting `swatches[0]` turns a flat gradient strip into a composition: one dominant field with accent bands, which is what a paint chip actually looks like. And **`swatches[0]` is the dark anchor in all four palettes — `#0A1680`, `#1A1A55`, `#104B6C`, `#224668` (verified in `lib/ballot.ts:197-215`) — so white type at top-left is legible on every one with no scrim.** Note `#FCFDFF` and `#FEE14E` sit at the *right* of their rows; never put type over the full band.

Body: description `text-[0.8125rem] opacity-55 lg:text-sm`, then the hexes printed on the same `flex-1` rhythm so each label sits under its own colour — `hidden sm:flex mt-4` (five hexes do not fit at 360px), each `flex-1 caption tabular-nums truncate pr-1`, `aria-hidden`. Then `mt-4 border-t border-base-300 pt-3` and `.caption`: "Any shade counts. Nobody is buying anything new."

The raw hex swatches remain the single sanctioned exception to the one-accent rule.

### 8.7 Step 4 — The programme

`<div className="mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-x-12 xl:gap-x-16">`

Left: the timeline (see §10). Right, `hidden lg:block lg:sticky lg:top-24 lg:self-start` — the margin column:
- `.rule-heavy` then `.eyebrow` "At a glance".
- A `<dl>` of facts **derived inline from `PROGRAM`**, no new data file: `8:00am — till late`, `{PROGRAM.length} moments`, `{PROGRAM.filter(i => i.kind === 'games').length} games`. Rows `flex items-baseline justify-between border-b border-base-300 py-2.5`, label `.caption`, value `text-sm font-medium tabular-nums`.
- Then the pull quote, `mt-8 .pull text-[1.375rem] xl:text-[1.5rem] border-l-2 border-primary pl-5`, lifted **verbatim** from the 10:15am item's own note: *"Everyone gets a moment to share what the last nine years looked like."* Attribution `.caption mt-3`: "10:15am — Asa Na Ta?". Real content, not invented copy, and it is the emotional centre of the day sitting in the margin of the schedule — immediately before the RSVP asks whether you are coming.

`field: undefined` so `answered` stays unconditionally `true` and the CTA still reads "Looks good". **Mobile:** the aside is `hidden`, the timeline renders exactly as today. Zero regression.

### 8.8 Step 5 — RSVP

`lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-10`.

Left: the three `ATTENDANCE` options, `grid gap-3 sm:grid-cols-3 sm:gap-4`, each with a plate carrying a `size-7` inline SVG (check / dash / cross) at `opacity-30`, `max-sm:hidden` on the plate so phones keep today's compact three-row list. Label `h-display text-xl lg:text-2xl`.

Right: `<Summary>` — now built from `planRows(draft)` so it cannot drift from the rail — as a bordered ballot card, `rounded-box border border-base-300 divide-y divide-base-300/70`, rows `lg:px-5 lg:py-3.5`, `'—'` fallback kept. On mobile it stays above the options exactly as today.

---

## 9. `components/stepper.tsx`

Almost untouched. `furthest` rule, `aria-current="step"`, `data-content={done ? '✓' : i+1}`, and the button-vs-span switch at `:25-36` all stay.

Only change: `className={`step text-[0.625rem] md:text-[0.6875rem] lg:text-xs ${…}`}`. The `min-width` relief is in `globals.css` (§2) — with daisyUI's default `min-width:4rem`, six steps need 384px and `.steps`' own `overflow: auto hidden` starts scrolling inside a 320px content box on a 360px phone.

**Keep `steps-horizontal` at every width.** `steps-vertical` would require re-scoping the existing unscoped `.steps .step:before { height: 2px }` — daisyUI's vertical rail is `width:.5rem; height:100%`, so the current override collapses it to a 2px stub that looks fine on mobile and broken on the reviewer's laptop.

---

## 10. `components/program-timeline.tsx`

One optional prop, nothing else:

```ts
export function ProgramTimeline({ items = PROGRAM }: { items?: readonly ProgramItem[] } = {}) {
```
and `items.map(...)`, `const last = i === items.length - 1`.

In `ballot-form.tsx` step 4:
```jsx
const HALF = Math.ceil(PROGRAM.length / 2)   // 7 today; derived, not hardcoded
<div className="lg:hidden"><ProgramTimeline /></div>
<div className="hidden lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
  <ProgramTimeline items={PROGRAM.slice(0, HALF)} />
  <ProgramTimeline items={PROGRAM.slice(HALF)} />
</div>
```

**Why two independent `<ol>`s rather than one CSS-grid two-column list:** a single `<ol>` with `grid-auto-flow: column` flows row-major unless you also pin `grid-template-rows`, and `auto` rows then size to the tallest item *across both columns*, opening gaps the per-item absolute rail cannot span. Two `<ol>`s keep each column in normal flow, so **`left-[4.55rem]`, `w-16` and `gap-3.5` are never re-derived** — the README forbids it and the offset is hand-tuned, not geometric. The cost is 14 items of static markup in the DOM twice, one set `display:none` (so screen readers skip it). That is the right trade.

**Do not change `w-16`, `gap-3.5`, `size-[7px]`, or `ring-4 ring-base-100`.** Scale type only: `<ol className="relative lg:text-[0.9375rem]">`, items `pb-5 lg:pb-6`, note `max-w-[46ch]`. `HIGHLIGHTED = ['games','night']` and the two-kinds-only restraint stay — it is why a 14-item list reads as a day rather than a spreadsheet.

One editorial addition: the four items that carry a `note` get `lg:border-l lg:border-base-300 lg:pl-4` on the note paragraph — a hanging indent that produces a deliberate rag exactly where the day has something to say.

---

## 11. `app/done/page.tsx`

`max-w-md` → `.shell`, with `lg:grid lg:min-h-dvh lg:grid-cols-2 lg:items-center lg:gap-20 py-14`.

Left (today's block, larger): the navy tick disc, `h1.h-display text-[2.75rem] lg:text-[3.5rem]` "Thanks, {firstName}.", the reassurance line, and the `btn-outline` link at `lg:w-auto lg:min-w-[16rem]`. `name?.split(',')[1]?.trim()` is unchanged.

Right: `rounded-box border border-base-300 p-6 lg:p-8` — the dress-code block with its 14 deduped swatches grown from `size-5` to `size-8 lg:size-9` in `flex flex-wrap gap-1.5`, so they read as a colour study rather than a row of pips.

`/done` has no fixed footer, so this is the one route where a decorative `lg:-rotate-1` would be safe — **not used**, to keep the "no transforms anywhere in this app" rule simple and unbreakable.

---

## 12. `app/results/[secret]/page.tsx`

Committee-only; nobody opens it from Messenger. Tally maths, `force-dynamic`, the secret gate and the `count / max` rule are untouched.

`max-w-xl px-6 py-14` → `<main className="shell py-12 lg:py-16">` with `max-w-[80rem]` on the `.shell` instance (`className="shell max-w-[80rem]"`).

- **Masthead band** — `border-b-2 border-base-content pb-8 lg:grid lg:grid-cols-12 lg:items-end lg:gap-10`. `lg:col-span-7`: `.eyebrow` "Committee only" + `h1.h-display text-[2.75rem] lg:text-[5rem]`. `lg:col-span-5`: the hero count `.h-display text-6xl lg:text-[6.5rem] tabular-nums` + "of 73 voted", `progress progress-primary h-1.5 w-full mt-3` beneath.
- **Attendance** — `stats stats-vertical sm:stats-horizontal mt-8 w-full border border-base-300 bg-base-100`, `stat-value text-2xl lg:text-4xl tabular-nums`.
- **The four tallies** — `mt-12 grid gap-x-14 gap-y-10 lg:grid-cols-2 xl:grid-cols-4 xl:gap-x-10`. Each `<section>` opens `border-t border-base-300 pt-4` with its `.eyebrow`. The `<ol>` is unchanged in logic; give it `max-w-xl` so a 3-option bar never stretches to 700px and stops reading as a length. At `xl` all four questions sit in one row — the committee sees the whole decision without scrolling, which is the real reason this page goes wide.
- **Not yet voted** — `mt-14 border-t-2 border-base-content pt-8`, badge cloud unchanged. "Everyone has voted." gets `h-display text-[1.75rem] lg:text-[2.5rem]`.

---

## 13. DENSITY LEDGER — every `sizes` in the app

All three current strings are hard-coded to the 448px column and would fetch a 448px file for a 1600px slot. Every one is replaced.

| Image | base | sm | md | lg | xl | ≥1440 | cap | worst DPR |
|---|---|---|---|---|---|---|---|---|
| cover | 100vw | 100vw | 100vw | 461 | 578 | **662** | 960 | 2.9× |
| venue hero *wide* | 100vw | 512 | 46vw | 34vw | 38vw | **542** | 1024 (Purita) | 3.8× |
| venue hero *narrow* | 100vw | 512 | 46vw | 34vw | 27vw | **378** | 414 (Bakhawan) | **2.19×** |
| venue hero *equal* | 100vw | 512 | 46vw | 34vw | 32vw | **459** | ≥480 | 2.09× |
| venue thumb | 24vw | 24vw | 24vw | 140 | 140 | **140** | 360 (island-5) | 2.57× |
| rail / plan thumb | — | — | — | — | — | — | — | — |

Measured column widths behind those numbers: shell content = 944 @1024, 1168 @1280, **1328 @≥1440**. Rail 272 @lg / 320 @xl. Measure = **632 @1024, 792 @1280, 952 @≥1440**. Venue 12-col sub-grid @952 with `gap-x-8`: col = 50, span-7 = **542**, span-6 = **459**, span-5 = **378**.

**Nothing exceeds its cap. The tightest is Bakhawan at 378 / 414 — 91% of budget, ~2.19× DPR.** That is the fit the `venueLayout` rule was built to hit, and it is why the two-up grid is correct rather than a compromise: a full-measure 952px band would upscale Bakhawan's 828px hero by 2.3×.

`priority`: cover + both venue heroes of the current track (only ever two images). Everything else lazy. No `quality` overrides — every source is ≥720px and Next 16's `images.qualities` allowlist is therefore not needed, so `next.config.ts` **does not change**.

---

## 14. EVERY FATAL FLAW, AND HOW IT IS NEUTRALISED

| Flaw the judges named | Fix |
|---|---|
| Photo inventory fabricated; city venues called 1-photo deck crops | §1 re-measured from disk. Real counts 1/3/5/4. All "matte / proposal deck / real photos to follow" copy **deleted**. `README.md:90-93` and `lib/ballot.ts:38-42` corrected. |
| Tail hardcoded 0/1/2 → two venues render no branch | Tail switches on `extras.length` with 0 / 1–2 / 3 / 4+ branches; every count renders, including counts that don't exist yet. |
| "Province = good photos, city = weak" inverts the truth | Grading is `photoCap()` from intrinsic pixels via `venueLayout()`. No venue is keyed to an id. Re-shoot a file and the layout re-grades itself. |
| `sizes` is a width; a 2:3 crop of a 4:3 source ships soft while the spec claims sharp | **Rule A (§4):** a crop box is never taller in aspect than its source, so `sizes` = rendered CSS width, always. Hero is `4/3` → `16/10`, both ≥ every hero's source aspect. Full ledger in §13. |
| Variant C keyed to `photos.length === 2` — matches zero venues, dead code | No count-equality branches anywhere. All thresholds are ranges. |
| Everything `hidden lg:block`; mobile gets the costs, none of the persuasion | Rail furniture (folio, eyebrow, h1, standfirst) is **not hidden** — on mobile it is the top of the page in DOM order. Only the answer *card* is `lg`-only, and mobile gets the header chip strip instead. Venue heroes go *taller* (4:3) on mobile, not shorter. |
| `.folio .caption .pull .dropcap .rise-1/-2/-3` used but never defined | All defined in §2. `.dropcap` deliberately dropped (fragile `::first-letter`). |
| `lg:btn-auto` does not exist in daisyUI 5.7.37 | Confirmed against `node_modules`: only `btn-xs|sm|md|lg|xl`. Uses `lg:w-auto lg:min-w-[16rem]`. |
| `mx-auto` will not centre `.steps` (`display:inline-grid`) | Confirmed in daisyUI source. Centred with a flex parent + `lg:justify-center`. |
| Action bar gains `px-5` on top of the outer div's `px-5` → 40px gutters vs 20px | `px-5` removed from the outer fixed div; `.shell` supplies inline padding once. |
| `divide-y` dies in CSS columns | Hairline moved onto each `<li>` as `border-b` + `lg:break-inside-avoid`. |
| Reduced-motion zeroes duration but not delay → staggered items invisible | `animation-delay: 0ms !important` added to the existing block. |
| Programme grid flows row-major while the rail-hiding maths assumes column-major | Two independent `<ol>`s via an `items` prop; no grid-flow, no rail-stub maths, `left-[4.55rem]` untouched. |
| `steps-vertical` collapses because `.steps .step:before{height:2px}` is unscoped | `steps-vertical` not used at any width. |
| `Option` hardcodes `p-4` / `bg-primary/[0.05]` — the one edit that regresses all six steps | Re-signatured **once** with `className` + `bodyClass` (§8.2) before any step is built. |
| Scroll strip inside a `<button>` → swipe selects the venue | No scroll container inside any Option; extras are a wrapping grid. |
| Rail overflow on a short laptop silently hides content | `lg:max-h-[calc(100dvh-8rem)] lg:overflow-y-auto lg:overscroll-contain`; rail content measures ~420px so it only triggers on very short windows. |
| Hand-tuned rail offset re-derived and broken | `w-16`, `gap-3.5`, `left-[4.55rem]` are explicitly frozen at every breakpoint. |
| Silent `venueId` drop invisible to the user | `venueCleared` state + `VENUE_CLEARED_NOTE` under the Where row. Reset logic itself untouched. |
| OG card missing — link unfurls bare in the one Messenger share | §5. |

---

## 15. FOR YOU TO DECIDE — I have not assumed these

1. **`island-hopping-2.jpg` is a crowded party boat, mostly swimwear.** It is the highest-resolution Island Hopping file (1440×1080) and the most social, but it is a tour-operator promo shot of strangers, not the batch. For a 9-years-later reunion where people may scroll this with family, **do you want it in the ballot at all?** My spec leaves it in as a thumbnail and uses the clean, bright `island-hopping-1` (pink deck, beanbags, turquoise, no people) as the hero. Say the word and I'll drop `-2` entirely.
2. **Providence hero order.** `photos[0]` is currently `providence-1` (960×640 open-plan living — the neutral establishing shot, and the *smallest* Providence file). `providence-2` (2048×1364, home cinema with the moss wall) and `providence-3` (2048×1516, Star Wars bedroom) are far more striking and 2× the resolution; "Home cinema" is already one of the venue's `features`. **Reordering so `providence-2` leads makes it the widest card in the city track automatically** (`venueLayout` flips to narrow/wide with no code change) and pushes the worst-case DPR from 2.09× to 3.8×. Establishing shot vs. wow shot is a taste call — yours.
3. **`providence-townhomes-4.jpg` is a CGI render with a developer's "Providence Place Townhomes" logo across the bottom fifth** — not a photograph of the actual interior like the other three. `focus: '50% 22%'` crops the logo out of a 3:2 thumb, but it still sits beside three real photos. Keep, or drop to 3 photos?
4. **Bakhawan's watermarks.** All three files carry the venue's own "BAKHAWAN BEACH HOME · Daanbantayan, Cebu" pill. The crops and the bottom-left name plate avoid collisions, and one pill survives visibly on `bakhawan-2`. Worth asking the committee for unwatermarked files, or accept it as a listing photo?
5. **The landing pushes the task below the fold on desktop.** A laptop user scrolls once between opening the link and finding their name. If you'd rather not pay that, the alternative is a single-column landing with the cover capped at ~720px and the picker immediately beneath — less of a cover spread, zero scroll.
6. **`metadataBase` needs the real deployed URL.** I've wired it to `NEXT_PUBLIC_SITE_URL` with a localhost fallback; add the value to `.env.example` and the host.
7. **Resume-where-you-left-off.** The draft stores answers but not `step`/`furthest`, so a returning member lands on step 0 with everything pre-selected and must press Next through all six. The rail and the chip strip now make that re-walk read as *review* rather than re-work, which is the honest presentation-only answer. Actually fixing it means adding `step` to the `Draft` type — a behaviour change, outside "presentation only". Want it?
8. **`.shell`'s 1440px ceiling.** On a 1920 display that leaves 240px of margin each side. Deliberate — line length and a composed page — but if "maximizes full width" should read more literally, the single change is `max-width: 96rem`.

---

## 16. BUILD ORDER

1. `globals.css` primitives + the reduced-motion `animation-delay` line (nothing else compiles cleanly without `.shell`, `.folio`, `.caption`, `.pull`).
2. `lib/ballot.ts` — `w`/`h`/`focus`/`pull`, `photoCap`, `venueLayout`, `planRows`, `STEP_NOTE`. Fix the stale doc comment.
3. `Option` re-signature (§8.2) — **before** any step, or you regress all six.
4. `ballot-form.tsx` shell: header, `.shell` at all three mount points, the rail, the action bar.
5. Steps 0, 2, 3, 5 (the plate rule) — these are pure CSS and prove the system without touching images.
6. Step 1 (venues) — the only step with real image maths. Check the §13 ledger at 1440 in DevTools.
7. Step 4 + `program-timeline.tsx` `items` prop.
8. `stepper.tsx`, `roster-picker.tsx`, `page.tsx`.
9. `layout.tsx` OG, `done`, `results`.
10. `README.md` "Photos" section.

**Verify before shipping:** `pnpm typecheck && pnpm test` (the Zod track-rule tests in `lib/schema.test.ts` must still pass untouched); then walk both tracks at 360px, 768px, 1024px and 1440px, and confirm the action bar is still bottom-anchored on iOS Safari with the keyboard closed.