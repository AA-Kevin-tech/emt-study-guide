# EMT Study Guide PWA Rewrite — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single-file `index.html` study guide with a SvelteKit + TypeScript PWA: installable, offline-first, SM-2 spaced repetition, mobile-app shell, deployable to Railway as static files, ready to be wrapped with Capacitor later.

**Architecture:** SvelteKit (`adapter-static`) emits a precacheable static build. All study content is bundled TypeScript. All user progress lives in IndexedDB (Dexie) with stable IDs + sync metadata so a future server can reconcile. SRS algorithm is pure functions (testable without DOM or DB). UI is mobile-first with an app shell (preserved ECG header + new bottom tab nav).

**Tech Stack:** SvelteKit 2, Svelte 5, TypeScript, Vite, `@vite-pwa/sveltekit`, Dexie 4, Vitest, `fake-indexeddb`, Playwright, `serve` for Railway static hosting.

**Reference spec:** `docs/superpowers/specs/2026-06-17-emt-pwa-rewrite-design.md`

---

## Phase A — Scaffold

### Task 1: Preserve the legacy app and scaffold SvelteKit

**Files:**
- Create: `legacy/index.html` (moved from project root)
- Create: `legacy/server.js`, `legacy/package.json.bak` (the old ones)
- Create: SvelteKit project files (via `npm create svelte`)

We can't run `npm create svelte` over an existing populated repo; it refuses. Move the old app aside first so we can compare against it during the migration, then scaffold fresh.

- [ ] **Step 1: Move legacy files into `legacy/`**

```powershell
New-Item -ItemType Directory legacy -Force
Move-Item index.html, server.js legacy/
Move-Item package.json legacy/package.json.bak
Move-Item package-lock.json legacy/package-lock.json.bak
Remove-Item -Recurse -Force node_modules
```

Keep `railway.toml`, `Procfile`, `README.md`, `.gitignore`, and `docs/` in place — they get updated, not deleted.

- [ ] **Step 2: Scaffold SvelteKit**

Run:
```powershell
npm create svelte@latest .
```

Choose:
- "Skeleton project"
- "Yes, using TypeScript syntax"
- Add: ESLint, Prettier, Playwright, Vitest
- No to anything else

If the command asks about the non-empty directory, confirm continue.

- [ ] **Step 3: Verify scaffold**

Run:
```powershell
npm install
npm run check
```

Expected: dependency install succeeds, `svelte-check` reports 0 errors, 0 warnings.

- [ ] **Step 4: Commit**

```powershell
git add -A
git commit -m "chore: archive legacy single-file app; scaffold SvelteKit+TS"
```

---

### Task 2: Install runtime + dev dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install runtime deps**

```powershell
npm install dexie@^4 serve@^14
npm install -D @vite-pwa/sveltekit@^0.6 @sveltejs/adapter-static@^3 fake-indexeddb@^6 vite-plugin-pwa@^0.20 workbox-window@^7
```

- [ ] **Step 2: Verify install**

Run: `npm ls --depth=0`
Expected: all listed packages resolve, no `UNMET DEPENDENCY` lines.

- [ ] **Step 3: Commit**

```powershell
git add package.json package-lock.json
git commit -m "chore: add dexie, vite-pwa, adapter-static, fake-indexeddb"
```

---

### Task 3: Configure adapter-static, app.html, PWA basics

**Files:**
- Modify: `svelte.config.js`
- Modify: `src/app.html`
- Modify: `vite.config.ts`

- [ ] **Step 1: Configure `adapter-static`**

Replace `svelte.config.js` with:

```js
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html',     // SPA fallback for client-side routes
      precompress: false,
      strict: true,
    }),
    prerender: { entries: [] },    // no SSR; everything is client-rendered
  },
};

export default config;
```

- [ ] **Step 2: Update `src/app.html` with PWA meta**

Replace `src/app.html` with:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="theme-color" content="#0d1117" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="EMT Study" />
  <link rel="icon" href="%sveltekit.assets%/favicon.svg" />
  <link rel="apple-touch-icon" href="%sveltekit.assets%/icons/apple-touch-180.png" />
  <title>EMT Study Guide</title>
  %sveltekit.head%
</head>
<body data-sveltekit-preload-data="hover">
  <div style="display: contents">%sveltekit.body%</div>
