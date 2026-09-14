# Batch DOS Reunion

A voting app for the batch reunion. Members open one link, find their name, and answer
four questions plus attendance. Ballots are written straight into the `Votes` tab of the
reunion workbook, so the committee reads results in a spreadsheet they already use.

Design and decisions: [`docs/superpowers/specs/2026-09-14-batch-dos-reunion-voting-app-design.md`](docs/superpowers/specs/2026-09-14-batch-dos-reunion-voting-app-design.md)

## How it works

| Route | What it does |
|---|---|
| `/` | Roster picker — search 73 names, voted ones show a ✓ |
| `/vote` | Five screens: date → venue → food → dress code → attendance |
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

**Type is Instrument Serif over Inter.** The serif carries anything that speaks —
page titles, questions, the tally's hero number — at 400 weight and slightly negative
tracking. Inter handles everything that merely labels: options, badges, the stepper,
tabular figures. The `.h-display` and `.eyebrow` classes are the only two typographic
primitives; use them rather than restating sizes inline.

**The stepper** is daisyUI `steps` with its rail thinned to 2px and its discs cut to
1.5rem — its width and offset are left alone, since overriding those makes the
connector overshoot the final step. Answered steps are tappable to jump back.

Copy is English and kept short on purpose — the deck's Bisaya headings were dropped
from the interface. Nothing but `lib/ballot.ts` needs editing to change wording.

## Notes

- The proposal PDF is image-only; ballot content in `lib/ballot.ts` was transcribed by
  hand and must be updated by hand if the committee revises the deck.
- Palette names in question 4 were grouped from the moodboard slide, which never labelled
  them as sets. Rename them in `lib/ballot.ts`.
