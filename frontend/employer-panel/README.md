# KaushalSetu — Employer Panel (SIH 2026)

A React + Vite frontend for the employer-facing side of KaushalSetu: post jobs/internships,
see skill-matched candidates, run a Test & PS assessment before hiring, verify your company,
and track applicants through a hiring pipeline — brought up to the same "informational and
functional completeness" as the Government Portal and Trainee Panel.

**Hybrid by design, as of this pass:** most of the app now runs on demo data out of the box —
no backend required to open it and click through everything — *except* the live link to actual
trainees, which always talks to your real FastAPI backend. See "Mock vs. real" below before
assuming a page is or isn't hitting your API.

## Getting started

```bash
npm install
cp .env.example .env      # then edit VITE_API_BASE_URL if your backend isn't on :8000
npm run dev
```

Opens on `http://localhost:5174` (the trainee panel uses `5173`, so both can run at once).

## Mock vs. real: `src/services/api.js`

Every page imports from `src/services/api.js` — never directly from `employerService.js` or
`mockEmployerService.js`. That one facade file decides, per function, which implementation runs:

- **Always real, regardless of `USE_MOCK`:** `fetchApplicants`, `fetchCandidateMatches`,
  `updateApplicationStatus`. These represent actual trainees applying to and matching your
  postings — the one part of this panel that's only meaningful when it's live, so it's wired
  to your backend unconditionally.
- **Demo data while `USE_MOCK = true` (the default):** login/session, employer profile +
  DigiLocker verification, postings CRUD, analytics, skill demand, and the whole Test & PS
  module. `src/data/mockEmployerData.js` holds the seed data (3 sample postings, 2 sample
  assessments with sample submissions, sample analytics/skill-demand); `src/services/
  mockEmployerService.js` implements create/update/assign/review against an in-memory copy of
  it, so the demo genuinely responds to what you do in the UI — it just resets on a full reload,
  the same trade-off the Trainee Panel's mock context makes.

**To flip a piece over to your real backend once it's ready:** open `src/services/api.js` and
change that one line from `impl.functionName` to `real.functionName` (or just set
`USE_MOCK = false` at the top to flip everything at once). No page or component needs to
change — this is the same swappable-facade pattern the Government Portal already uses.

**Known trade-off:** because postings are demo data with their own ids (`job-1`, `job-2`, …)
that don't exist in your real database, `fetchApplicants`/`fetchCandidateMatches` against a mock
posting will legitimately come back empty or erroring — that's correct, not a bug, until you
either flip postings over to real data too, or point a mock posting's id at a real job id from
your backend. Once real trainees apply against a *real* posting (`USE_MOCK` off, or a real job
id), applicants show up exactly as before.

## What's new in this pass

### Test & PS assessments
Employers can create either an auto-graded **Test** (MCQ) or a manually-reviewed **Problem
Statement**, always scoped to one posting — the skill checkboxes on the create form are pulled
directly from that posting's `required_skills`, so an assessment is explicitly tied to the
skills it's meant to check (`components/assessments/AssessmentForm.jsx`).

- **Test & PS** (new sidebar item, `/assessments`) lists every assessment across all your
  postings, each showing assigned count, pending-review count, and average score.
- Create one from a posting's detail page (`/postings/:jobId/assessments/new`, skills
  pre-scoped) or from the global page (`/assessments/new`, pick the posting first).
- Assign an existing assessment to a shortlisted applicant directly from their
  `ApplicationCard`, on both the Posting Detail and Applications pages.
- `/assessments/:id` shows every submission; Problem Statement submissions get a manual
  score + feedback form, matching the trainee panel's own Test & PS flow.
- **Dashboard integration** (as asked): Overview now shows "Assessments awaiting review" and
  "Assigned, not yet submitted" stat cards, plus a "Needs your attention" nudge when reviews
  are piling up — pulled from a new `GET /api/employer/assessments/summary` aggregate.

### Company verification
- New **Verification** sidebar item / page (`/verification`): a DigiLocker-style card fetches
  your GSTIN certificate and incorporation/MSME registration, mirroring the trainee panel's own
  DigiLocker verification card.
- **The consent/fetch UI is simulated**, for the same reason as the trainee panel: real
  DigiLocker integration requires onboarding as a Requester via the DigiLocker/API Setu partner
  programme. What happens *after* the simulated fetch — persisting the verified status — is a
  real API call (`POST /api/employer/verification/digilocker`), so it isn't fake all the way
  down.
- Overview shows a "Company verification" stat card, and a nudge appears until you verify.
- Wherever an applicant or suggested candidate's own trainee profile is DigiLocker-verified
  (i.e. the API response includes a `verified`/`digilocker_verified`/`trainee_verified` field),
  a **DigiLocker Verified** badge now appears next to their name in `ApplicationCard` and
  `CandidateCard`. A **Verified only** filter toggle on the Applications page focuses the
  pipeline on them. Both render nothing if the backend doesn't send that field yet — no
  fabricated verification status.

### Data provenance labelling
`components/common/ProvenanceBadge.jsx` tags a candidate's match score as "Model-matched" (it's
a prediction, not a fact) and a company/trainee's verification as "Verified"/"DigiLocker
Verified" — the same Observed/Predicted labelling pattern used across the other two panels,
applied here without needing any new data the backend doesn't already (or soon will) provide.

### Early-warning-style nudges + recommendations
`src/utils/deriveNudges.js` derives Overview's "Needs your attention" panel entirely from data
the page already has: postings with zero applicants, postings closing soon with very few
applicants, a growing assessment-review backlog, and an unverified company. No new endpoint
required for this — it's the Government Portal's Early Warning pattern applied client-side to
data already in hand, the same way the Trainee Panel's notification bell was derived.

