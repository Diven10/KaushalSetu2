# Integration notes

What the four uploads were, what had to be built to join them, and what's
still an open decision.

## Starting point

| Upload | What it actually contained |
|---|---|
| `KaushalSetu.zip` | The repo: `backend/` (generic CRUD over the 17 tables + one Career Twin route), `ml/`, `database/`, `docs/`. `frontend/` was empty; `venv/` was 376 MB of the zip. |
| `skillgrow-gov-portal.zip` | Government Portal, all demonstration data, with a facade naming 10 endpoints it wanted. |
| `skillconnect-trainee-merged__1_.zip` | Trainee Panel, driven by React contexts seeded from `mockData.js` / `appData.js` — no service layer at all. |
| `skillconnect-employer-hybrid.zip` | Employer Panel, hybrid: three functions calling the real backend, everything else mocked, with a guessed endpoint map in `src/config/api.js`. |

So the gap wasn't a base URL — the backend had no auth, no CORS, and none of
the endpoints any panel was asking for.

## What was added to the backend

| File | Purpose |
|---|---|
| `core/config.py` | All settings in one place, read from `.env` |
| `core/security.py` | bcrypt + JWT. bcrypt is called directly, not via passlib — passlib 1.7.4 breaks against bcrypt 5.x, the bug you already hit once |
| `api/deps.py` | Who's calling; demo-identity fallback |
| `api/auth.py` | login / me / register |
| `api/gov.py` + `services/analytics.py` | The whole Government Portal, computed from the real dataset |
| `api/employer.py` + `services/employer_service.py` | Every path the Employer Panel's config file guessed |
| `api/trainee.py` + `services/trainee_service.py` | The Trainee Panel's data |
| `services/demo_store.py` | Test & PS + DigiLocker, in memory |
| `tests/smoke_test.py` | 59 checks against a SQLite fixture |

Three fixes to what was already there:

1. **Route ordering.** `/api/{resource}` was matching before anything else
   could. The generic reader is now registered last in `main.py`; the same
   trap is handled inside routers too (`/gov/districts/trends` before
   `/gov/districts/{id}`, `/employer/assessments/summary` before
   `/employer/assessments/{id}`).
2. **The ML import is lazy.** `from ai_service import get_career_twin` ran at
   module import, so a missing `ml` package or a failed psycopg2 connection
   took the whole API down at startup. It's now imported inside the handler
   and surfaces as a 503.
