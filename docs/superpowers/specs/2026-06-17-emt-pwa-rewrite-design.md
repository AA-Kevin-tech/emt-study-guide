# EMT Study Guide — PWA Rewrite Design

**Date:** 2026-06-17
**Status:** Approved — ready for implementation plan

## Goal

Rewrite the existing single-file `index.html` EMT study guide as a modern, modular, installable, offline-capable Progressive Web App with spaced-repetition flashcard review. The new build must remain deployable to Railway and must be wrappable for the iOS App Store and Google Play later via Capacitor without rework.

## Non-Goals

- **No backend in v1.** No accounts, no cloud sync, no API surface. All progress stays on-device in IndexedDB. The data model is *sync-ready* (stable IDs, per-record `updatedAt` + `version`) so a sync engine can be added later without a migration.
- **No Capacitor in v1.** Ship as a PWA first; wrap for app stores as a discrete future step. The static build output is what Capacitor would consume — no code changes required when we get there.
- **No authoring UI / admin.** Content lives in typed TypeScript files edited by hand; type safety catches malformed entries at build time.
- **No push notifications.** Requires a server and store credentials — out of scope.

## Stack

- **SvelteKit** + **TypeScript**, built with **Vite**
- **`@vite-pwa/sveltekit`** — service worker, web manifest, install prompt, precaching
- **Dexie** — typed wrapper over IndexedDB for SRS progress
- **`@sveltejs/adapter-static`** — outputs a pure static `build/` directory
- **`serve@^14`** (already in `package.json`) — Railway start command serves `build/`
- **Vitest** for unit tests; **Playwright** for E2E
- **`fake-indexeddb`** for Dexie tests under Node

## Architecture

Static export means the whole app is precacheable as files — that's what makes offline-first easy and what Capacitor will eventually wrap unchanged. No backend, no server-side runtime, no API surface area. Railway becomes a dumb static host.

The `lib/` folder is split by concern, not by feature:

- `lib/content/` — static study material, one TS file per chapter
- `lib/srs/` — pure algorithm (SM-2) + scheduler, no Svelte or Dexie imports
- `lib/db/` — Dexie schema and CRUD; the only module that touches IndexedDB
- `lib/stores/` — reactive Svelte stores that bridge `db/` to components
- `lib/components/` — presentational Svelte components

This boundary lets SRS be unit-tested without a DOM or a database, lets the DB layer be swapped (or extended with a sync engine) without touching components, and keeps content edits isolated from UI changes.

## Project Layout

```
emt-study-guide/
├── src/
│   ├── routes/
│   │   ├── +layout.svelte              # app shell: ECG header + bottom nav
│   │   ├── +page.svelte                # "Today" — review queue + dashboard
│   │   ├── browse/+page.svelte         # 12 parts → 46 chapters list
│   │   ├── chapter/[id]/
│   │   │   ├── +page.svelte            # chapter home (3 mode tabs)
│   │   │   ├── flashcards/+page.svelte
│   │   │   ├── notes/+page.svelte
│   │   │   └── quiz/+page.svelte
│   │   ├── review/+page.svelte         # SRS review session
│   │   ├── stats/+page.svelte
│   │   └── settings/+page.svelte       # export/import, reset, daily budget
│   ├── lib/
│   │   ├── content/
│   │   │   ├── parts.ts                # the 12-part index (PARTS)
│   │   │   ├── chapters/
│   │   │   │   ├── ch-01.ts            # one file per chapter
│   │   │   │   ├── ch-02.ts
│   │   │   │   └── …ch-46.ts
│   │   │   └── index.ts                # aggregator + lookup helpers
│   │   ├── srs/
│   │   │   ├── sm2.ts                  # pure SM-2 algorithm
│   │   │   ├── scheduler.ts            # "what's due now" selector
│   │   │   └── sm2.test.ts
│   │   ├── db/
│   │   │   ├── schema.ts               # Dexie tables
│   │   │   ├── cards.ts                # card-progress CRUD
│   │   │   ├── quiz.ts                 # quiz attempts CRUD
│   │   │   └── settings.ts
│   │   ├── stores/
│   │   │   ├── due.ts                  # reactive "cards due today" store
│   │   │   ├── progress.ts
│   │   │   └── settings.ts
│   │   ├── components/
│   │   │   ├── ECGHeader.svelte
│   │   │   ├── BottomNav.svelte
│   │   │   ├── Flashcard.svelte        # flip + Again/Hard/Good/Easy
│   │   │   ├── QuizQuestion.svelte
│   │   │   ├── Note.svelte
│   │   │   ├── ProgressRing.svelte
│   │   │   └── Heatmap.svelte
│   │   └── styles/
│   │       └── theme.css               # CSS vars carried over from index.html
│   ├── app.html                        # PWA meta, theme-color, viewport
│   └── app.d.ts
├── static/
│   ├── icons/                          # PWA icons (192, 512, maskable, apple-touch)
│   └── favicon.svg
├── tests/
│   └── e2e/                            # Playwright
├── svelte.config.js                    # adapter-static
├── vite.config.ts                      # @vite-pwa/sveltekit config
├── tsconfig.json
├── package.json
├── railway.toml                        # unchanged target, new start command
├── Procfile                            # updated start command
└── README.md
```

