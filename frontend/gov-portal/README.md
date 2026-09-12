# KaushalSetu — Government Intelligence Portal (Frontend)

A React + Vite frontend for the **Government Portal** of KaushalSetu (SIH 2026),
Maharashtra's skilling-ecosystem decision intelligence system. Currently runs
on realistic **synthetic/demonstration data**; architected to swap onto the
FastAPI backend with no component changes.

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build      # production build -> dist/
npm run preview    # serve the production build locally
npm run lint        # oxlint
```

## What's here

- **Overview** (`/overview`) — state KPIs, State Skill Health, Maharashtra
  Skill Heatmap (36 districts, metric-switchable grid), District Performance
  Matrix (search/sort/filter) and Trend View (top improvers / biggest
  declines).
- **District Intelligence** (`/districts/:district`) — per-district health
  score, KPIs, up-to-3-district comparison, 8-quarter trend, demand vs.
  supply / skill-gap chart, employment funnel, training-provider and
  employer intelligence, recommendations.
- **Skill Intelligence** (`/skills`) — statewide skill table (demand, supply,
  gap, growth, placement, salary, risk) filterable by category.
- **Career Outcomes** (`/career-outcomes`) — the Career Digital Twin funnel,
  salary progression, and career pathways.
- **Early Warning** (`/early-warning`, `/early-warning/:id`) — risk-filterable
  alert list and a detail view separating Observed / Predicted / Recommended.
- **Policy Simulator** (`/policy-simulator`) — the What-If Simulator: pick a
  district, skill, intervention, quantity and time horizon, run it, and see
  baseline → projected metrics, an Impact Score and a confidence figure.
- **Impact & Reports** (`/impact`) — the Skilling Impact Score breakdown,
  district impact ranking, and intervention effectiveness.

## Architecture notes

- **`src/data/mockGovernmentData.js`** is the single source of synthetic data
  — all 36 districts, generated with a seeded PRNG so values are stable
  across renders and correlate the way a real skilling pipeline would
  (certified ≤ trainees, placed ≤ certified, etc., and tiered so metro
  districts trend healthier than remote ones).
- **`src/services/mockApi.js`** simulates async API calls over that data.
- **`src/services/api.js`** is the *only* module every page/component talks
  to. It currently forwards to `mockApi`; flip `USE_MOCK = false` and fill in
  the FastAPI base URL (`VITE_API_BASE_URL`) once the backend endpoints are
  live — no page or component needs to change, since the mock return shapes
  match what the real endpoints should return.
- All predicted/recommended/simulated values are visibly labelled via
  `DataStatusBadge` — nothing is presented as a guaranteed outcome.
- Every screen shows **"Demonstration Data"** / synthetic-data disclosure per
  the brief; these are not official Maharashtra government statistics.
- No ML or simulation math lives on the frontend's behalf in production —
  `runSimulation()` in the mock data layer is a transparent, swappable
  stand-in for the future `/api/gov/policy-simulator/run` FastAPI endpoint.

## Structure

```
src/
├── components/{common,dashboard,districts,skills,career,earlyWarning,simulator}
├── pages/            one file per route
├── layouts/          GovernmentLayout (sidebar + top bar)
├── services/         api.js (facade) + mockApi.js
├── data/             mockGovernmentData.js
├── hooks/            useApiData.js
├── utils/            format.js, seededRandom.js
```

## Known trade-offs (given hackathon time constraints)

- The Maharashtra map is a data-driven **grid heatmap**, not a geographic
  SVG/tile map — this avoids a heavy mapping dependency while still
  answering "where is the problem" with click-through to district detail.
  Swappable later for a real Maharashtra district-boundary map if desired.
- Bundle is code-split by route (`React.lazy`) to keep initial load light.