3. **`password_hash` is stripped** from the generic reader's output. `GET
   /api/users` was returning 100 bcrypt hashes.

## Endpoint map

### Government Portal → `/api/gov/*`

| Panel calls | Route |
|---|---|
| `getStateSummary` | `GET /api/gov/state-summary` |
| `getDistricts` | `GET /api/gov/districts` |
| `getDistrictTrends` | `GET /api/gov/districts/trends` |
| `getDistrict` | `GET /api/gov/districts/{id-or-name}` |
| `getStateSkills` | `GET /api/gov/skills` |
| `getCareerOutcomes` | `GET /api/gov/career-outcomes` |
| `getEarlyWarnings` | `GET /api/gov/early-warning` |
| `getEarlyWarning` | `GET /api/gov/early-warning/{id}` |
| `runSimulation` | `POST /api/gov/policy-simulator/run` |
| `getImpactReport` | `GET /api/gov/impact` |
| — | `POST /api/gov/refresh` (rebuild the cache after re-seeding) |

### Employer Panel → `/api/employer/*`

Every path in `src/config/api.js` is implemented as written, so that file
needed no edits: `profile`, `verification/digilocker`, `jobs` (list / create /
get / update / `{id}/close`), `jobs/{id}/applications`, `jobs/{id}/candidates`,
`analytics`, `skill-demand`, `assessments` (+ `/summary`, `/{id}`,
`/{id}/assign`, `/{id}/submissions`), `submissions/{id}/review`, and
`PATCH /api/applications/{id}/status`.

### Trainee Panel → `/api/trainee/*`

`profile`, `skills`, `occupations`, `skill-gap`, `opportunities`,
`applications` (GET + POST), `notifications`, `peer-benchmark`,
`assessments`, `assessments/{submission_id}/submit`,
`verification/digilocker`.

## How the government numbers are derived

The whole portal is one rollup over the real dataset, cached for
`ANALYTICS_CACHE_TTL` seconds (10k trainees, ~21k applications, ~55k
trainee-skill rows — too much to recompute per request).

| Figure | Derivation |
|---|---|
| Certification rate | Trainees whose best assessment ≥ `PASS_MARK` (50) ÷ trainees |
| Placement rate | Trainees with a `hired` application ÷ certified trainees |
| Retention rate | Latest follow-up per employment, retained ÷ total followed up |
| Average salary | `employment.salary` ÷ 12 — **the column is annual, the portal's cards are monthly** |
| Skill gap (district × skill) | Demand converted to people (`demand_score/100 × district trainees`) vs trainees in that district holding the skill |
| District health score | 0.30 placement + 0.25 retention + 0.20 (100 − gap) + 0.15 certification + 0.10 salary index |
| 8-quarter trend | Real quarterly hire-conversion and retention per district, same weighting |
| Career funnel | trainees → certified → hired → employment rows → retained → follow-ups showing a salary increase |
| Salary progression | Average monthly salary by tenure bucket, from `start_date` |
| Career pathways | Training programme's primary skill → occupation actually hired into, with real tenure and uplift |
| Early warnings | Transparent rules: retention or placement more than 8–10 pp below state average, any skill gap over 40%, or a district up 4+ points year-on-year |
| Impact components | Placement, retention, skill alignment, employment conversion, and share of follow-ups showing salary growth |

Every object carries a `provenance` field: `observed` (measured),
`rule` (derived by a stated rule), or `predicted` (a match score). The
panels already have a `ProvenanceBadge` component for this.

**Policy simulator:** baselines are the district's measured rates; the
projection is a fixed per-intervention weight scaled by quantity and horizon.
No model. The response includes a `method` string stating exactly that — worth
saying out loud in a review rather than letting anyone assume it's ML.

**Intervention effectiveness** on the Impact page is the one table that can't
be measured: it needs a history of deployed interventions, which the platform
doesn't have. It's returned as modelled values, tagged `"provenance": "rule"`
with a `note` saying so, and `deployments: 0`.

## Matching

Applicant and candidate match scores are
`0.55 × skill overlap + 0.15 × average assessment score + 0.15 × prior
employment + 0.15 × same district`, and the breakdown is returned per
dimension so the panel's `MatchScoreBreakdown` renders it. `education` uses
assessment score as a proxy; `career_preference` is omitted entirely, because
trainees have no stored target occupation — the component skips any dimension
it isn't given rather than showing a zero bar.

`jobs/{id}/candidates` returns trainees who match but have **not** applied,
which is what makes that tab different from the applicant list.

## Things kept deliberately

- **Saathi is untouched.** The onboarding chat is fully local and stays that
  way — no file under `components/chat/`, `chatbotScript.js`,
  `useChatSimulation.js` or `AssistantPage.jsx` was modified.
- **The demonstration data stays in every panel.** It's the fallback, not
  dead weight.
- **The employer panel's `ProtectedRoute` dev bypass stays**, since the login
  screen still isn't the way in.

## Open decisions for you / Deven

1. **Assessments and DigiLocker have no tables.** They work end to end —
   create, assign, auto-grade an MCQ, review a problem statement, persist a
   verification — but only for the life of the uvicorn process. DDL is in
   `database/migrations/001_assessments_and_verification.sql`, unapplied.
   Every router goes through `demo_store.py`, so making it persistent is a
   change to one file.
2. **Writes go to the real database by default.** Creating a posting inserts
   into `jobs` and `job_skills`; applying inserts into `applications`; moving
   an application to hired/shortlisted/rejected updates it. `interview` and
   `assessment` aren't values the seeded column uses, so those are held as a
   session override rather than written. Set `ALLOW_DB_WRITES=false` if you'd
   rather the Phase 2 dataset stayed byte-identical for the demo.
3. **The posting form collects more than the schema stores** (description,
   salary band, work mode, openings, deadline, preferred skills). Those live
   in a per-job overlay in memory and are merged over the real row on read. If
   postings matter beyond the demo, `jobs` needs those columns.
4. **`certification` is inferred**, not recorded. There's no certification
   table, so "certified" means "passed an assessment at ≥ 50". The readiness
   model has the same hole — this is the same gap you flagged on Sept 4.
5. **Five occupations have no job postings** (Content Writer, Graphic
   Designer, Tailor, Video Editor, Beautician) — the Phase 2D mapping gap you
   left as-is. They show a 0% placement rate in Skill Intelligence, which is
   accurate but looks odd on screen.
6. **The policy simulator's skill dropdown** still lists the demonstration
   skill names rather than your 65 real ones, since it's a static list in
   `mockGovernmentData.js`. Small change if you want it sourced from
   `getStateSkills()`.

## Authentication (added after the first integration pass)

One sign-in page for all three panels, served by the API itself at `/`
(`backend/app/web/login.html`, rendered by `main.py`). It is plain HTML rather
than a fourth React app so there is no extra dev server to start, and because
no one panel is a natural home for the other two's login.

| Piece | Where |
|---|---|
| The sign-in page | `backend/app/web/login.html` + the `/` route in `backend/app/main.py` |
| Where each role goes | `TRAINEE_PANEL_URL` / `EMPLOYER_PANEL_URL` / `GOV_PORTAL_URL` in config |
| Trainee session | `trainee-panel/src/services/session.js`, `context/AuthContext.jsx`, `components/ProtectedRoute.jsx` |
| Employer session | `employer-panel/` — same three files |
| Government session | `gov-portal/src/services/auth.js`, `context/AuthContext.jsx`, `components/auth/ProtectedRoute.jsx` |

**The cross-origin problem.** Three panels on three ports means three
localStorage scopes, so one login page cannot simply store a token for the
others. The page forwards the browser to the right panel with the token in
the URL fragment; `adoptTokenFromUrl()` reads it, stores it, and calls
`history.replaceState` to wipe it from the address bar. Fragments are never
transmitted to a server, so nothing lands in an access log — but the token is
briefly in the address bar and in session history, which is the honest
weakness here. One host with a shared session cookie is the proper fix.

**The destination is chosen server-side**, from the role on the account, not
from the role button the user pressed. A mismatch is reported and then
followed, so an employer clicking "Trainee" still lands somewhere useful.

Details worth knowing:

- **Session calls never fall back to demo data.** Everything else in each
  panel falls back when the backend is down; `/auth/me` does not. A mock
  session would let anyone in, which is worse than being offline.
- **The employer panel's `BYPASS_AUTH_FOR_DEV = true` constant is gone.** It's
  now `VITE_BYPASS_AUTH`, defaulting to false, in each panel's `.env`.
- **Each panel re-checks the role on load**, not just at sign-in. A token for
  the wrong panel is discarded and the user is sent back to choose again,
  rather than being shown an empty dashboard.
- **The gov router is behind a guard** (`deps.get_current_government`) that is
  permissive while `ALLOW_DEMO_IDENTITY` is true and requires a
  government-role token once it isn't.
- **`SELF_REGISTER_ROLES`** controls which roles the public register form
  accepts. It defaults to all three so the demo can show every sign-up flow —
  drop `government` before this goes anywhere real.
- Passwords under 8 characters are rejected server-side, not just in the form.

## Verified

- `python tests/smoke_test.py` — 69/69 checks pass, including the sign-in
  page rendering with its panel URLs injected, registration,
  duplicate-email rejection, short-password rejection, and a newly registered
  trainee getting their own scoped profile.
- `npm run build` — clean in all three panels.
- Not verified against the real Postgres database (not available here). The
  first thing to check is `GET /api/health`, then
  `/api/gov/state-summary` — if the salary looks 12× too high, the
  annual-to-monthly conversion is the place to look.