**One TS file per chapter** because editing Ch 17 shouldn't touch Ch 16, and per-chapter files tree-shake independently if we ever want lazy loading. The current 247 KB `index.html` is unreadable because `DATA` is one giant object literal — that's the symptom we're treating.

## Data Model

### Static content (bundled, immutable)

Every flashcard, note, and quiz question gets a **stable string ID** (e.g. `ch-01.fc.01`). Progress records reference content by ID, never by array index — this is the load-bearing decision for sync-readiness.

```ts
// lib/content/chapters/ch-01.ts
export const ch01: Chapter = {
  id: 'ch-01',
  number: 1,
  partId: 'part-01',
  title: 'EMS Systems, Research & Public Health',
  cards: [
    { id: 'ch-01.fc.01', q: '…', a: '…' },
  ],
  notes: [
    { id: 'ch-01.n.01', title: '…', body: '…', terms: ['…'] },
  ],
  quiz: [
    { id: 'ch-01.q.01', q: '…', opts: ['A. …','B. …','C. …','D. …'], ans: 1, exp: '…' },
  ],
};
```

### User progress (IndexedDB via Dexie)

```ts
// lib/db/schema.ts
interface CardProgress {
  cardId: string;          // PK, e.g. 'ch-01.fc.01'
  ease: number;            // SM-2 ease factor, default 2.5, floor 1.3
  intervalDays: number;
  reps: number;            // consecutive successful reviews
  lapses: number;          // times "Again"-ed after graduation
  dueAt: number;           // epoch ms — only field the scheduler queries
  lastReviewedAt: number;
  updatedAt: number;       // sync metadata
  version: number;         // sync metadata (incremented on every write)
}

interface QuizAttempt {
  id: string;              // uuid (PK)
  chapterId: string;
  questionId: string;
  selected: number;
  correct: boolean;
  takenAt: number;
  updatedAt: number;
  version: number;
}

interface ChapterVisit {
  chapterId: string;       // PK
  notesRead: string[];     // note ids opened
  lastVisitedAt: number;
  updatedAt: number;
  version: number;
}

interface ReviewLog {
  id: string;              // uuid (PK)
  cardId: string;
  rating: 1 | 3 | 4 | 5;   // Again / Hard / Good / Easy
  reviewedAt: number;
}

interface Setting {
  key: string;             // PK
  value: unknown;
}
```

**Indexes:** `CardProgress.dueAt`, `QuizAttempt.chapterId`, `ReviewLog.reviewedAt`.

**Why a separate `ReviewLog`:** `CardProgress` holds *current* state; `ReviewLog` is the append-only history. Stats (heatmap, accuracy over time, streak) read from `ReviewLog`, keeping the SRS state table small and letting us truncate history independently if it ever grows large.

