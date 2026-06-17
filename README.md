# EMT Study Guide
**Brady Prehospital Emergency Care — 11th Edition**

Dark mode study app with flashcards, summary notes, and NREMT-style quiz questions covering all 46 chapters.

---

## Deploy to Railway (3 steps)

### Option A — GitHub (recommended)
1. Push this folder to a GitHub repo
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub repo
3. Select the repo — Railway auto-detects and deploys. Done.

### Option B — Railway CLI
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

---

## Local preview
```bash
npm install
npm start
# Open http://localhost:3000
```

---

## Structure
```
emt-study/
├── index.html      ← entire app (single file)
├── package.json    ← serve dependency
├── railway.toml    ← Railway config
└── README.md
```

All study content is self-contained in `index.html` — no database, no API, no build step.