</body>
</html>
```

- [ ] **Step 3: Configure `vite.config.ts` with vite-pwa**

Replace `vite.config.ts` with:

```ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig({
  plugins: [
    sveltekit(),
    SvelteKitPWA({
      registerType: 'autoUpdate',
      strategies: 'generateSW',
      manifest: {
        name: 'EMT Study Guide',
        short_name: 'EMT Study',
        description: 'Spaced-repetition EMT study app — Brady 11th Edition',
        theme_color: '#0d1117',
        background_color: '#0d1117',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
        navigateFallback: '/',
      },
      devOptions: { enabled: false },
    }),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: build succeeds and produces `build/index.html`.

- [ ] **Step 5: Commit**

```powershell
git add svelte.config.js vite.config.ts src/app.html
git commit -m "feat: configure adapter-static + @vite-pwa/sveltekit"
```

---

### Task 4: Port theme CSS

**Files:**
- Create: `src/lib/styles/theme.css`
- Create: `src/lib/styles/reset.css`
- Modify: `src/routes/+layout.svelte` (create with imports)

- [ ] **Step 1: Create `src/lib/styles/theme.css`**

Lift the `:root` block from `legacy/index.html` (lines ~10–33) plus the `body` font/background rules:

```css
:root {
  --bg:       #0d1117;
  --bg2:      #161b22;
  --bg3:      #1c2330;
  --bg4:      #21262d;
  --border:   #30363d;
  --border2:  #3d444d;
  --cyan:     #39d0d8;
  --cyan-dim: #1a6b70;
  --cyan-bg:  #0d2e30;
  --text:     #e6edf3;
  --text2:    #8b949e;
  --text3:    #484f58;
  --green:    #3fb950;
  --green-bg: #0d2a14;
  --green-bd: #238636;
  --red:      #f85149;
  --red-bg:   #2a1010;
  --red-bd:   #6e2d2d;
  --yellow:   #e3b341;
  --yellow-bg:#2a2010;
  --radius:   8px;
  --radius-lg:12px;
  --tap:      44px;            /* min tap target */
  --nav-h:    64px;            /* bottom-nav height */
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 300 600;
  font-display: swap;
  src: url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
}

html, body {
  background: var(--bg);
  color: var(--text);
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  font-size: 15px;
  line-height: 1.6;
}

body {
  min-height: 100dvh;
  padding-bottom: calc(var(--nav-h) + env(safe-area-inset-bottom));
}
```

- [ ] **Step 2: Create `src/lib/styles/reset.css`**

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
button { font: inherit; background: none; border: none; color: inherit; cursor: pointer; }
a { color: var(--cyan); text-decoration: none; }
a:hover { text-decoration: underline; }
ul, ol { list-style: none; }
img, svg { display: block; max-width: 100%; }
```

- [ ] **Step 3: Create root layout that imports them**

Create `src/routes/+layout.svelte`:

```svelte
<script lang="ts">
  import '$lib/styles/reset.css';
  import '$lib/styles/theme.css';

  let { children } = $props();
</script>

{@render children()}
```

- [ ] **Step 4: Replace default `+page.svelte` with placeholder**

Replace `src/routes/+page.svelte`:

```svelte
<h1>EMT Study Guide</h1>
<p>Scaffolded. Coming up: content, SRS, screens.</p>
```

- [ ] **Step 5: Run dev server, verify dark theme renders**

Run: `npm run dev`
Open `http://localhost:5173`. Expected: dark background (#0d1117), light text, Inter font, "EMT Study Guide" heading.
Stop server.

- [ ] **Step 6: Commit**

```powershell
git add src/lib/styles src/routes/+layout.svelte src/routes/+page.svelte
git commit -m "feat: port dark+cyan theme and layout shell"
```

---

## Phase B — Content Migration

### Task 5: Define content types

**Files:**
- Create: `src/lib/content/types.ts`

- [ ] **Step 1: Write the types**

```ts
// src/lib/content/types.ts

export interface Flashcard {
  id: string;          // 'ch-01.fc.01'
  q: string;
  a: string;
}

export interface Note {
  id: string;          // 'ch-01.n.01'
  title: string;
  body: string;
  terms: string[];
}

export interface QuizQuestion {
  id: string;          // 'ch-01.q.01'
  q: string;
  opts: string[];      // 4 options, prefixed "A. "/"B. "/...
  ans: number;         // 0-indexed correct option
  exp: string;
}

export interface Chapter {
  id: string;          // 'ch-01'
  number: number;      // 1..46
  partId: string;      // 'part-01'
  title: string;
  cards: Flashcard[];
  notes: Note[];
  quiz: QuizQuestion[];
}

export interface Part {
  id: string;          // 'part-01'
  number: number;
  label: string;       // 'Part 1 — Preparatory'
  chapterIds: string[];
}
```

- [ ] **Step 2: Commit**

```powershell
git add src/lib/content/types.ts
git commit -m "feat: define Chapter/Flashcard/Note/QuizQuestion/Part types"
```

---

### Task 6: Write the content-migration script

**Files:**
- Create: `scripts/migrate-content.mjs`

This is a one-shot script. It reads `legacy/index.html`, extracts the `PARTS` and `DATA` literals, and emits `src/lib/content/parts.ts` plus one `src/lib/content/chapters/ch-NN.ts` per chapter, with stable IDs added.

- [ ] **Step 1: Write the script**

Create `scripts/migrate-content.mjs`:

```js
// scripts/migrate-content.mjs
// One-shot migration: parses legacy/index.html, emits per-chapter TS files.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const html = readFileSync(resolve(root, 'legacy/index.html'), 'utf8');

// Extract the two JS literals between known markers.
function sliceBetween(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  if (start === -1) throw new Error(`Marker not found: ${startMarker}`);
  const end = source.indexOf(endMarker, start);
  if (end === -1) throw new Error(`End marker not found: ${endMarker}`);
  return source.slice(start, end);
}

const partsBlock = sliceBetween(html, 'const PARTS =', 'const DATA =');
const dataBlock  = sliceBetween(html, 'const DATA =', '\nlet selKey');

// Evaluate them in a sandboxed function. The source is JS object literals.
function evalLiteral(src, name) {
  const expr = src.replace(`const ${name} =`, '').trim().replace(/;\s*$/, '');
  // eslint-disable-next-line no-new-func
  return new Function(`return (${expr});`)();
}

const PARTS = evalLiteral(partsBlock, 'PARTS');
const DATA  = evalLiteral(dataBlock,  'DATA');

// Chapter key "Ch 1" -> chapter id "ch-01".
function chapterId(chKey) {
  const n = parseInt(chKey.replace(/[^\d]/g, ''), 10);
  return { id: `ch-${String(n).padStart(2, '0')}`, number: n };
}

function pad2(i) { return String(i).padStart(2, '0'); }

// Build parts.ts.
const partsOut = PARTS.map((p, i) => {
  const number = i + 1;
  const id = `part-${pad2(number)}`;
  const chapterIds = p.topics.map(t => chapterId(t.ch).id);
  return { id, number, label: p.label, chapterIds };
});

// chapterId -> partId reverse lookup.
const chapterToPart = new Map();
partsOut.forEach(p => p.chapterIds.forEach(cid => chapterToPart.set(cid, p.id)));

// chapterId -> human title.
const chapterTitles = new Map();
PARTS.forEach(p => p.topics.forEach(t => {
  const { id } = chapterId(t.ch);
  chapterTitles.set(id, t.title);
}));

mkdirSync(resolve(root, 'src/lib/content/chapters'), { recursive: true });

// Emit parts.ts.
const partsTs =
`// AUTO-GENERATED by scripts/migrate-content.mjs. Edit by hand thereafter.
import type { Part } from './types';

export const PARTS: Part[] = ${JSON.stringify(partsOut, null, 2)};
`;
writeFileSync(resolve(root, 'src/lib/content/parts.ts'), partsTs);

// Helper: TS-safe string escape.
function tsString(s) {
  return JSON.stringify(s);
}

// Emit one file per chapter.
const writtenChapters = [];
for (const chKey of Object.keys(DATA)) {
  const { id, number } = chapterId(chKey);
  const partId = chapterToPart.get(id);
  const title = chapterTitles.get(id);
  if (!partId || !title) throw new Error(`Missing index for ${chKey}`);

  const d = DATA[chKey];
  const cards = (d.cards || []).map((c, i) => ({
    id: `${id}.fc.${pad2(i + 1)}`, q: c.q, a: c.a,
  }));
  const notes = (d.notes || []).map((n, i) => ({
    id: `${id}.n.${pad2(i + 1)}`, title: n.title, body: n.body, terms: n.terms || [],
  }));
  const quiz = (d.quiz || []).map((q, i) => ({
    id: `${id}.q.${pad2(i + 1)}`, q: q.q, opts: q.opts, ans: q.ans, exp: q.exp,
  }));

  const chapter = {
    id, number, partId, title, cards, notes, quiz,
  };

  const varName = `ch${pad2(number)}`;
  const ts =
`// AUTO-GENERATED by scripts/migrate-content.mjs. Edit by hand thereafter.
import type { Chapter } from '../types';

export const ${varName}: Chapter = ${JSON.stringify(chapter, null, 2)};
`;
  writeFileSync(resolve(root, `src/lib/content/chapters/ch-${pad2(number)}.ts`), ts);
  writtenChapters.push({ id, number });
}

// Emit aggregator index.ts.
const imports = writtenChapters
  .sort((a, b) => a.number - b.number)
  .map(c => `import { ch${pad2(c.number)} } from './chapters/ch-${pad2(c.number)}';`)
  .join('\n');

const arrItems = writtenChapters
  .sort((a, b) => a.number - b.number)
  .map(c => `ch${pad2(c.number)}`)
  .join(', ');

const indexTs =
`// AUTO-GENERATED by scripts/migrate-content.mjs. Edit by hand thereafter.
import type { Chapter } from './types';
${imports}

export const CHAPTERS: Chapter[] = [${arrItems}];

const byId = new Map(CHAPTERS.map(c => [c.id, c]));

export function getChapter(id: string): Chapter | undefined {
  return byId.get(id);
}

export function getAllCards() {
  return CHAPTERS.flatMap(ch => ch.cards.map(card => ({ chapterId: ch.id, card })));
}
`;
writeFileSync(resolve(root, 'src/lib/content/index.ts'), indexTs);

console.log(`Wrote parts.ts (${partsOut.length} parts) and ${writtenChapters.length} chapter files.`);
```

- [ ] **Step 2: Commit the script**

```powershell
git add scripts/migrate-content.mjs
git commit -m "feat: add one-shot content migration script"
```

---

### Task 7: Run migration and verify

**Files:** (generated by script — Task 6)
- Create: `src/lib/content/parts.ts`
- Create: `src/lib/content/chapters/ch-01.ts` … `ch-46.ts`
- Create: `src/lib/content/index.ts`

- [ ] **Step 1: Run the script**

```powershell
node scripts/migrate-content.mjs
```

Expected: `Wrote parts.ts (12 parts) and 46 chapter files.`

- [ ] **Step 2: Type-check the generated content**

```powershell
npm run check
```

Expected: 0 errors, 0 warnings.

- [ ] **Step 3: Spot-check a chapter file**

Open `src/lib/content/chapters/ch-01.ts`. Verify:
- `id: "ch-01"`, `number: 1`, `partId: "part-01"`
- `cards` has stable IDs like `"ch-01.fc.01"`
- `notes`, `quiz` likewise

- [ ] **Step 4: Commit the generated content**

```powershell
git add src/lib/content
git commit -m "feat: migrate 46 chapters into typed per-file content modules"
```

---

### Task 8: Content shape sanity test

**Files:**
- Create: `src/lib/content/content.test.ts`

- [ ] **Step 1: Write the test**

```ts
// src/lib/content/content.test.ts
import { describe, it, expect } from 'vitest';
import { CHAPTERS, getChapter } from './index';
import { PARTS } from './parts';

describe('content', () => {
  it('has 46 chapters and 12 parts', () => {
    expect(CHAPTERS.length).toBe(46);
    expect(PARTS.length).toBe(12);
  });

  it('every chapter has at least one card, note, and quiz question', () => {
    for (const ch of CHAPTERS) {
      expect(ch.cards.length, `${ch.id} cards`).toBeGreaterThan(0);
      expect(ch.notes.length, `${ch.id} notes`).toBeGreaterThan(0);
      expect(ch.quiz.length, `${ch.id} quiz`).toBeGreaterThan(0);
    }
  });

  it('every flashcard, note, and quiz id is unique and follows the pattern', () => {
    const ids = new Set<string>();
    for (const ch of CHAPTERS) {
      for (const c of ch.cards) {
        expect(c.id).toMatch(/^ch-\d{2}\.fc\.\d{2}$/);
        expect(ids.has(c.id)).toBe(false);
        ids.add(c.id);
      }
      for (const n of ch.notes) {
        expect(n.id).toMatch(/^ch-\d{2}\.n\.\d{2}$/);
        ids.add(n.id);
      }
      for (const q of ch.quiz) {
        expect(q.id).toMatch(/^ch-\d{2}\.q\.\d{2}$/);
        expect(q.ans).toBeGreaterThanOrEqual(0);
        expect(q.ans).toBeLessThan(q.opts.length);
        ids.add(q.id);
      }
    }
  });

  it('every part references existing chapters', () => {
    for (const p of PARTS) {
      for (const cid of p.chapterIds) {
        expect(getChapter(cid), `${p.id} -> ${cid}`).toBeDefined();
      }
    }
  });
});
```

- [ ] **Step 2: Run the test**

```powershell
npm run test -- --run
```

Expected: all 4 specs pass.

- [ ] **Step 3: Commit**

```powershell
git add src/lib/content/content.test.ts
git commit -m "test: content shape and ID invariants"
```

---

## Phase C — SRS Algorithm (TDD)

### Task 9: SM-2 algorithm — types + first failing test

**Files:**
- Create: `src/lib/srs/sm2.ts`
- Create: `src/lib/srs/sm2.test.ts`

- [ ] **Step 1: Stub `sm2.ts` so types resolve**

```ts
// src/lib/srs/sm2.ts
export type Rating = 1 | 3 | 4 | 5;  // Again | Hard | Good | Easy

export interface SrsState {
  ease: number;
  intervalDays: number;
  reps: number;
  lapses: number;
}

export interface ReviewResult extends SrsState {
  dueAt: number;
}

export const INITIAL_STATE: SrsState = {
  ease: 2.5,
  intervalDays: 0,
  reps: 0,
  lapses: 0,
};

export function review(_state: SrsState, _rating: Rating, _now: number): ReviewResult {
  throw new Error('not implemented');
}

export function nextIntervalPreview(_state: SrsState, _rating: Rating): number {
  throw new Error('not implemented');
}
```

- [ ] **Step 2: Write the failing tests**

```ts
// src/lib/srs/sm2.test.ts
import { describe, it, expect } from 'vitest';
import { review, nextIntervalPreview, INITIAL_STATE } from './sm2';

const NOW = 1_700_000_000_000;
const DAY = 86_400_000;

describe('SM-2 review()', () => {
  it('new card + Good graduates to 1 day', () => {
    const r = review(INITIAL_STATE, 4, NOW);
    expect(r.intervalDays).toBe(1);
    expect(r.reps).toBe(1);
    expect(r.ease).toBe(2.5);
    expect(r.dueAt).toBe(NOW + 1 * DAY);
  });

  it('reps=1 + Good moves to 6 days', () => {
    const s = { ease: 2.5, intervalDays: 1, reps: 1, lapses: 0 };
    const r = review(s, 4, NOW);
    expect(r.intervalDays).toBe(6);
    expect(r.reps).toBe(2);
  });

  it('reps>=2 + Good multiplies by ease', () => {
    const s = { ease: 2.5, intervalDays: 6, reps: 2, lapses: 0 };
    const r = review(s, 4, NOW);
    expect(r.intervalDays).toBe(15);   // round(6 * 2.5)
    expect(r.reps).toBe(3);
    expect(r.ease).toBe(2.5);
  });

  it('Easy adds 0.15 to ease and 30% to interval', () => {
    const s = { ease: 2.5, intervalDays: 6, reps: 2, lapses: 0 };
    const r = review(s, 5, NOW);
    expect(r.ease).toBeCloseTo(2.65, 5);
    expect(r.intervalDays).toBe(20);   // round(6 * 2.5 * 1.3)
  });

  it('Hard subtracts 0.15 from ease, interval *1.2', () => {
    const s = { ease: 2.5, intervalDays: 10, reps: 3, lapses: 0 };
    const r = review(s, 3, NOW);
    expect(r.ease).toBeCloseTo(2.35, 5);
    expect(r.intervalDays).toBe(12);   // round(10 * 1.2)
    expect(r.reps).toBe(4);
  });

  it('Again resets reps and interval, increments lapses, lowers ease', () => {
    const s = { ease: 2.5, intervalDays: 20, reps: 4, lapses: 0 };
    const r = review(s, 1, NOW);
    expect(r.reps).toBe(0);
    expect(r.intervalDays).toBe(0);
    expect(r.lapses).toBe(1);
    expect(r.ease).toBeCloseTo(2.3, 5);
    expect(r.dueAt).toBe(NOW);    // due immediately within the session
  });

  it('ease floors at 1.3', () => {
    const s = { ease: 1.35, intervalDays: 10, reps: 3, lapses: 0 };
    const r = review(s, 1, NOW);
    expect(r.ease).toBe(1.3);
  });

  it('Hard never reduces interval below 1', () => {
    const s = { ...INITIAL_STATE };
    const r = review(s, 3, NOW);
    expect(r.intervalDays).toBeGreaterThanOrEqual(1);
  });
});

describe('SM-2 nextIntervalPreview()', () => {
  it('returns interval that review() would set for each rating', () => {
    const s = { ease: 2.5, intervalDays: 6, reps: 2, lapses: 0 };
    for (const rating of [1, 3, 4, 5] as const) {
      expect(nextIntervalPreview(s, rating)).toBe(review(s, rating, NOW).intervalDays);
    }
  });
});
```

- [ ] **Step 3: Run tests — expect failure**

```powershell
npm run test -- --run src/lib/srs/sm2.test.ts
```

Expected: every spec fails with `Error: not implemented`.

- [ ] **Step 4: Commit failing test scaffold**

```powershell
git add src/lib/srs/sm2.ts src/lib/srs/sm2.test.ts
git commit -m "test: SM-2 algorithm specs (failing)"
```

---

### Task 10: SM-2 algorithm — implementation

**Files:**
- Modify: `src/lib/srs/sm2.ts`

- [ ] **Step 1: Replace `sm2.ts` with the implementation**

```ts
// src/lib/srs/sm2.ts
export type Rating = 1 | 3 | 4 | 5;  // Again | Hard | Good | Easy

export interface SrsState {
  ease: number;
  intervalDays: number;
  reps: number;
  lapses: number;
}

export interface ReviewResult extends SrsState {
  dueAt: number;
}

export const INITIAL_STATE: SrsState = {
  ease: 2.5,
  intervalDays: 0,
  reps: 0,
  lapses: 0,
};

const DAY_MS = 86_400_000;
const EASE_FLOOR = 1.3;

function clampEase(e: number): number {
  return Math.max(EASE_FLOOR, e);
}

function computeInterval(state: SrsState, rating: Rating): { intervalDays: number; ease: number; reps: number; lapses: number } {
  let { ease, intervalDays, reps, lapses } = state;

  if (rating === 1) {
    return { intervalDays: 0, ease: clampEase(ease - 0.2), reps: 0, lapses: lapses + 1 };
  }

  if (rating === 3) {
    ease = clampEase(ease - 0.15);
    intervalDays = Math.max(1, Math.round((intervalDays || 1) * 1.2));
    return { intervalDays, ease, reps: reps + 1, lapses };
  }

  if (rating === 4) {
    if (reps === 0) intervalDays = 1;
    else if (reps === 1) intervalDays = 6;
    else intervalDays = Math.round(intervalDays * ease);
    return { intervalDays, ease, reps: reps + 1, lapses };
  }

  // rating === 5 (Easy)
  ease = clampEase(ease + 0.15);
  if (reps === 0) intervalDays = 1;
  else if (reps === 1) intervalDays = 6;
  else intervalDays = Math.round(intervalDays * ease);
  intervalDays = Math.round(intervalDays * 1.3);
  return { intervalDays, ease, reps: reps + 1, lapses };
}

export function review(state: SrsState, rating: Rating, now: number): ReviewResult {
  const next = computeInterval(state, rating);
  return { ...next, dueAt: now + next.intervalDays * DAY_MS };
}

export function nextIntervalPreview(state: SrsState, rating: Rating): number {
  return computeInterval(state, rating).intervalDays;
}
```

- [ ] **Step 2: Run tests — expect green**

```powershell
npm run test -- --run src/lib/srs/sm2.test.ts
```

Expected: all specs pass.

- [ ] **Step 3: Commit**

```powershell
git add src/lib/srs/sm2.ts
git commit -m "feat: implement SM-2 spaced repetition algorithm"
```

---

## Phase D — Database

### Task 11: Dexie schema

**Files:**
- Create: `src/lib/db/schema.ts`
- Create: `src/lib/db/types.ts`

- [ ] **Step 1: Write types**

```ts
// src/lib/db/types.ts
export interface CardProgress {
  cardId: string;
  ease: number;
  intervalDays: number;
  reps: number;
  lapses: number;
  dueAt: number;
  lastReviewedAt: number;
  updatedAt: number;
  version: number;
}

export interface QuizAttempt {
  id: string;
  chapterId: string;
  questionId: string;
  selected: number;
  correct: boolean;
  takenAt: number;
  updatedAt: number;
  version: number;
}

export interface ChapterVisit {
  chapterId: string;
  notesRead: string[];
  lastVisitedAt: number;
  updatedAt: number;
  version: number;
}

export interface ReviewLogEntry {
  id: string;
  cardId: string;
  rating: 1 | 3 | 4 | 5;
  reviewedAt: number;
}

export interface SettingRow {
  key: string;
  value: unknown;
}
```

- [ ] **Step 2: Write Dexie schema**

```ts
// src/lib/db/schema.ts
import Dexie, { type Table } from 'dexie';
import type {
  CardProgress, QuizAttempt, ChapterVisit, ReviewLogEntry, SettingRow,
} from './types';

export class StudyDB extends Dexie {
  cardProgress!: Table<CardProgress, string>;
  quizAttempts!: Table<QuizAttempt, string>;
  chapterVisits!: Table<ChapterVisit, string>;
  reviewLog!: Table<ReviewLogEntry, string>;
  settings!: Table<SettingRow, string>;

  constructor() {
    super('emt-study');
    this.version(1).stores({
      cardProgress:  '&cardId, dueAt',
      quizAttempts:  '&id, chapterId, questionId, takenAt',
      chapterVisits: '&chapterId, lastVisitedAt',
      reviewLog:     '&id, reviewedAt, cardId',
      settings:      '&key',
    });
  }
}

let _db: StudyDB | null = null;

export function db(): StudyDB {
  if (!_db) _db = new StudyDB();
  return _db;
}

/** For tests: inject a clean DB. */
export function _setDb(d: StudyDB) { _db = d; }
```

- [ ] **Step 3: Verify it compiles**

```powershell
npm run check
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```powershell
git add src/lib/db/schema.ts src/lib/db/types.ts
git commit -m "feat: Dexie schema for card progress, quiz attempts, review log, settings"
```

---

### Task 12: Card progress CRUD + test

**Files:**
- Create: `src/lib/db/cards.ts`
- Create: `src/lib/db/cards.test.ts`
- Create: `vitest.setup.ts`
- Modify: `vite.config.ts`

- [ ] **Step 1: Add fake-indexeddb setup**

Create `vitest.setup.ts`:

```ts
import 'fake-indexeddb/auto';
```

Update `vite.config.ts` test section:

```ts
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    setupFiles: ['./vitest.setup.ts'],
  },
```

- [ ] **Step 2: Write `cards.ts`**

```ts
// src/lib/db/cards.ts
import { db } from './schema';
import type { CardProgress } from './types';
import { review, INITIAL_STATE, type Rating } from '$lib/srs/sm2';

export async function getCardProgress(cardId: string): Promise<CardProgress | undefined> {
  return db().cardProgress.get(cardId);
}

export async function recordReview(cardId: string, rating: Rating, now: number = Date.now()): Promise<CardProgress> {
  const existing = await db().cardProgress.get(cardId);
  const prev = existing ?? { ...INITIAL_STATE, cardId, lastReviewedAt: 0, updatedAt: 0, version: 0, dueAt: 0 };

  const result = review(
    { ease: prev.ease, intervalDays: prev.intervalDays, reps: prev.reps, lapses: prev.lapses },
    rating,
    now,
  );

  const next: CardProgress = {
    cardId,
    ease: result.ease,
    intervalDays: result.intervalDays,
    reps: result.reps,
    lapses: result.lapses,
    dueAt: result.dueAt,
    lastReviewedAt: now,
    updatedAt: now,
    version: prev.version + 1,
  };

  await db().cardProgress.put(next);
  await db().reviewLog.add({
    id: crypto.randomUUID(),
    cardId,
    rating,
    reviewedAt: now,
  });

  return next;
}

export async function resetAllProgress(): Promise<void> {
  await db().transaction('rw', [db().cardProgress, db().reviewLog, db().quizAttempts, db().chapterVisits], async () => {
    await db().cardProgress.clear();
    await db().reviewLog.clear();
    await db().quizAttempts.clear();
    await db().chapterVisits.clear();
  });
}
```

- [ ] **Step 3: Write the test**

```ts
// src/lib/db/cards.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { StudyDB, _setDb } from './schema';
import { getCardProgress, recordReview } from './cards';

let fresh: StudyDB;

beforeEach(async () => {
  await indexedDB.deleteDatabase('emt-study');
  fresh = new StudyDB();
  _setDb(fresh);
});

describe('card progress CRUD', () => {
  it('returns undefined for unseen card', async () => {
    expect(await getCardProgress('ch-01.fc.01')).toBeUndefined();
  });

  it('recordReview with Good creates progress at interval 1', async () => {
    const now = 1_700_000_000_000;
    const r = await recordReview('ch-01.fc.01', 4, now);
    expect(r.intervalDays).toBe(1);
    expect(r.reps).toBe(1);
    expect(r.dueAt).toBe(now + 86_400_000);
    expect(r.version).toBe(1);
  });

  it('subsequent Good advances interval and version', async () => {
    const t0 = 1_700_000_000_000;
    await recordReview('ch-01.fc.01', 4, t0);
    const r2 = await recordReview('ch-01.fc.01', 4, t0 + 86_400_000);
    expect(r2.reps).toBe(2);
    expect(r2.intervalDays).toBe(6);
    expect(r2.version).toBe(2);
  });

  it('records a row per review in reviewLog', async () => {
    await recordReview('ch-01.fc.01', 4, 1);
    await recordReview('ch-01.fc.01', 4, 2);
    const log = await fresh.reviewLog.toArray();
    expect(log.length).toBe(2);
    expect(log.every(e => e.cardId === 'ch-01.fc.01')).toBe(true);
  });
});
```

- [ ] **Step 4: Run tests**

```powershell
npm run test -- --run src/lib/db/cards.test.ts
```

Expected: all 4 specs pass.

- [ ] **Step 5: Commit**

```powershell
git add src/lib/db src/lib/srs vitest.setup.ts vite.config.ts
git commit -m "feat: card progress CRUD with review-log on top of Dexie + fake-indexeddb tests"
```

---

### Task 13: Quiz attempts CRUD

**Files:**
- Create: `src/lib/db/quiz.ts`
- Create: `src/lib/db/quiz.test.ts`

- [ ] **Step 1: Write `quiz.ts`**

```ts
// src/lib/db/quiz.ts
import { db } from './schema';
import type { QuizAttempt } from './types';

export async function recordQuizAttempt(args: {
  chapterId: string;
  questionId: string;
  selected: number;
  correct: boolean;
  takenAt?: number;
}): Promise<QuizAttempt> {
  const now = args.takenAt ?? Date.now();
  const row: QuizAttempt = {
    id: crypto.randomUUID(),
    chapterId: args.chapterId,
    questionId: args.questionId,
    selected: args.selected,
    correct: args.correct,
    takenAt: now,
    updatedAt: now,
    version: 1,
  };
  await db().quizAttempts.add(row);
  return row;
}

export async function getQuizAttemptsForChapter(chapterId: string): Promise<QuizAttempt[]> {
  return db().quizAttempts.where('chapterId').equals(chapterId).toArray();
}

export interface ChapterQuizSummary {
  attempts: number;
  correct: number;
  accuracy: number; // 0..1
  lastTakenAt: number | null;
}

export async function getChapterQuizSummary(chapterId: string): Promise<ChapterQuizSummary> {
  const all = await getQuizAttemptsForChapter(chapterId);
  if (all.length === 0) return { attempts: 0, correct: 0, accuracy: 0, lastTakenAt: null };
  const correct = all.filter(a => a.correct).length;
  return {
    attempts: all.length,
    correct,
    accuracy: correct / all.length,
    lastTakenAt: Math.max(...all.map(a => a.takenAt)),
  };
}
```

- [ ] **Step 2: Write the test**

```ts
// src/lib/db/quiz.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { StudyDB, _setDb } from './schema';
import { recordQuizAttempt, getChapterQuizSummary } from './quiz';

beforeEach(async () => {
  await indexedDB.deleteDatabase('emt-study');
  _setDb(new StudyDB());
});

describe('quiz CRUD', () => {
  it('empty summary for unseen chapter', async () => {
    const s = await getChapterQuizSummary('ch-01');
    expect(s).toEqual({ attempts: 0, correct: 0, accuracy: 0, lastTakenAt: null });
  });

  it('accumulates attempts and accuracy', async () => {
    await recordQuizAttempt({ chapterId: 'ch-01', questionId: 'ch-01.q.01', selected: 1, correct: true,  takenAt: 100 });
    await recordQuizAttempt({ chapterId: 'ch-01', questionId: 'ch-01.q.02', selected: 0, correct: false, takenAt: 200 });
    const s = await getChapterQuizSummary('ch-01');
    expect(s.attempts).toBe(2);
    expect(s.correct).toBe(1);
    expect(s.accuracy).toBe(0.5);
    expect(s.lastTakenAt).toBe(200);
  });
});
```

- [ ] **Step 3: Run tests**

```powershell
npm run test -- --run src/lib/db/quiz.test.ts
```

Expected: both specs pass.

- [ ] **Step 4: Commit**

```powershell
git add src/lib/db/quiz.ts src/lib/db/quiz.test.ts
git commit -m "feat: quiz attempt persistence + per-chapter summary"
```

---

### Task 14: Settings + chapter visits CRUD

**Files:**
- Create: `src/lib/db/settings.ts`
- Create: `src/lib/db/chapter-visits.ts`

- [ ] **Step 1: Write `settings.ts`**

```ts
// src/lib/db/settings.ts
import { db } from './schema';

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const row = await db().settings.get(key);
  return row ? (row.value as T) : fallback;
}

export async function setSetting<T>(key: string, value: T): Promise<void> {
  await db().settings.put({ key, value });
}

export const DEFAULTS = {
  dailyNewCardBudget: 20,
} as const;
```

- [ ] **Step 2: Write `chapter-visits.ts`**

```ts
// src/lib/db/chapter-visits.ts
import { db } from './schema';
import type { ChapterVisit } from './types';

export async function recordChapterVisit(chapterId: string, now: number = Date.now()): Promise<void> {
  const existing = await db().chapterVisits.get(chapterId);
  await db().chapterVisits.put({
    chapterId,
    notesRead: existing?.notesRead ?? [],
    lastVisitedAt: now,
    updatedAt: now,
    version: (existing?.version ?? 0) + 1,
  });
}

export async function markNoteRead(chapterId: string, noteId: string, now: number = Date.now()): Promise<void> {
  const existing = await db().chapterVisits.get(chapterId);
  const notesRead = new Set(existing?.notesRead ?? []);
  notesRead.add(noteId);
  await db().chapterVisits.put({
    chapterId,
    notesRead: [...notesRead],
    lastVisitedAt: now,
    updatedAt: now,
    version: (existing?.version ?? 0) + 1,
  });
}

export async function getChapterVisit(chapterId: string): Promise<ChapterVisit | undefined> {
  return db().chapterVisits.get(chapterId);
}
```

- [ ] **Step 3: Type-check**

```powershell
npm run check
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```powershell
git add src/lib/db/settings.ts src/lib/db/chapter-visits.ts
git commit -m "feat: settings + chapter-visit CRUD"
```

---

## Phase E — Scheduler

### Task 15: SRS scheduler (TDD)

**Files:**
- Create: `src/lib/srs/scheduler.ts`
- Create: `src/lib/srs/scheduler.test.ts`

- [ ] **Step 1: Stub `scheduler.ts`**

```ts
// src/lib/srs/scheduler.ts
import { db } from '$lib/db/schema';
import type { Flashcard } from '$lib/content/types';
import { getAllCards } from '$lib/content';
import type { CardProgress } from '$lib/db/types';

export interface DueCard {
  card: Flashcard;
  chapterId: string;
  progress: CardProgress;
}

export async function countDue(now: number = Date.now()): Promise<number> {
  return db().cardProgress.where('dueAt').belowOrEqual(now).count();
}

export async function getDueCards(now: number = Date.now(), limit?: number): Promise<DueCard[]> {
  const collection = db().cardProgress.where('dueAt').belowOrEqual(now);
  const rows = limit !== undefined
    ? await collection.limit(limit).toArray()
    : await collection.toArray();

  const idToCard = new Map<string, { card: Flashcard; chapterId: string }>();
  for (const { chapterId, card } of getAllCards()) idToCard.set(card.id, { card, chapterId });

  return rows.flatMap(p => {
    const c = idToCard.get(p.cardId);
    return c ? [{ card: c.card, chapterId: c.chapterId, progress: p }] : [];
  });
}

export async function getNewCardsForChapter(chapterId: string, limit: number): Promise<Flashcard[]> {
  const seenIds = new Set((await db().cardProgress.toArray()).map(p => p.cardId));
  const chapterCards = getAllCards().filter(c => c.chapterId === chapterId).map(c => c.card);
  const unseen = chapterCards.filter(c => !seenIds.has(c.id));
  return unseen.slice(0, limit);
}
```

- [ ] **Step 2: Write the test**

```ts
// src/lib/srs/scheduler.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { StudyDB, _setDb } from '$lib/db/schema';
import { recordReview } from '$lib/db/cards';
import { countDue, getDueCards, getNewCardsForChapter } from './scheduler';

const T0 = 1_700_000_000_000;
const DAY = 86_400_000;

beforeEach(async () => {
  await indexedDB.deleteDatabase('emt-study');
  _setDb(new StudyDB());
});

describe('scheduler', () => {
  it('countDue is 0 when no cards have progress', async () => {
    expect(await countDue(T0)).toBe(0);
  });

  it('counts cards whose dueAt <= now', async () => {
    await recordReview('ch-01.fc.01', 4, T0);            // due T0 + 1d
    await recordReview('ch-01.fc.02', 1, T0);            // due T0 (Again)
    expect(await countDue(T0)).toBe(1);
    expect(await countDue(T0 + 2 * DAY)).toBe(2);
  });

  it('getDueCards joins to content', async () => {
    await recordReview('ch-01.fc.01', 1, T0);
    const due = await getDueCards(T0);
    expect(due.length).toBe(1);
    expect(due[0].card.id).toBe('ch-01.fc.01');
    expect(due[0].chapterId).toBe('ch-01');
  });

  it('getNewCardsForChapter excludes seen cards', async () => {
    await recordReview('ch-01.fc.01', 4, T0);
    const newCards = await getNewCardsForChapter('ch-01', 100);
    expect(newCards.find(c => c.id === 'ch-01.fc.01')).toBeUndefined();
    expect(newCards.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 3: Run tests**

```powershell
npm run test -- --run src/lib/srs/scheduler.test.ts
```

Expected: all 4 specs pass.

- [ ] **Step 4: Commit**

```powershell
git add src/lib/srs/scheduler.ts src/lib/srs/scheduler.test.ts
git commit -m "feat: SRS scheduler — due query, content join, new-card selection"
```

---

## Phase F — App Shell

### Task 16: ECG header component

**Files:**
- Create: `src/lib/components/ECGHeader.svelte`

- [ ] **Step 1: Port the ECG header**

Reuse the SVG / animation from `legacy/index.html` lines 49–72. Approximate port:

```svelte
<!-- src/lib/components/ECGHeader.svelte -->
<header>
  <div class="ecg-line">
    <svg viewBox="0 0 400 20" preserveAspectRatio="none" aria-hidden="true">
      <polyline
        points="0,10 60,10 70,2 80,18 90,4 100,10 200,10 260,10 270,2 280,18 290,4 300,10 400,10"
        fill="none" stroke="var(--cyan)" stroke-width="1.5" />
    </svg>
  </div>
  <div class="bar">
    <span class="brand">EMT STUDY GUIDE</span>
    <a class="cog" href="/settings" aria-label="Settings">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h0a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
      </svg>
    </a>
  </div>
</header>

<style>
  header {
    background: var(--bg2);
    border-bottom: 1px solid var(--border);
    position: sticky;
    top: 0;
    z-index: 100;
    padding-top: env(safe-area-inset-top);
  }
  .ecg-line {
    height: 12px;
    overflow: hidden;
  }
  .ecg-line svg {
    width: 200%;
    height: 100%;
    animation: ecg 3s linear infinite;
  }
  @keyframes ecg {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  .bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
  }
  .brand {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 13px;
    letter-spacing: 0.1em;
    color: var(--cyan);
  }
  .cog {
    color: var(--text2);
    padding: 6px;
    min-width: var(--tap);
    min-height: var(--tap);
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .cog:hover { color: var(--text); }
</style>
```

- [ ] **Step 2: Commit**

```powershell
git add src/lib/components/ECGHeader.svelte
git commit -m "feat: ECG header component preserving medical-monitor aesthetic"
```

---

### Task 17: Bottom nav

**Files:**
- Create: `src/lib/components/BottomNav.svelte`

- [ ] **Step 1: Write the component**

```svelte
<!-- src/lib/components/BottomNav.svelte -->
<script lang="ts">
  import { page } from '$app/state';

  const tabs = [
    { href: '/',       label: 'Today',  icon: 'calendar' },
    { href: '/browse', label: 'Browse', icon: 'book' },
    { href: '/stats',  label: 'Stats',  icon: 'chart' },
  ];

  function isActive(href: string): boolean {
    if (href === '/') return page.url.pathname === '/' || page.url.pathname === '/review';
    return page.url.pathname.startsWith(href);
  }
</script>

<nav>
  {#each tabs as t (t.href)}
    <a href={t.href} class:active={isActive(t.href)}>
      <span class="icon">
        {#if t.icon === 'calendar'}📅{:else if t.icon === 'book'}📚{:else}📊{/if}
      </span>
      <span class="label">{t.label}</span>
    </a>
  {/each}
</nav>

<style>
  nav {
    position: fixed;
    bottom: 0; left: 0; right: 0;
    height: calc(var(--nav-h) + env(safe-area-inset-bottom));
    padding-bottom: env(safe-area-inset-bottom);
    background: var(--bg2);
    border-top: 1px solid var(--border);
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    z-index: 50;
  }
  a {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    color: var(--text2);
    text-decoration: none;
    min-height: var(--tap);
  }
  a:hover { text-decoration: none; }
  a.active { color: var(--cyan); }
  .icon { font-size: 20px; line-height: 1; }
  .label { font-size: 11px; letter-spacing: 0.05em; }
</style>
```

- [ ] **Step 2: Commit**

```powershell
git add src/lib/components/BottomNav.svelte
git commit -m "feat: BottomNav (Today / Browse / Stats)"
```

---

### Task 18: Integrate header + nav into layout, add IDB-availability guard

**Files:**
- Modify: `src/routes/+layout.svelte`
- Create: `src/lib/db/availability.ts`

- [ ] **Step 1: Write IDB check**

```ts
// src/lib/db/availability.ts
export function isIndexedDBAvailable(): boolean {
  try {
    return typeof indexedDB !== 'undefined';
  } catch {
    return false;
  }
}
```

- [ ] **Step 2: Update layout**

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import '$lib/styles/reset.css';
  import '$lib/styles/theme.css';
  import ECGHeader from '$lib/components/ECGHeader.svelte';
  import BottomNav from '$lib/components/BottomNav.svelte';
  import { isIndexedDBAvailable } from '$lib/db/availability';

  let { children } = $props();
  const idbOK = isIndexedDBAvailable();
</script>

<ECGHeader />

<main>
  {#if idbOK}
    {@render children()}
  {:else}
    <div class="idb-error">
      <h2>Storage unavailable</h2>
      <p>EMT Study Guide requires IndexedDB to remember your progress. Please exit private browsing or use a different browser.</p>
    </div>
  {/if}
</main>

<BottomNav />

<style>
  main {
    max-width: 720px;
    margin: 0 auto;
    padding: 16px;
  }
  .idb-error {
    padding: 24px;
    border: 1px solid var(--red-bd);
    background: var(--red-bg);
    border-radius: var(--radius);
  }
  .idb-error h2 { color: var(--red); margin-bottom: 8px; font-size: 18px; }
</style>
```

- [ ] **Step 3: Run dev server**

Run: `npm run dev`. Visit `http://localhost:5173`. Expected: ECG header at top with cyan trace + brand, content area, three-tab nav fixed at bottom. Stop server.

- [ ] **Step 4: Commit**

```powershell
git add src/lib/db/availability.ts src/routes/+layout.svelte
git commit -m "feat: integrate app shell + IndexedDB availability guard"
```

---

## Phase G — Reactive Stores

### Task 19: Due-count + settings stores

**Files:**
- Create: `src/lib/stores/due.ts`
- Create: `src/lib/stores/settings.ts`

- [ ] **Step 1: Write `due.ts`**

```ts
// src/lib/stores/due.ts
import { writable } from 'svelte/store';
import { countDue } from '$lib/srs/scheduler';

function makeDueStore() {
  const { subscribe, set } = writable<number>(0);

  async function refresh() {
    set(await countDue());
  }

  return { subscribe, refresh };
}

export const dueCount = makeDueStore();
```

- [ ] **Step 2: Write `settings.ts`**

```ts
// src/lib/stores/settings.ts
import { writable } from 'svelte/store';
import { getSetting, setSetting, DEFAULTS } from '$lib/db/settings';

function makeSettingsStore() {
  const { subscribe, set, update } = writable<{ dailyNewCardBudget: number }>({
    dailyNewCardBudget: DEFAULTS.dailyNewCardBudget,
  });

  async function load() {
    const budget = await getSetting('dailyNewCardBudget', DEFAULTS.dailyNewCardBudget);
    set({ dailyNewCardBudget: budget });
  }

  async function setBudget(n: number) {
    await setSetting('dailyNewCardBudget', n);
    update(s => ({ ...s, dailyNewCardBudget: n }));
  }

  return { subscribe, load, setBudget };
}

export const settings = makeSettingsStore();
```

- [ ] **Step 3: Commit**

```powershell
git add src/lib/stores
git commit -m "feat: reactive stores for due count + settings"
```

---

## Phase H — Screens

### Task 20: Browse screen

**Files:**
- Create: `src/routes/browse/+page.svelte`

- [ ] **Step 1: Write the page**

```svelte
<!-- src/routes/browse/+page.svelte -->
<script lang="ts">
  import { PARTS } from '$lib/content/parts';
  import { CHAPTERS } from '$lib/content';

  const byId = new Map(CHAPTERS.map(c => [c.id, c]));
</script>

<svelte:head><title>Browse · EMT Study</title></svelte:head>

<h1>Browse</h1>

{#each PARTS as part (part.id)}
  <section>
    <h2>{part.label}</h2>
    <ul>
      {#each part.chapterIds as cid (cid)}
        {@const ch = byId.get(cid)}
        {#if ch}
          <li>
            <a href={`/chapter/${ch.id}`}>
              <span class="num">Ch {ch.number}</span>
              <span class="title">{ch.title}</span>
            </a>
          </li>
        {/if}
      {/each}
    </ul>
  </section>
{/each}

<style>
  h1 { font-size: 20px; margin-bottom: 16px; letter-spacing: 0.05em; }
  section { margin-bottom: 24px; }
  h2 {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    color: var(--cyan);
    letter-spacing: 0.08em;
    margin-bottom: 8px;
  }
  ul { display: flex; flex-direction: column; gap: 4px; }
  li a {
    display: flex;
    gap: 12px;
    padding: 12px 14px;
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--text);
    min-height: var(--tap);
    align-items: center;
  }
  .num { color: var(--text2); font-family: 'JetBrains Mono', monospace; font-size: 12px; min-width: 48px; }
  .title { color: var(--text); font-size: 14px; }
</style>
```

- [ ] **Step 2: Commit**

```powershell
git add src/routes/browse
git commit -m "feat: /browse — 12 parts → 46 chapters list"
```

---

### Task 21: Chapter home + notes

**Files:**
- Create: `src/routes/chapter/[id]/+page.svelte`
- Create: `src/routes/chapter/[id]/notes/+page.svelte`

- [ ] **Step 1: Chapter home**

```svelte
<!-- src/routes/chapter/[id]/+page.svelte -->
<script lang="ts">
  import { page } from '$app/state';
  import { getChapter } from '$lib/content';
  import { onMount } from 'svelte';
  import { recordChapterVisit } from '$lib/db/chapter-visits';

  const id = $derived(page.params.id);
  const chapter = $derived(getChapter(id));

  onMount(() => {
    if (chapter) recordChapterVisit(chapter.id);
  });
</script>

<svelte:head><title>{chapter?.title ?? 'Chapter'} · EMT Study</title></svelte:head>

{#if !chapter}
  <p>Chapter not found.</p>
{:else}
  <div class="head">
    <div class="num">Ch {chapter.number}</div>
    <h1>{chapter.title}</h1>
  </div>

  <div class="modes">
    <a href={`/chapter/${chapter.id}/flashcards`}>
      <span class="m">Flashcards</span>
      <span class="c">{chapter.cards.length}</span>
    </a>
    <a href={`/chapter/${chapter.id}/notes`}>
      <span class="m">Notes</span>
      <span class="c">{chapter.notes.length}</span>
    </a>
    <a href={`/chapter/${chapter.id}/quiz`}>
      <span class="m">Quiz</span>
      <span class="c">{chapter.quiz.length}</span>
    </a>
  </div>
{/if}

<style>
  .head { margin-bottom: 24px; }
  .num { font-family: 'JetBrains Mono', monospace; color: var(--cyan); font-size: 12px; letter-spacing: 0.1em; }
  h1 { font-size: 22px; margin-top: 6px; }
  .modes { display: grid; grid-template-columns: 1fr; gap: 8px; }
  .modes a {
    display: flex; justify-content: space-between; align-items: center;
    padding: 16px;
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--text);
    min-height: var(--tap);
  }
  .modes a:hover { border-color: var(--cyan-dim); text-decoration: none; }
  .m { font-size: 15px; }
  .c { color: var(--text2); font-family: 'JetBrains Mono', monospace; font-size: 12px; }
</style>
```

- [ ] **Step 2: Notes view**

```svelte
<!-- src/routes/chapter/[id]/notes/+page.svelte -->
<script lang="ts">
  import { page } from '$app/state';
  import { getChapter } from '$lib/content';
  import { onMount } from 'svelte';
  import { markNoteRead } from '$lib/db/chapter-visits';

  const id = $derived(page.params.id);
  const chapter = $derived(getChapter(id));

  onMount(() => {
    if (chapter) chapter.notes.forEach(n => markNoteRead(chapter.id, n.id));
  });
</script>

<svelte:head><title>Notes — {chapter?.title} · EMT Study</title></svelte:head>

<a class="back" href={`/chapter/${id}`}>← Back</a>

{#if chapter}
  <h1>{chapter.title} — Notes</h1>

  {#each chapter.notes as n (n.id)}
    <article>
      <h2>{n.title}</h2>
      <p>{n.body}</p>
      {#if n.terms.length}
        <ul class="terms">
          {#each n.terms as t}<li>{t}</li>{/each}
        </ul>
      {/if}
    </article>
  {/each}
{/if}

<style>
  .back { color: var(--text2); display: inline-block; margin-bottom: 12px; }
  h1 { font-size: 18px; margin-bottom: 16px; }
  article {
    padding: 16px;
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    margin-bottom: 12px;
  }
  h2 { color: var(--cyan); font-size: 14px; margin-bottom: 8px; letter-spacing: 0.04em; }
  p { color: var(--text); font-size: 14px; }
  .terms { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
  .terms li {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--text2);
    background: var(--bg3);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 2px 6px;
  }
</style>
```

- [ ] **Step 3: Commit**

```powershell
git add src/routes/chapter
git commit -m "feat: chapter home + notes view"
```

---

### Task 22: Quiz screen

**Files:**
- Create: `src/routes/chapter/[id]/quiz/+page.svelte`

- [ ] **Step 1: Write the page**

```svelte
<!-- src/routes/chapter/[id]/quiz/+page.svelte -->
<script lang="ts">
  import { page } from '$app/state';
  import { getChapter } from '$lib/content';
  import { recordQuizAttempt } from '$lib/db/quiz';

  const id = $derived(page.params.id);
  const chapter = $derived(getChapter(id));

  let answers = $state<Record<string, number>>({});

  async function pick(qId: string, optIdx: number, correctIdx: number) {
    if (answers[qId] !== undefined) return;
    answers[qId] = optIdx;
    await recordQuizAttempt({
      chapterId: id,
      questionId: qId,
      selected: optIdx,
      correct: optIdx === correctIdx,
    });
  }

  const score = $derived(
    chapter
      ? chapter.quiz.reduce((acc, q) => acc + (answers[q.id] === q.ans ? 1 : 0), 0)
      : 0
  );
  const answered = $derived(Object.keys(answers).length);
</script>

<svelte:head><title>Quiz — {chapter?.title} · EMT Study</title></svelte:head>

<a class="back" href={`/chapter/${id}`}>← Back</a>

{#if chapter}
  <h1>{chapter.title} — Quiz</h1>
  <p class="score">{score}/{answered}/{chapter.quiz.length}</p>

  {#each chapter.quiz as q (q.id)}
    {@const picked = answers[q.id]}
    <article>
      <p class="q">{q.q}</p>
      {#each q.opts as opt, i}
        {@const isPicked = picked === i}
        {@const isCorrect = i === q.ans}
        <button
          class="opt"
          class:picked={isPicked}
          class:correct={picked !== undefined && isCorrect}
          class:wrong={isPicked && !isCorrect}
          disabled={picked !== undefined}
          onclick={() => pick(q.id, i, q.ans)}
        >
          {opt}
        </button>
      {/each}
      {#if picked !== undefined}
        <p class="exp">{q.exp}</p>
      {/if}
    </article>
  {/each}
{/if}

<style>
  .back { color: var(--text2); display: inline-block; margin-bottom: 12px; }
  h1 { font-size: 18px; }
  .score { color: var(--text2); font-family: 'JetBrains Mono', monospace; font-size: 12px; margin-bottom: 16px; }
  article {
    padding: 16px;
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    margin-bottom: 12px;
  }
  .q { font-size: 14px; margin-bottom: 12px; }
  .opt {
    display: block;
    width: 100%;
    text-align: left;
    padding: 12px;
    margin-bottom: 6px;
    background: var(--bg3);
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--text);
    font-size: 13px;
    min-height: var(--tap);
  }
  .opt.correct { background: var(--green-bg); border-color: var(--green-bd); color: var(--green); }
  .opt.wrong   { background: var(--red-bg);   border-color: var(--red-bd);   color: var(--red); }
  .opt:disabled { cursor: default; }
  .exp { color: var(--text2); font-size: 13px; margin-top: 8px; padding: 8px; background: var(--bg3); border-radius: 6px; }
</style>
```

- [ ] **Step 2: Commit**

```powershell
git add src/routes/chapter/[id]/quiz
git commit -m "feat: chapter quiz screen with attempt logging"
```

---

### Task 23: Flashcard component + chapter flashcards screen

**Files:**
- Create: `src/lib/components/Flashcard.svelte`
- Create: `src/routes/chapter/[id]/flashcards/+page.svelte`

- [ ] **Step 1: Flashcard component**

```svelte
<!-- src/lib/components/Flashcard.svelte -->
<script lang="ts">
  import type { Flashcard } from '$lib/content/types';
  import type { SrsState, Rating } from '$lib/srs/sm2';
  import { nextIntervalPreview, INITIAL_STATE } from '$lib/srs/sm2';

  let { card, state = INITIAL_STATE, onRate }: {
    card: Flashcard;
    state?: SrsState;
    onRate: (rating: Rating) => void;
  } = $props();

  let revealed = $state(false);

  $effect(() => {
    void card;
    revealed = false;
  });

  function previewLabel(days: number): string {
    if (days < 1) return '<1d';
    if (days < 30) return `${days}d`;
    return `${Math.round(days / 30)}mo`;
  }

  const ratings: { value: Rating; label: string }[] = [
    { value: 1, label: 'Again' },
    { value: 3, label: 'Hard' },
    { value: 4, label: 'Good' },
    { value: 5, label: 'Easy' },
  ];
</script>

<div class="card">
  <p class="q">{card.q}</p>
  {#if revealed}
    <hr />
    <p class="a">{card.a}</p>
  {/if}
</div>

{#if !revealed}
  <button class="reveal" onclick={() => (revealed = true)}>Reveal</button>
{:else}
  <div class="ratings">
    {#each ratings as r (r.value)}
      <button class="rate r{r.value}" onclick={() => onRate(r.value)}>
        <span class="label">{r.label}</span>
        <span class="iv">{previewLabel(nextIntervalPreview(state, r.value))}</span>
      </button>
    {/each}
  </div>
{/if}

<style>
  .card {
    padding: 24px;
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    min-height: 200px;
    margin-bottom: 16px;
  }
  .q { font-size: 16px; }
  hr { border: 0; border-top: 1px solid var(--border); margin: 16px 0; }
  .a { color: var(--text); font-size: 15px; }
  .reveal {
    display: block; width: 100%;
    padding: 14px;
    background: var(--bg3);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--text);
    min-height: var(--tap);
  }
  .ratings { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
  .rate {
    padding: 10px 6px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    min-height: var(--tap);
    display: flex; flex-direction: column; align-items: center; gap: 2px;
    background: var(--bg2);
    color: var(--text);
  }
  .label { font-size: 12px; }
  .iv { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--text2); }
  .r1 { border-color: var(--red-bd); color: var(--red); }
  .r3 { border-color: var(--yellow); color: var(--yellow); }
  .r4 { border-color: var(--green-bd); color: var(--green); }
  .r5 { border-color: var(--cyan-dim); color: var(--cyan); }
</style>
```

- [ ] **Step 2: Chapter flashcards screen**

```svelte
<!-- src/routes/chapter/[id]/flashcards/+page.svelte -->
<script lang="ts">
  import { page } from '$app/state';
  import { getChapter } from '$lib/content';
  import Flashcard from '$lib/components/Flashcard.svelte';
  import { getCardProgress, recordReview } from '$lib/db/cards';
  import { dueCount } from '$lib/stores/due';
  import { INITIAL_STATE, type Rating, type SrsState } from '$lib/srs/sm2';

  const id = $derived(page.params.id);
  const chapter = $derived(getChapter(id));

  let idx = $state(0);
  let state = $state<SrsState>(INITIAL_STATE);

  const card = $derived(chapter?.cards[idx]);

  $effect(() => {
    if (!card) return;
    getCardProgress(card.id).then(p => {
      state = p ?? INITIAL_STATE;
    });
  });

  async function rate(rating: Rating) {
    if (!card) return;
    await recordReview(card.id, rating);
    await dueCount.refresh();
    if (chapter && idx < chapter.cards.length - 1) idx += 1;
  }

  function prev() { if (idx > 0) idx -= 1; }
  function next() { if (chapter && idx < chapter.cards.length - 1) idx += 1; }
</script>

<svelte:head><title>Flashcards — {chapter?.title} · EMT Study</title></svelte:head>

<a class="back" href={`/chapter/${id}`}>← Back</a>

{#if chapter && card}
  <p class="pos">{idx + 1} / {chapter.cards.length}</p>
  <Flashcard {card} {state} onRate={rate} />
  <div class="nav">
    <button onclick={prev} disabled={idx === 0}>Prev</button>
    <button onclick={next} disabled={idx === chapter.cards.length - 1}>Skip →</button>
  </div>
{/if}

<style>
  .back { color: var(--text2); display: inline-block; margin-bottom: 12px; }
  .pos { color: var(--text2); font-family: 'JetBrains Mono', monospace; font-size: 12px; margin-bottom: 12px; }
  .nav { display: flex; justify-content: space-between; margin-top: 12px; }
  .nav button {
    padding: 10px 14px;
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--text);
    min-height: var(--tap);
  }
  .nav button:disabled { color: var(--text3); }
</style>
```

- [ ] **Step 3: Commit**

```powershell
git add src/lib/components/Flashcard.svelte src/routes/chapter/[id]/flashcards
git commit -m "feat: Flashcard component + chapter walk-through with SRS"
```

---

### Task 24: Review queue screen

**Files:**
- Create: `src/routes/review/+page.svelte`

- [ ] **Step 1: Write the page**

```svelte
<!-- src/routes/review/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import Flashcard from '$lib/components/Flashcard.svelte';
  import { getDueCards, type DueCard } from '$lib/srs/scheduler';
  import { recordReview } from '$lib/db/cards';
  import { dueCount } from '$lib/stores/due';
  import type { Rating, SrsState } from '$lib/srs/sm2';

  let queue = $state<DueCard[]>([]);
  let idx = $state(0);
  let total = $state(0);
  let loaded = $state(false);

  const current = $derived(queue[idx]);

  onMount(async () => {
    queue = await getDueCards();
    total = queue.length;
    loaded = true;
  });

  function progressState(): SrsState {
    if (!current) return { ease: 2.5, intervalDays: 0, reps: 0, lapses: 0 };
    return {
      ease: current.progress.ease,
      intervalDays: current.progress.intervalDays,
      reps: current.progress.reps,
      lapses: current.progress.lapses,
    };
  }

  async function onRate(rating: Rating) {
    if (!current) return;
    await recordReview(current.card.id, rating);
    await dueCount.refresh();
    if (idx < queue.length - 1) idx += 1;
    else idx = queue.length; // sentinel — done
  }
</script>

<svelte:head><title>Review · EMT Study</title></svelte:head>

{#if !loaded}
  <p>Loading…</p>
{:else if total === 0}
  <h1>Nothing due</h1>
  <p>Come back tomorrow, or <a href="/browse">study a chapter</a> to add cards to your queue.</p>
{:else if idx >= queue.length}
  <h1>Done!</h1>
  <p>Reviewed {total} card{total === 1 ? '' : 's'}.</p>
  <a class="cta" href="/">Back to Today</a>
{:else}
  <p class="pos">{idx + 1} / {total}</p>
  <Flashcard card={current.card} state={progressState()} {onRate} />
{/if}

<style>
  h1 { font-size: 22px; margin-bottom: 8px; }
  .pos { color: var(--text2); font-family: 'JetBrains Mono', monospace; font-size: 12px; margin-bottom: 12px; }
  .cta {
    display: inline-block;
    margin-top: 12px;
    padding: 10px 16px;
    background: var(--cyan-bg);
    border: 1px solid var(--cyan-dim);
    border-radius: var(--radius);
    color: var(--cyan);
  }
</style>
```

- [ ] **Step 2: Commit**

```powershell
git add src/routes/review
git commit -m "feat: /review screen — SRS due queue with rating-driven progression"
```

---

### Task 25: Today (root) screen

**Files:**
- Modify: `src/routes/+page.svelte`

- [ ] **Step 1: Replace `+page.svelte`**

```svelte
<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { dueCount } from '$lib/stores/due';
  import { db } from '$lib/db/schema';
  import { CHAPTERS } from '$lib/content';

  let recent = $state<{ id: string; title: string }[]>([]);

  onMount(async () => {
    await dueCount.refresh();
    const visits = await db().chapterVisits
      .orderBy('lastVisitedAt').reverse().limit(3).toArray();
    const byId = new Map(CHAPTERS.map(c => [c.id, c]));
    recent = visits.flatMap(v => {
      const c = byId.get(v.chapterId);
      return c ? [{ id: c.id, title: `Ch ${c.number} — ${c.title}` }] : [];
    });
  });
</script>

<svelte:head><title>Today · EMT Study</title></svelte:head>

<section class="hero">
  <div class="count">{$dueCount}</div>
  <div class="label">cards due</div>
  {#if $dueCount > 0}
    <a class="start" href="/review">Start review</a>
  {:else}
    <p class="empty">All caught up — pick a chapter to add new cards.</p>
    <a class="start" href="/browse">Browse chapters</a>
  {/if}
</section>

{#if recent.length}
  <section>
    <h2>Recent</h2>
    <ul>
      {#each recent as r (r.id)}
        <li><a href={`/chapter/${r.id}`}>{r.title}</a></li>
      {/each}
    </ul>
  </section>
{/if}

<style>
  .hero {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 24px;
    text-align: center;
    margin-bottom: 24px;
  }
  .count {
    font-family: 'JetBrains Mono', monospace;
    font-size: 56px;
    color: var(--cyan);
    line-height: 1;
  }
  .label {
    color: var(--text2);
    letter-spacing: 0.1em;
    font-size: 12px;
    margin-top: 6px;
    margin-bottom: 16px;
  }
  .start {
    display: inline-block;
    padding: 12px 18px;
    background: var(--cyan-bg);
    border: 1px solid var(--cyan-dim);
    border-radius: var(--radius);
    color: var(--cyan);
    min-height: var(--tap);
  }
  .empty { color: var(--text2); margin-bottom: 12px; }
  h2 {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    color: var(--cyan);
    letter-spacing: 0.08em;
    margin-bottom: 8px;
  }
  ul { display: flex; flex-direction: column; gap: 6px; }
  li a {
    display: block;
    padding: 12px;
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--text);
    min-height: var(--tap);
  }
</style>
```

- [ ] **Step 2: Commit**

```powershell
git add src/routes/+page.svelte
git commit -m "feat: Today screen — due count + Start review + recent chapters"
```

---

### Task 26: Stats screen

**Files:**
- Create: `src/routes/stats/+page.svelte`

- [ ] **Step 1: Write the page**

```svelte
<!-- src/routes/stats/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { db } from '$lib/db/schema';

  let reviewsToday = $state(0);
  let total = $state(0);
  let mastered = $state(0);     // intervalDays > 21
  let learning = $state(0);
  let last30 = $state<{ date: string; count: number }[]>([]);

  function dayKey(ts: number): string {
    return new Date(ts).toISOString().slice(0, 10);
  }

  onMount(async () => {
    const now = Date.now();
    const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);

    const allLog = await db().reviewLog.toArray();
    reviewsToday = allLog.filter(r => r.reviewedAt >= startOfDay.getTime()).length;

    const cardProgress = await db().cardProgress.toArray();
    total = cardProgress.length;
    mastered = cardProgress.filter(p => p.intervalDays > 21).length;
    learning = total - mastered;

    const counts = new Map<string, number>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now - i * 86_400_000);
      counts.set(dayKey(d.getTime()), 0);
    }
    for (const r of allLog) {
      const k = dayKey(r.reviewedAt);
      if (counts.has(k)) counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    last30 = [...counts.entries()].map(([date, count]) => ({ date, count }));
  });

  function shade(c: number): string {
    if (c === 0) return 'var(--bg3)';
    if (c < 5) return 'var(--cyan-dim)';
    return 'var(--cyan)';
  }
</script>

<svelte:head><title>Stats · EMT Study</title></svelte:head>

<h1>Stats</h1>

<div class="grid">
  <div class="stat"><div class="n">{reviewsToday}</div><div class="l">reviewed today</div></div>
  <div class="stat"><div class="n">{mastered}</div><div class="l">mastered (&gt;21d)</div></div>
  <div class="stat"><div class="n">{learning}</div><div class="l">learning</div></div>
  <div class="stat"><div class="n">{total}</div><div class="l">cards started</div></div>
</div>

<h2>Last 30 days</h2>
<div class="heat">
  {#each last30 as d (d.date)}
    <div class="cell" title={`${d.date}: ${d.count} reviews`} style={`background:${shade(d.count)}`}></div>
  {/each}
</div>

<style>
  h1 { font-size: 20px; margin-bottom: 16px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 24px; }
  .stat {
    background: var(--bg2); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 14px; text-align: center;
  }
  .n { font-family: 'JetBrains Mono', monospace; font-size: 28px; color: var(--cyan); }
  .l { font-size: 11px; color: var(--text2); letter-spacing: 0.05em; margin-top: 4px; }
  h2 {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px; color: var(--cyan); letter-spacing: 0.08em; margin-bottom: 8px;
  }
  .heat {
    display: grid;
    grid-template-columns: repeat(15, 1fr);
    gap: 4px;
  }
  .cell { aspect-ratio: 1; border-radius: 3px; }
</style>
```

- [ ] **Step 2: Commit**

```powershell
git add src/routes/stats
git commit -m "feat: /stats — counts + 30-day review heatmap"
```

---

### Task 27: Settings screen (export / import / reset)

**Files:**
- Create: `src/routes/settings/+page.svelte`

- [ ] **Step 1: Write the page**

```svelte
<!-- src/routes/settings/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { settings } from '$lib/stores/settings';
  import { db } from '$lib/db/schema';
  import { resetAllProgress } from '$lib/db/cards';
  import { dueCount } from '$lib/stores/due';

  let budgetInput = $state(20);
  let status = $state<string | null>(null);

  onMount(async () => {
    await settings.load();
  });

  $effect(() => {
    budgetInput = $settings.dailyNewCardBudget;
  });

  async function saveBudget() {
    await settings.setBudget(budgetInput);
    status = 'Saved.';
    setTimeout(() => (status = null), 1500);
  }

  async function exportData() {
    const data = {
      version: 1,
      exportedAt: Date.now(),
      cardProgress:  await db().cardProgress.toArray(),
      quizAttempts:  await db().quizAttempts.toArray(),
      chapterVisits: await db().chapterVisits.toArray(),
      reviewLog:     await db().reviewLog.toArray(),
      settings:      await db().settings.toArray(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emt-study-export-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importData(ev: Event) {
    const file = (ev.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const text = await file.text();
    const data = JSON.parse(text);
    if (data.version !== 1) { status = 'Unknown export version.'; return; }
    await db().transaction('rw',
      [db().cardProgress, db().quizAttempts, db().chapterVisits, db().reviewLog, db().settings],
      async () => {
        await db().cardProgress.clear();
        await db().quizAttempts.clear();
        await db().chapterVisits.clear();
        await db().reviewLog.clear();
        await db().settings.clear();
        await db().cardProgress.bulkAdd(data.cardProgress  ?? []);
        await db().quizAttempts.bulkAdd(data.quizAttempts  ?? []);
        await db().chapterVisits.bulkAdd(data.chapterVisits ?? []);
        await db().reviewLog.bulkAdd(data.reviewLog        ?? []);
        await db().settings.bulkAdd(data.settings          ?? []);
      });
    await dueCount.refresh();
    status = 'Imported.';
  }

  async function reset() {
    if (!confirm('Erase all progress, quiz history, and review log? This cannot be undone.')) return;
    await resetAllProgress();
    await dueCount.refresh();
    status = 'Progress reset.';
  }
</script>

<svelte:head><title>Settings · EMT Study</title></svelte:head>

<h1>Settings</h1>

<section>
  <h2>Daily new-card budget</h2>
  <p class="help">How many never-seen cards to introduce per day. Lower it if reviews pile up.</p>
  <div class="row">
    <input type="number" min="0" max="200" bind:value={budgetInput} />
    <button onclick={saveBudget}>Save</button>
  </div>
</section>

<section>
  <h2>Backup & restore</h2>
  <p class="help">Export your progress as JSON; import on a new device to migrate.</p>
  <div class="row">
    <button onclick={exportData}>Export JSON</button>
    <label class="file">
      Import JSON
      <input type="file" accept="application/json" onchange={importData} />
    </label>
  </div>
</section>

<section>
  <h2 class="danger">Reset</h2>
  <p class="help">Erases progress, quiz history, and review log. Content is unaffected.</p>
  <button class="danger-btn" onclick={reset}>Reset all progress</button>
</section>

{#if status}<p class="status">{status}</p>{/if}

<style>
  h1 { font-size: 20px; margin-bottom: 16px; }
  section {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 14px;
    margin-bottom: 12px;
  }
  h2 {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    color: var(--cyan);
    letter-spacing: 0.08em;
    margin-bottom: 6px;
  }
  h2.danger { color: var(--red); }
  .help { color: var(--text2); font-size: 13px; margin-bottom: 10px; }
  .row { display: flex; gap: 8px; align-items: center; }
  input[type=number] {
    flex: 1;
    background: var(--bg3);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 10px;
    color: var(--text);
    min-height: var(--tap);
  }
  button, .file {
    padding: 10px 14px;
    background: var(--bg3);
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--text);
    min-height: var(--tap);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
  }
  .file input { display: none; }
  .danger-btn { background: var(--red-bg); border-color: var(--red-bd); color: var(--red); }
  .status {
    margin-top: 12px;
    padding: 10px;
    background: var(--green-bg);
    border: 1px solid var(--green-bd);
    color: var(--green);
    border-radius: 6px;
    text-align: center;
  }
</style>
```

- [ ] **Step 2: Commit**

```powershell
git add src/routes/settings
git commit -m "feat: /settings — budget, export/import JSON, reset progress"
```

---

## Phase I — PWA Assets

### Task 28: PWA icons + favicon

**Files:**
- Create: `static/icons/icon-192.png`
- Create: `static/icons/icon-512.png`
- Create: `static/icons/maskable-512.png`
- Create: `static/icons/apple-touch-180.png`
- Create: `static/favicon.svg`

- [ ] **Step 1: Create the favicon**

Write `static/favicon.svg`:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#0d1117"/>
  <polyline points="2,18 10,18 12,8 16,28 20,4 24,18 30,18"
            fill="none" stroke="#39d0d8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

- [ ] **Step 2: Generate PNG icons from the SVG**

The Node `sharp` package is the simplest cross-platform way. One-shot script `scripts/make-icons.mjs`:

```js
// scripts/make-icons.mjs
import sharp from 'sharp';
import { mkdirSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const outDir = resolve(root, 'static/icons');
mkdirSync(outDir, { recursive: true });

const svg = readFileSync(resolve(root, 'static/favicon.svg'));

async function render(size, name, padding = 0) {
  const inner = size - padding * 2;
  await sharp({
    create: { width: size, height: size, channels: 4, background: '#0d1117' },
  })
    .composite([{ input: await sharp(svg).resize(inner, inner).png().toBuffer(), top: padding, left: padding }])
    .png()
    .toFile(resolve(outDir, name));
  console.log('wrote', name);
}

await render(192, 'icon-192.png');
await render(512, 'icon-512.png');
await render(512, 'maskable-512.png', 64);   // safe area for maskable
await render(180, 'apple-touch-180.png');
```

Install and run:

```powershell
npm install -D sharp
node scripts/make-icons.mjs
```

Expected output: 4 PNGs in `static/icons/`.

- [ ] **Step 3: Verify a clean build**

```powershell
npm run build
```

Expected: build succeeds, `build/manifest.webmanifest` exists, `build/icons/` contains the 4 PNGs.

- [ ] **Step 4: Commit**

```powershell
git add static scripts/make-icons.mjs package.json package-lock.json
git commit -m "feat: PWA icons and favicon"
```

---

## Phase J — Deployment

### Task 29: Replace server.js with `serve`; update Railway config

**Files:**
- Modify: `package.json`
- Modify: `railway.toml`
- Modify: `Procfile`
- Delete: `legacy/server.js` is kept; project-root `server.js` is already gone (Task 1)

- [ ] **Step 1: Update `package.json` scripts**

In `package.json`, ensure scripts include:

```json
{
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
    "test": "vitest",
    "test:e2e": "playwright test",
    "start": "serve build -l ${PORT:-8080} -s"
  }
}
```

- [ ] **Step 2: Update `railway.toml`**

```toml
[build]
  builder = "NIXPACKS"
  buildCommand = "npm install && npm run build"

[deploy]
  startCommand = "npm start"
  restartPolicyType = "ON_FAILURE"
  restartPolicyMaxRetries = 10

[[services]]
  internalPort = 8080
```

- [ ] **Step 3: Update `Procfile`**

```
web: npm start
```

- [ ] **Step 4: Smoke-test locally**

```powershell
npm run build
$env:PORT = "8080"; npm start
```

Open `http://localhost:8080`. Expected: app loads, ECG header + bottom nav visible, `/browse` works. Stop server (Ctrl-C).

- [ ] **Step 5: Commit**

```powershell
git add package.json railway.toml Procfile
git commit -m "chore: switch Railway to static build served by `serve`"
```

---

## Phase K — End-to-End Test

### Task 30: Playwright E2E for the review flow

**Files:**
- Create: `tests/e2e/review-flow.test.ts`
- Modify: `playwright.config.ts` (set up by scaffolding — confirm it points at the dev server)

- [ ] **Step 1: Configure Playwright if scaffolding didn't already**

Ensure `playwright.config.ts` contains:

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  webServer: {
    command: 'npm run dev -- --port 4173',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  use: { baseURL: 'http://localhost:4173' },
});
```

- [ ] **Step 2: Write the test**

```ts
// tests/e2e/review-flow.test.ts
import { test, expect } from '@playwright/test';

test('study a chapter card, then it appears in tomorrow\'s review', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('cards due')).toBeVisible();

  // Walk into a chapter and rate one card Good.
  await page.goto('/chapter/ch-01/flashcards');
  await page.getByRole('button', { name: 'Reveal' }).click();
  await page.getByRole('button', { name: 'Good' }).click();

  // Reload — progress should persist.
  await page.reload();
  await page.goto('/');
  // Due is 0 today (interval is 1 day), so review screen says nothing due.
  await page.goto('/review');
  await expect(page.getByText('Nothing due')).toBeVisible();
});
```

- [ ] **Step 3: Run the test**

```powershell
npx playwright install --with-deps chromium
npm run test:e2e
```

Expected: 1 spec passes.

- [ ] **Step 4: Commit**

```powershell
git add tests/e2e playwright.config.ts
git commit -m "test(e2e): review flow persists across reload"
```

---

## Phase L — Documentation

### Task 31: Update README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace `README.md`**

```markdown
# EMT Study Guide

SvelteKit + TypeScript Progressive Web App. Spaced-repetition flashcards, notes, and NREMT-style quizzes covering all 46 chapters of *Brady Prehospital Emergency Care, 11th Edition*.

- **Offline-first** — installable PWA, all content bundled
- **Spaced repetition** — SM-2 algorithm, daily review queue
- **Local-only progress** — IndexedDB (Dexie); export/import JSON for backup
- **Mobile-first** — dark medical-monitor theme; bottom-tab navigation

## Develop

```bash
npm install
npm run dev          # http://localhost:5173
npm run test         # vitest (algorithm + DB + content invariants)
npm run test:e2e     # playwright (review flow)
npm run check        # svelte-check
```

## Build & deploy (Railway)

```bash
npm run build        # → build/
npm start            # serves build/ on $PORT (default 8080)
```

Push to GitHub; Railway auto-builds and runs `npm start`.

## Structure

```
src/
├── routes/               # SvelteKit pages
├── lib/
│   ├── content/          # static study material — one TS file per chapter
│   ├── srs/              # SM-2 + scheduler (pure, unit-tested)
│   ├── db/               # Dexie schema + CRUD
│   ├── stores/           # reactive Svelte stores
│   ├── components/       # ECGHeader, BottomNav, Flashcard, …
│   └── styles/           # theme.css, reset.css
static/icons/             # PWA icons
scripts/                  # one-shot migration + icon scripts
legacy/                   # archived original single-file app
```

## Re-running content migration

`scripts/migrate-content.mjs` reads `legacy/index.html` and regenerates `src/lib/content/`. It's idempotent; re-running overwrites.

## Future: native app stores

The static build at `build/` is what Capacitor wraps. When you're ready:

```bash
npm install -D @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
npx cap init "EMT Study" com.austinaquarium.emtstudy --web-dir=build
npx cap add ios
npx cap add android
npx cap sync
```
```

- [ ] **Step 2: Commit**

```powershell
git add README.md
git commit -m "docs: README for the SvelteKit PWA rewrite"
```

---

## Done

When all 31 tasks are committed, the rewrite is feature-complete per the spec.

**Verification before declaring complete:**
1. `npm run check` → 0 errors
2. `npm run test -- --run` → all unit tests pass
3. `npm run test:e2e` → E2E passes
4. `npm run build` → succeeds
5. `npm start` + manual smoke: cold load, walk one chapter's flashcards, reload, see progress persist; install the PWA on a phone via the share-sheet "Add to Home Screen" and confirm the app launches standalone.