**Why sync metadata now:** `updatedAt` + `version` on each progress record is what a sync engine needs for last-writer-wins or CRDT-style merge. Adding it now costs ~6 lines per table; retrofitting it later across thousands of existing records is a migration headache.

## SRS Algorithm

Pure functions in `lib/srs/sm2.ts` — no Dexie, no Svelte, fully unit-testable.

```ts
type Rating = 1 | 3 | 4 | 5;  // Again | Hard | Good | Easy

interface SrsState {
  ease: number;
  intervalDays: number;
  reps: number;
  lapses: number;
}

function review(state: SrsState, rating: Rating, now: number): SrsState & { dueAt: number };
```

**Rules:**

- **Again (1)** — `reps = 0`, `intervalDays = 0` (re-show in same session), `lapses += 1`, `ease = max(1.3, ease - 0.2)`
- **Hard (3)** — `intervalDays = max(1, round(intervalDays * 1.2))`, `ease = max(1.3, ease - 0.15)`, `reps += 1`
- **Good (4)** — graduating steps: `reps 0 → 1d`, `reps 1 → 6d`, else `round(intervalDays * ease)`. `ease` unchanged. `reps += 1`
- **Easy (5)** — same as Good but `intervalDays *= 1.3` and `ease += 0.15`. `reps += 1`
- `dueAt = now + intervalDays * 86_400_000`

Initial state for a never-seen card: `{ ease: 2.5, intervalDays: 0, reps: 0, lapses: 0 }`.

### Scheduler

```ts
// lib/srs/scheduler.ts
getDueCards(now: number, limit?: number): Promise<{ card: Card; state: SrsState }[]>
getNewCardsForChapter(chapterId: string, limit: number): Promise<Card[]>
```

- **Due query:** `db.cardProgress.where('dueAt').belowOrEqual(now).limit(N)` — single indexed lookup, fast even with thousands of cards.
- **New cards:** any card without a `CardProgress` row. Surfaced when the user opens a chapter's flashcards for the first time, or when the Today screen runs low on due cards.
- **Daily new-card budget** (default 20, configurable via `Setting`) — without this, completing a chapter dumps hundreds of new cards into tomorrow's queue and the SRS implodes.

## UI Shell

```
┌────────────────────────────────────────┐
│  ▁▂▃▄ECG line▄▃▂▁                      │  ← preserved animated header
│  EMT STUDY GUIDE          ⚙            │
├────────────────────────────────────────┤
│                                        │
│           [route content]              │
│                                        │
├────────────────────────────────────────┤
│   📅          📚         📊            │
│  Today      Browse     Stats           │  ← fixed bottom tab bar
└────────────────────────────────────────┘
```

- **ECG header preserved** as `<ECGHeader>` — same SVG animation, same cyan accent, lifted from current `index.html` lines 49–72.
- **Bottom nav** replaces the desktop sidebar / mobile sheet picker. Three tabs: Today, Browse, Stats. Settings lives behind the gear in the header.
- CSS variables (the whole `:root` block from current `index.html`) move to `src/lib/styles/theme.css` unchanged. Same dark+cyan palette, same `--radius`, same typography (Inter + JetBrains Mono).
- **Mobile-first.** Layout assumes phone width, scales up to tablet. No desktop sidebar.

### Screen inventory

| Route | Purpose |
|---|---|
| `/` | Today — "N cards due" hero, Start Review button, streak, recent activity |
| `/review` | SRS session — flashcard at a time, four rating buttons |
| `/browse` | 12 parts → 46 chapters list with progress rings |
| `/chapter/[id]` | Chapter home — segmented control: Flashcards / Notes / Quiz |
| `/chapter/[id]/flashcards` | Sequential walk-through of chapter's cards (ratings feed SRS) |
| `/chapter/[id]/notes` | Structured notes (title / body / terms) |
| `/chapter/[id]/quiz` | Multiple-choice quiz, scored, attempts logged |
| `/stats` | Heatmap, mastery counts, per-chapter quiz accuracy, streak |
| `/settings` | Daily new-card budget, export JSON, import JSON, reset progress |

