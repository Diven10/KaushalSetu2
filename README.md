# KaushalSetu

One backend, one database, three panels.

```
KaushalSetu/
├── backend/          FastAPI — the only thing that talks to Postgres
│   ├── app/
│   │   ├── api/      auth, gov, employer, trainee, routes (generic + Career Twin)
│   │   ├── core/     config, database, security
│   │   ├── models/   SQLAlchemy ORM for all 17 tables
│   │   ├── schemas/  Pydantic schemas
│   │   └── services/ analytics, employer_service, trainee_service, demo_store
│   ├── scripts/      set_password.py
│   └── tests/        smoke_test.py (offline, no Postgres needed)
├── ml/               Career Digital Twin, skill gap, readiness, predictors
├── database/         full backup + optional migration
├── docs/             API contract, architecture, schema notes
└── frontend/
    ├── trainee-panel/    port 5173
    ├── employer-panel/   port 5174
    └── gov-portal/       port 5175
```

Read `INTEGRATION.md` for what was wired to what, the full endpoint map, and
the open decisions. Read `DEPLOYMENT.md` before putting any of this on the
internet — a few of the defaults here are laptop-only defaults.

## Running it

### 1. Backend

```bash
cd backend
cp .env.example .env          # then edit DATABASE_URL and JWT_SECRET_KEY
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

Or use `start-backend.ps1` (Windows) / `start-backend.sh`.

Check it came up: <http://localhost:8000/api/health> should report
`"database": "connected"` with the row counts from your seeded database.
The full route list is at <http://localhost:8000/docs>.

### 2. Panels

```bash
cd frontend/trainee-panel && npm install && npm run dev     # 5173
cd frontend/employer-panel && npm install && npm run dev    # 5174
cd frontend/gov-portal && npm install && npm run dev        # 5175
```

Or `start-frontends.ps1` / `start-frontends.sh` to launch all three.

Each panel has its own `.env` with `VITE_API_BASE_URL`. The ports are pinned
because the backend's CORS allow-list covers 5173–5175, and because the
sign-in page forwards to those addresses (configurable via
`TRAINEE_PANEL_URL` / `EMPLOYER_PANEL_URL` / `GOV_PORTAL_URL` in
`backend/.env`).

Start here: **<http://localhost:8000/>** — the shared sign-in page.

## How the panels find their data

Every panel reads through one file — its `src/services/api.js`. That file
calls the backend first and falls back to the panel's bundled demonstration
data if the backend is unreachable or a route errors. A demo never shows a
blank screen, and you can see which one you got in the browser console.

Three switches, per panel, in its `.env`:

| Variable | Effect |
|---|---|
| `VITE_API_BASE_URL` | Where the backend is |
| `VITE_USE_MOCK=true` | Skip the backend entirely, use demonstration data |
| `VITE_NO_FALLBACK=true` | Surface backend errors instead of hiding them — use this while debugging |

One exception, kept from the original design: in the Employer Panel,
`fetchApplicants`, `fetchCandidateMatches` and `updateApplicationStatus`
never fall back. Those represent real trainees applying and matching, and a
faked version of them would be misleading.

## Logging in

There is **one sign-in page for the whole platform**, served by the API at
<http://localhost:8000/>. Pick Trainee, Employer or Government, sign in, and
it forwards you to the matching panel. There is no separate login screen
inside each panel any more.

Open any panel without a session and it sends you to that page, with your
role pre-selected. Signing out does the same.

**How the handoff works.** The panels are three different origins, so they
can't share a stored session. The sign-in page passes the token in the URL
fragment (`#token=...`); the panel reads it, saves it, and strips it from the
address bar immediately. Fragments are never sent to a server, so the token
doesn't end up in logs — but it does briefly exist in the address bar, which
is the weakest point of this design. Putting all three panels behind one host
with a shared session cookie is the real fix, and worth doing before this is
anything more than a demo.

**Which panel you land on is decided by the server**, from the role on your
account — not by the button you clicked. Sign in with an employer account
after clicking "Trainee" and it tells you, then takes you to the employer
panel.

**Registration is open to all three roles.** Anyone can create a trainee,
employer or government account. That last one should not survive contact with
a real deployment — drop it before then, in `backend/.env`:

```
SELF_REGISTER_ROLES=trainee,employer
```

**Existing seeded accounts have generated passwords you don't know.** To sign
in as one of the 10,000 seeded trainees or an employer with real postings
behind them, set a password on it first:

```bash
cd backend
python scripts/set_password.py --list          # see some accounts per role
python scripts/set_password.py employer7@example.com
```

That is the better demo: a seeded employer already has postings, applicants
and analytics, where a freshly registered one starts empty.

**One important switch.** `ALLOW_DEMO_IDENTITY=true` still lets
unauthenticated API calls through as a demo account, which is what let the
panels work before sign-in existed. Leave it on and the sign-in page is
decorative — anyone who navigates straight to a panel with
`VITE_BYPASS_AUTH=true`, or who calls the API directly, still gets data. Set
it to `false` in `backend/.env` once you're happy the flow works:

```
ALLOW_DEMO_IDENTITY=false
```

With it off, the Government Portal also starts requiring a government-role
token, not just any token.

## Safety valves

- `ALLOW_DB_WRITES=false` — nothing is inserted or updated in Postgres. New
  postings, applications and pipeline moves are kept in memory for the
  session. Use this if you want the validated Phase 2 dataset left untouched.
- `ENABLE_ML=false` — `/api/career-twin` returns a clean 503 instead of
  loading the `ml` package.
- The Test & PS module and DigiLocker verification are **in-memory only**.
  They add no tables to your schema. `database/migrations/001_*.sql` has the
  DDL if you later decide to make them persistent.

## Testing without Postgres

```bash
cd backend
python tests/smoke_test.py
```

Builds a small SQLite database with the same schema and shape of data, then
calls every endpoint the three panels use and checks the response shapes —
59 checks, a few seconds. It catches wiring mistakes (bad routes, missing
keys, route-ordering bugs) but is not a substitute for running against the
real seeded dataset.
