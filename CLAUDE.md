# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

HomeFit — a web app that recommends a house or apartment based on a person's
questionnaire answers (hobbies, budget, desired city, ambiance, whether nearby
schools matter) and suggests a matching interior decor style based on
personality traits. Two independent apps, run separately:

- `backend/` — Node.js + Express API, no database (stateless — everything is
  computed on demand from an in-memory mock dataset).
- `frontend/` — React + Vite single-page app.

There is no root `package.json` and no monorepo tooling — each side has its own
`node_modules` and must be started independently for the app to work end-to-end.

## File structure

```
homefit/
├── CLAUDE.md
├── backend/
│   ├── package.json
│   ├── src/
│   │   ├── server.js              # Express app entry point
│   │   ├── moteur.js              # Pure recommendation-scoring engine
│   │   ├── deco.js                # Pure decor-style suggestion engine
│   │   ├── data/
│   │   │   └── annonces.js        # Mock listing dataset (fictional, no external API)
│   │   └── routes/
│   │       └── recommandations.js # POST /api/recommandations
│   └── tests/
│       ├── moteur.test.js
│       └── deco.test.js
└── frontend/
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx                        # Root component: questionnaire <-> results
        ├── api.js                         # fetch wrapper for the backend API
        ├── constants.js                   # Questionnaire option labels
        ├── index.css                      # Global styles, color tokens
        ├── App.css                        # Component styles
        └── components/
            ├── Questionnaire.jsx           # Profile form (hobbies, budget, personality...)
            ├── Resultats.jsx                # Deco suggestion + ranked listings
            └── AnnonceCard.jsx              # One ranked listing with its score/reasons
```

## Commands

### Backend (`backend/`)

- `npm start` — run the API server on `http://localhost:3002`
- `npm run dev` — same, with `node --watch` for auto-reload on file changes
- `npm test` — run all unit tests (Node's built-in test runner; discovers `tests/*.test.js` automatically)

### Frontend (`frontend/`)

- `npm run dev` — Vite dev server (default `http://localhost:5173`, or the next
  free port if `calendar`'s frontend is already running on it)
- `npm run build` — production build to `dist/`
- `npm run preview` — preview a production build

The frontend talks to the backend at a hardcoded `http://localhost:3002`
(`BASE_URL` in `frontend/src/api.js` — no env var, no dev-server proxy). Both
servers must be running for the app to function.

## Architecture

### The recommendation and decor engines are pure, hand-coded logic — no AI call

Both `backend/src/moteur.js` and `backend/src/deco.js` are pure modules (no DB,
no Express, no LLM API), fully unit-tested:

- `moteur.js` scores every listing against a profile using a fixed point system
  (`POIDS`): budget fit, city match, housing type match, school proximity (only
  if the profile says it matters), nature proximity (only for hobbies linked to
  the outdoors — running/hiking, gardening), ambiance match, and a hobby→amenity
  bonus map (e.g. `jardinage` → `jardin`, `teletravail` → `bureau`). A profile
  with no explicit housing-type preference implicitly matches every type (this
  is intentional — "no preference" means anything counts), which is a detail
  the tests account for explicitly rather than asserting a "neutral" score of 0.
- `deco.js` is a fixed 5×4 lookup table (`STYLES_DECO`) mapping a preferred
  interior style × temperament combination to a named decor style with a
  description. Always resolves to a value, falling back to
  `chaleureux`/`pragmatique` for any missing or invalid trait.
- Listings live in `backend/src/data/annonces.js` — a fictional, hand-written
  dataset (~16 entries across a few French cities), not fetched from any real
  estate API or scraper.

### Frontend: two-view state machine, no state library

`frontend/src/App.jsx` holds just two pieces of state: the questionnaire result
(`donnees`, null until submitted) and loading/error flags. `Questionnaire`
renders while `donnees` is null; submitting it calls the API and swaps to
`Resultats`, which can hand control back via "Modifier mes critères" (sets
`donnees` back to null). No routing library — the whole app is one page with
two conditionally-rendered views.

### No persistence

Unlike a typical CRUD app, there's no database and no user accounts: every
request to `POST /api/recommandations` is stateless — it takes a profile,
scores it against the in-memory `annonces` array, and returns the ranked list.
Nothing is saved between requests.
