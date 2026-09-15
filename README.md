# Batch DOS Reunion

A voting app for the batch reunion. Members open one link, find their name, and answer
four questions plus attendance. Ballots are written straight into the `Votes` tab of the
reunion workbook, so the committee reads results in a spreadsheet they already use.

Design and decisions: [`docs/superpowers/specs/2026-09-14-batch-dos-reunion-voting-app-design.md`](docs/superpowers/specs/2026-09-14-batch-dos-reunion-voting-app-design.md)

## How it works

| Route | What it does |
|---|---|
| `/` | Roster picker — search 73 names, voted ones show a ✓ |
| `/vote` | Six screens: date → venue → food → dress code → the day's programme → attendance |
| `/done` | Confirmation and the dress-code card |
| `/results/<RESULTS_SECRET>` | Committee tally. Any other secret 404s. |

**The date picks the track.** December 26 and January 2 are province dates, January 9 is
the city date, and each track only offers its own venues. That rule is enforced on the
server, so an impossible ballot cannot be stored even if the request is forged.

## Setup

```bash
pnpm install
cp .env.example .env.local   # fill in from the service-account JSON
pnpm seed                    # generates lib/roster.ts and prepares the Votes tab
pnpm dev
```

`GOOGLE_PRIVATE_KEY` keeps the literal `\n` escapes exactly as they appear in the JSON.
Do not hand-edit them — the app unescapes the key at runtime, and "fixing" the newlines
yourself produces an opaque auth failure.

The workbook must be shared with `GOOGLE_SERVICE_ACCOUNT_EMAIL` as **Editor**.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Development server |
| `pnpm seed` | Regenerate the roster from the Attendees tab and re-seed the Votes tab. Safe to re-run — existing ballots are preserved. |
| `pnpm votes` | Print the current tally in the terminal |
| `pnpm clear-vote "Surname, Firstname"` | Blank one member's ballot so they can vote again |
| `pnpm test` | Ballot validation tests |
| `pnpm typecheck` | `tsc --noEmit` |

## Running the vote

1. Share the deployed URL in the batch group chat. No password, no sign-in.
2. Watch `/results/<secret>` or the `Votes` tab as ballots arrive.
3. To close voting, set `VOTING_OPEN=false` — every ballot route goes read-only without
   a code change.

## Adding or removing a member

Edit the **Attendees** tab, then run `pnpm seed` and redeploy. That script is the single
origin for both the picker's name list and the Votes tab's rows, so the two cannot drift.

## Design

daisyUI 5 on Tailwind 4, one `reunion` theme in `app/globals.css`.

**Colour is deliberately minimal.** The deck's navy `#0A1680` is the only chromatic
value in the interface; every surface, border and muted text is a true grey rather than
a tinted blue, so the accent has nothing to compete with. The deck's yellow survives
only in the dress-code swatches, which are raw hex and not theme tokens.

**Layout.** One container, `.shell`, capped at 1440px — wider and the venue heroes
get asked for more pixels than the files have. `.bleed` breaks an element out to the
true viewport edge; it is used only for `cover.jpg`, the one asset wide enough for it.

Each ballot step is a two-column editorial spread from `lg`: a sticky rail carrying the
step numeral, the question, a standfirst and the running plan, beside the answers. On
mobile the rail is simply the first stacked block, and the plan appears instead as a
scrollable chip strip in the header once the first answer exists.

**Type is Bricolage Grotesque over DM Sans.** Bricolage carries anything that speaks —
page titles, questions, venue names over photos, the tally's hero number — at 600 weight
with negative tracking. DM Sans handles everything that merely labels: options, badges,
the stepper, tabular figures. The `.h-display` and `.eyebrow` classes are the only two
typographic primitives; use them rather than restating sizes inline. Bricolage ships no
true italic, so never set it in `<em>` — the browser will synthesise a slanted fake.