### Review flow

```
After tap to reveal:

┌───────────────────────────────────────┐
│   [Card front: question]              │
│   ─────────────────                   │
│   [Card back: answer]                 │
│                                       │
│  Again   Hard   Good   Easy           │
│  <1d    1.2d   6d    7.8d             │
└───────────────────────────────────────┘
```

Each button shows the **resulting next interval** so the user can see what their rating costs/buys — Anki's UX detail that makes SRS feel honest. Tap → write `CardProgress` + append `ReviewLog` row → animate to next card. Empty queue → "Done! N reviewed. Come back tomorrow."

**Chapter flashcards mode is different.** From a chapter screen, "Study flashcards" walks every card in the chapter sequentially (the current UX), but ratings still feed SRS — so casual study primes the review queue naturally.

**Quiz scoring is independent of SRS.** Quiz attempts go in `QuizAttempt`; they don't reschedule cards. Quiz is for self-testing chapter mastery, separate from long-term retention.

## PWA Configuration

`vite.config.ts` via `@vite-pwa/sveltekit`:

- `registerType: 'autoUpdate'` — new versions take effect on next launch
- **Precache:** all built JS/CSS + all chapter content (it's bundled TS, so it lives in JS chunks Workbox precaches automatically)
- **Runtime cache:** not used — there are no network calls at runtime
- **Manifest:** `name: "EMT Study Guide"`, `short_name: "EMT Study"`, `theme_color: "#0d1117"`, `background_color: "#0d1117"`, `display: "standalone"`, `start_url: "/"`, icons (192, 512, maskable 512, apple-touch-180)
- **iOS-specific meta** in `app.html`: `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `apple-touch-icon`. iOS "Add to Home Screen" doesn't read the manifest fully — these tags matter.

## Deployment

Railway, same URL:

- `npm run build` → `adapter-static` writes `build/`
- Start command: `npx serve build -l ${PORT:-8080} -s` (the `-s` flag enables SPA fallback to `index.html` for client routes)
- `serve@^14` is already in `package.json`
- Delete `server.js` — no longer needed
- Update `railway.toml` `startCommand` and `Procfile` to match

## Error Handling

Thin and at boundaries only:

- **IndexedDB unavailable** (private browsing in some browsers): root layout shows an "EMT Study Guide requires IndexedDB" screen. **No silent fallback to in-memory state** — that would invisibly lose progress.
- **Service-worker registration failure:** app still works online, no banner needed.
- **Internal calls trust their callers** — `review()` won't get invalid ratings because the UI only emits the four valid values.

## Testing

- **Vitest unit tests for `lib/srs/sm2.ts`** — pure functions, ~15 cases covering each rating × each rep-state combo. Cheap and high-value.
- **Vitest for `lib/srs/scheduler.ts`** against `fake-indexeddb`.
- **Playwright E2E** for the one flow that matters: open app cold → see today's queue → review N cards → reload → progress persisted → due dates respected.
- **No tests for presentational components** — they break with every CSS tweak and tell you nothing useful.

## Migration Plan (Content)

The existing `DATA` and `PARTS` constants in `index.html` need to be split into per-chapter TS files with stable IDs added. This is mechanical:

1. Extract `PARTS` → `lib/content/parts.ts` (rename `"Ch 1"` → `"ch-01"`).
2. For each chapter `n` in `DATA`, write `lib/content/chapters/ch-NN.ts` with:
   - Each `cards[i]` getting `id: "ch-NN.fc.II"` (II = index padded to 2 digits)
   - Each `notes[i]` getting `id: "ch-NN.n.II"`
   - Each `quiz[i]` getting `id: "ch-NN.q.II"`
3. `lib/content/index.ts` re-exports the aggregated chapter map.

A one-shot Node script can do this transform; it's not a recurring tool.