### Posting comparison
**My Postings** now has a **Compare** toggle: tick up to 2 postings and see them side by side
(status, applicants, strong matches, deadline, location, work mode) via
`components/postings/PostingCompareCard.jsx` — entirely computed client-side from the jobs list
already fetched, no new endpoint.

### Downloadable hiring report
**Analytics** has a **Download report** button that builds a plain-text summary (funnel,
retention, skill demand) from already-fetched data and triggers a browser download — a
stand-in for a future backend-rendered PDF, same approach as the trainee panel's profile
download.

## The one file you'll actually need to edit: `src/config/api.js`

Unchanged principle from the original build, extended with the new endpoints this pass adds.
**Every single network call in the app goes through the `ENDPOINTS` object in that one file.**
Open your backend's Swagger docs (`http://localhost:8000/docs`), compare the real paths to the
guesses below, and update the strings there — nothing else needs to change.

| Purpose | Assumed path |
|---|---|
| Login | `POST /api/auth/login` → `{ access_token }` |
| Current user | `GET /api/auth/me` |
| Employer profile | `GET /api/employer/profile` (expected to include `verification: { status }` once wired) |
| Verify company via DigiLocker | `POST /api/employer/verification/digilocker` `{ documents }` |
| List/create postings | `GET`/`POST /api/employer/jobs` |
| Get/update one posting | `GET`/`PUT /api/employer/jobs/{id}` |
| Close a posting | `PATCH /api/employer/jobs/{id}/close` |
| Applicants for a posting | `GET /api/employer/jobs/{id}/applications` |
| Suggested candidates | `GET /api/employer/jobs/{id}/candidates` |
| Update application status | `PATCH /api/applications/{id}/status` `{ status }` |
| Analytics | `GET /api/employer/analytics` |
| Skill demand | `GET /api/employer/skill-demand` |
| All assessments | `GET /api/employer/assessments` |
| Assessments for one posting | `GET /api/employer/jobs/{id}/assessments` |
| Create assessment | `POST /api/employer/assessments` `{ job_id, title, type, skills_tested, due_date, … }` |
| One assessment | `GET /api/employer/assessments/{id}` |
| Assign to applicant(s) | `POST /api/employer/assessments/{id}/assign` `{ application_ids }` |
| Submissions for one assessment | `GET /api/employer/assessments/{id}/submissions` |
| Review a submission | `PATCH /api/employer/submissions/{id}/review` `{ score, status, feedback }` |
| Assessments dashboard summary | `GET /api/employer/assessments/summary` |

If an endpoint genuinely doesn't exist on the backend yet, the page shows a "Not connected yet"
state instead of a fake list — it isn't a bug, it's the real state of that integration. This
applies to every new feature above exactly as it did to the original build.

## CORS & auth

Unchanged from the original build — see `.env.example`, `src/lib/apiClient.js`, and
`src/context/AuthContext.jsx`. A 401 anywhere still logs the session out automatically.

## Folder structure

```
src/
├── config/api.js                Base URL + every endpoint path (edit this first)
├── lib/apiClient.js             fetch wrapper: auth header, JSON parsing, error normalization
├── services/
│   ├── api.js                    The facade every page imports — decides mock vs. real per function
│   ├── employerService.js        Real implementation — one function per real API call
│   └── mockEmployerService.js    Demo implementation — in-memory, mutable for the session
├── data/mockEmployerData.js     Seed data behind mockEmployerService.js
├── utils/deriveNudges.js        Client-side Early-Warning-style nudges from already-fetched data
├── hooks/useAsync.js            Loading/error/data lifecycle for any service call
├── context/AuthContext.jsx      Real login/session, restored via GET /me on load
├── components/
│   ├── layout/                  AppShell, Sidebar (+ Test & PS, Verification nav), TopBar
│   ├── common/                  Badge, ProgressBar, StatCard, Spinner, EmptyState, ErrorState,
│   │                             ProvenanceBadge, DownloadHiringReportButton
│   ├── postings/                 JobPostingCard, JobPostingForm, PostingCompareCard
│   ├── candidates/               CandidateCard (+ verified badge), MatchScoreBreakdown
│   ├── applications/             PipelineBoard, ApplicationCard (+ verified badge, assign control)
│   ├── assessments/              AssessmentCard, AssessmentForm, SubmissionRow
│   └── verification/
│       └── DigiLockerBusinessCard.jsx
└── pages/
    ├── LoginPage.jsx
    ├── OverviewPage.jsx          + assessment stats, verification stat, nudges panel
    ├── PostingsPage.jsx          + Compare toggle
    ├── PostingFormPage.jsx / PostingDetailPage.jsx  + Assessments section, assign-to-applicant
    ├── ApplicationsPage.jsx      + Verified-only filter, assign-to-applicant
    ├── AssessmentsPage.jsx / AssessmentFormPage.jsx / AssessmentDetailPage.jsx   (new)
    ├── AnalyticsPage.jsx         + Test & PS performance section, download report
    └── VerificationPage.jsx      (new)
```

## Visual identity

Unchanged: navy ink (`#14213D`), ochre accent (`#C9762C`), Lexend for display text, IBM Plex
Sans for body — see `tailwind.config.js`.

## What's deliberately left out (for now)

Everything the original README listed (employer sign-up, pipeline drag-and-drop, "invite
candidate" action) — plus:

- Auto-grading for MCQ Tests happens server-side once you implement it; this frontend assumes
  a submitted test already carries a `score` and doesn't recompute it.
- Bulk-assign (one assessment → many applicants at once) isn't wired up; the assign control
  is per-applicant. Straightforward to extend once you want it.
