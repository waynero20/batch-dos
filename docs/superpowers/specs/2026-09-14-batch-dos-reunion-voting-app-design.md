# Batch DOS Reunion — Voting App

**Date:** 2026-09-14
**Status:** Approved, pending implementation plan

## 1. Purpose

The reunion committee has a proposal deck ("ASA NA' TA? — 9 years later") offering
members a choice of date, venue, caterer and dress-code palette. Those choices are
currently trapped in a Canva deck that nobody can respond to. This app collects one
ballot per batch member so the committee can make the final call on evidence rather
than on whoever shouted loudest in the group chat.

**Success criteria:** at least 37 of the 73 masterlist members (a simple majority) submit a
ballot, and the committee can read the tally without asking anyone to export anything.
The majority threshold is an assumption, not a committee mandate — revise it if the
committee sets its own quorum.

## 2. Decisions

| Decision | Choice | Why |
|---|---|---|
| Identity | Pick your name from the roster, no passcode | 73 known members sharing one Messenger link. Any gate costs turnout; the batch is trusted. |
| Scope | Vote + attendance, no payment or t-shirt tracking | Attendance and preference are what the venues and caterers need now. Fees depend on decisions that have not been made yet. |
| Date ↔ venue | Hard link | The deck tags dates and venues `province`/`city`. Unfiltered ballots would produce impossible combinations the committee has to reconcile by hand. |
| Attendance position | Asked last | Members commit more readily after seeing a date and venue they like. |
| Datastore | Existing Google Sheets workbook | The committee already works there. A second database is one more thing to maintain past the event. |
| Results visibility | Committee only, secret URL | Keeps the vote uninfluenced until the committee announces. |
| Deadline | None initially; manual close via `VOTING_OPEN` env var | No date fixed yet. |

## 3. Ballot content

Sourced verbatim from `Reunion-Proposal.pdf` (13 slides, image-only).

### Q1 — Kanus-a ta mag Kita? (When do we meet?)

| Option | Track |
|---|---|
| December 26 | province |
| January 2 | province |
| January 9 | city |

The selected option sets `track`, which filters Q2.

### Q2 — Asa ta mo Adto? (Where do we go?)

**Province track**

- **Purita Farms** — Vacation house with pool and a pickleball court. Has rooms for an
  overnight stay and a working kitchen. Barangay Bangkal Poblacion, San Remigio.
- **Bakhawan Beach Home** — Beach house with a pickleball court. Has rooms for an
  overnight stay and a working kitchen. Also has a pool table. Barangay Bakhawan,
  Daanbantayan.

**City track**

- **Island Hopping** — Island hopping in Lapu-Lapu. Can fit up to 60 people.
- **Providence Townhomes** — 4-level townhome with rooms for overnight stay.
  Providence Street, Cebu City.

### Q3 — Unsa ato Kan-on? (What do we eat?)

Members vote on the caterer, not on a specific package — the package depends on final
headcount, which is not known yet.

- **Option 1 — Food Packages / Bilao.** Packages A–G, PHP 3,000–15,000, serving 15–40 pax.
  Bilao PHP 1,200–3,000 (10–25 pax). Catering service PHP 250/300/350 per pax including
  buffet set-up, tables and chairs.
- **Option 2 — Rodmer's Lechon & Bellychon** (Sto. Niño Village, Poblacion, Medellin, Cebu).
  Food trays: chicken, pork and seafood PHP 1,200/tray; pasta, noodles and vegetables PHP 700/tray.
- **Option 3 — Food Trays.** Itemised tray pricing across noodles, desserts, pork, beef,
  seafood and chicken, in small (10–15 pax), medium (20–25 pax) and large (40–50 pax).

Each option shows its source menu image, tappable to zoom.

### Q4 — Unsa ato Isul-ob? (What do we wear?)

The deck settles the family — "any shade of blue, white, or yellow" — and members vote on
a concrete palette so photos on the day hold together. Palettes are grouped from the
moodboard slide; names are provisional and the committee may rename them.

| Palette | Swatches |
|---|---|
| Bleu Océan | `#0A1680` `#93B2F8` `#FBEDB0` `#F7B94C` `#FCFDFF` |
| Space Cadet | `#1A1A55` `#FEE14E` `#EFF8FF` |
| Heritage | `#104B6C` `#F5EFC1` `#E3DED8` |
| Golden Hour | `#224668` `#C9930A` `#D5BFA7` |