**The stepper** is daisyUI `steps` with its rail thinned to 2px and its discs cut to
1.5rem — its width and offset are left alone, since overriding those makes the
connector overshoot the final step. Answered steps are tappable to jump back.

Copy is English and kept short on purpose — the deck's Bisaya headings were dropped
from the interface, and the batch's own wordmark now arrives as the cover image instead.
Nothing but `lib/ballot.ts` needs editing to change wording.

## Photos

`public/venues/<venue-id>-N.jpg`, wired through the `photos` field in `lib/ballot.ts`.
The first photo is the card's hero; the rest become a thumbnail grid beneath it.

**Counts are uneven by design — 1 / 3 / 5 / 3 — and the card grades its own layout from
each file's intrinsic pixels, never from a venue id.** `photoCap()` is `width / 2`, the
widest a file can be rendered and still resolve at 2× DPR. `venueLayout()` gives the
wider grid column to whichever hero in the pair has the pixels for it, and only when the
advantage is real (≥25%). Re-shoot a photo, update `w`/`h`, and the layout re-grades
itself with no code change.

Adding a photo: drop it in `public/venues/`, run `sips -g pixelWidth -g pixelHeight` on
it, and add `{src, alt, w, h}` to that venue's `photos`. Set `focus` only where a centred
crop would cut the subject or leave the venue's own watermark in frame.

The tail of each venue card switches on how many extras exist — 0 shows the venue's
`pull` quote instead of a grid, so the one-photo venue reads as the fullest card rather
than the emptiest. 1–2 / 3 / 4+ pick a 2-, 3- or 4-column thumbnail grid.

**Resolution ceiling.** `cover.jpg` is 1920px wide, so a full-bleed hero on a large
retina display renders below 2× and the hand-drawn lettering softens. A 2× or 4× export
from Canva would fix it. Bakhawan's hero is 828px, which is why it takes the narrow
column — a wider one would upscale it.

## The intro

A story of about 68 seconds plays over `/` the first time someone opens it on a device, then
fades into the roster. **Everything in it (text, years, photos, names, timing) lives in
`lib/intro/config.ts`.** The components in `components/intro/` only animate what that file
describes.

- **Replace a photo:** drop the file in `public/intro/`, then update `src`, `width` and
  `height` for that entry (`sips -g pixelWidth -g pixelHeight file.jpg`). Real JPGs go
  through Next's image optimiser automatically; phones are served small versions.
- **Replace text:** edit the scene's `text`. `[PLACEHOLDER TEXT]` marks the 2015 and 2017 lines.
- **Names:** the `names` array, shown in that order. The pacing re-fits itself to any length.
  Every name is up for at least 200 ms so it can be read; adding names means giving the
  names scene more `duration`.
- **Timing:** every duration is milliseconds. `pnpm test` fails if the total, handoff
  included, goes over 70 seconds, if a name would show for under 200 ms, or if a photo
  path doesn't exist. (The original brief said 60 s; it was raised so all 73 names are readable.)
- **Preview:** `/?intro` replays from the start; `/?intro=6` starts at the sixth scene.
  `Escape` or "Skip →" leaves at any point. Once it has been seen or skipped, the device
  remembers (`localStorage["batchdos:intro-seen"]`); "Watch the intro" on `/` replays it.

With `prefers-reduced-motion` the same story plays with fades only: no print moves, and
no name ever appears with a slide-in. The intro also pauses while the tab is in the
background.

## The programme

`lib/program.ts`, transcribed from the workbook's Program tab. Times there are Excel
day-fractions and are converted to fixed strings rather than read live. **Two values in
the sheet are wrong** and are corrected in that file with a comment explaining each —
Game No. 4 ends before it starts, and Chill & Drinks ends at `0.0`. Worth fixing at the
source.

## Notes

- The proposal PDF is image-only; ballot content in `lib/ballot.ts` was transcribed by
  hand and must be updated by hand if the committee revises the deck.
- Palette names in question 4 were grouped from the moodboard slide, which never labelled
  them as sets. Rename them in `lib/ballot.ts`.
