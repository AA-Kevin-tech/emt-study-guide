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