### Q5 — Kita nya ta? (Are you joining?)

`Oo, apil ko!` · `Dili pa sure` · `Dili ko maka-apil`

Answering `Dili ko maka-apil` still records the ballot — a declined member's venue
preference is not useful, but the headcount signal is.

## 4. Architecture

Next.js 15 App Router on Vercel. Google Sheets API v4 through a service account. The
server action is the only thing that touches Google; credentials never reach the client.

```
Browser (mobile-first)
      │
      ▼
Next.js 15 · App Router ──────────── Vercel
  /          roster picker (73 names)
  /vote      5-step ballot
  /done      confirmation + dress code
  /results   tally (secret path, committee only)
      │
      │  server action · Zod validated
      ▼
googleapis · service account (server-only)
      │
      ▼
Existing workbook
  Attendees  │  Votes ← new tab
```

### Routes

- `/` — hero and roster picker. Reads the Votes tab (cached ~30s) to mark who has voted.
- `/vote` — five steps, client-held state, one server action on submit.
- `/done` — confirmation, dress-code card, share button.
- `/results/[secret]` — tally per question, plus who has not yet voted.

## 5. Data model

A new `Votes` tab in the existing workbook, **pre-seeded with all 73 masterlist names,
one row each, answers blank**. Submitting fills in that member's row in place.

```
A Timestamp │ B Name │ C Track │ D Date │ E Venue │ F Food │ G Palette │ H Attending
```

One row per member, always current, in masterlist order. Blank timestamp means they have
not voted — so "who is still missing" is visible at a glance with no formula. No duplicate
rows for the committee to reconcile, and re-voting overwrites rather than appends.

The roster is generated once from the Attendees tab into a checked-in TypeScript constant.
Names are static; there is no reason to pay an API call on every page load.

The picker's names and the Votes tab's seeded rows are therefore two copies of the same
list. Both are emitted by a single script, `scripts/seed-roster.ts`, which reads the
Attendees tab and writes both — so they cannot drift. Re-running it after the masterlist
changes is the only supported way to add or remove a member.

## 6. Validation and error handling

Zod validates the ballot server-side. The load-bearing rule is that `track` must agree
with both `date` and `venue` — a forged `January 9 + Purita Farms` submission is rejected,
not stored. Client-side filtering is a convenience; the server is the authority.

- **Sheets API failure** — answers held in `localStorage`, automatic retry, plain-language
  error. A member who closes the tab mid-ballot resumes where they left off.
- **Re-voting** — allowed. The picker shows a ✓ and offers "change my answer"; submitting
  overwrites the member's row.
- **Voting closed** — the `VOTING_OPEN` environment variable. Set it to `false` and every
  ballot route renders read-only without a redeploy of code.

## 7. Design language

Taken from the proposal deck rather than invented.

- **Colour** — navy `#0A1680` / `#224668`, butter yellow `#FEE14E` / `#FBEDB0`,
  alice blue `#EFF8FF`, blanc cassé `#FCFDFF`. Expressed as oklch CSS variables with
  semantic names.
- **Texture** — scrapbook collage: kraft paper, tape, paper clips, grid paper, hand-drawn
  stars, halftone grain.
- **Type** — bold condensed sans headlines mixing roman and italic, as the slides do.
  Bisaya headline with a small English subtitle beneath.
- **Motion** — CSS keyframes and Tailwind transitions only. Card lift on select, slide
  between steps. No animation library.
- **Layout** — mobile-first, one question per screen, large tap targets, progress dots.

## 8. Testing

- Zod schema: valid ballots accepted, each malformed shape rejected.
- **Track consistency fails closed** — every mismatched date/venue pair is rejected.
- Server action against a mocked Sheets client: correct row targeted, correct columns written.
- Roster generation: all 73 masterlist names survive the transform.

## 9. Out of scope

No admin panel — the spreadsheet is the admin panel. No authentication, no payment or
registration-fee tracking, no t-shirt sizes, no email or push notifications, no realtime
websockets. Each was considered and dropped as unnecessary for a one-round decision vote.

## 10. Prerequisites

Before implementation can be verified end to end:

1. A Google Cloud project with the Sheets API enabled and a service account.
2. The workbook shared with the service account address as Editor.
3. `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `SHEET_ID` and `RESULTS_SECRET`
   in the environment.
4. Committee confirmation of the four palette names.
