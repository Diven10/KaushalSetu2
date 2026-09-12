# KaushalSetu — Trainee Panel (SIH 2026) — Merged Build

A React + Vite frontend for the trainee-facing panel of KaushalSetu: a conversational
assistant ("Saathi") that builds a trainee's profile, plus dashboard, career journey,
applications, assessments (Test & PS), and skills/opportunities views — brought up to
the same "informational and functional completeness" as the Government Portal
(`skillgrow-gov-portal`): live status tracking, provenance-labelled data, peer
benchmarking, an early-warning-style nudge system, and a What-If simulator.

This is a **frontend-only prototype**. All data is mocked in `src/data/`, and the
chatbot is a fully scripted state machine — no AI API or backend is called yet. Every
mock module is isolated so a real FastAPI backend can replace it without touching
components, the same pattern used in the Government Portal's `services/api.js` facade.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (defaults to `http://localhost:5173`).

```bash
npm run build      # production build -> dist/
npm run preview    # serve the production build locally
```

## What's new in this build

### Application tracking
- `Apply` on any opportunity card (Dashboard, Skills & Opportunities, or the new
  opportunity detail page at `/skills/:id`) creates a tracked application.
- **My Applications** (`/applications`) shows every application moving through
  Applied → Shortlisted → Assessment → Interview → Hired, with a compact status
  track and a running history log per application.

### Assessments — "Test & PS" module
- Employers can assign either an auto-graded MCQ **test** or a free-form
  **Problem Statement (PS)** before hiring — modelled in `src/data/appData.js`
  (`SEED_ASSESSMENTS`) and driven end-to-end from `AppDataContext`.
- **Assessments** (`/assessments`) lists what's pending vs. submitted/evaluated.
  Opening one (`/assessments/:id`) walks: brief → start → attempt (timed MCQ runner
  or PS write-up + optional file) → result, with pass/fail measured against the
  assessment's threshold.
- A passed assessment surfaces as a nudge and (in a real backend) would mint a
  "Verified Skill" signal visible to the employer alongside the application.

### Early-warning-style nudges
- `AppDataContext` derives a live notification list (incomplete profile, pending
  verification, assessments due soon, application status changes, assessment
  results) — surfaced via the bell icon in the sidebar and a "Needs your attention"
  panel on the Dashboard. Same idea as the Government Portal's Early Warning
  system, scaled down to one person instead of a district.

### DigiLocker verification
- `My Profile → Verification` now offers **Connect DigiLocker** alongside the
  existing manual/self-attested flow (`components/verification/DigiLockerCard.jsx`).
  It simulates a consent screen and a document fetch (Aadhaar e-KYC, marksheet,
  training certificate), then marks both identity and certificate as Verified with
  a `DigiLocker` provenance tag — a stronger, government-sourced tier distinct from
  self-attestation.
- **Real DigiLocker integration requires onboarding as a "Requester" through the
  DigiLocker / API Setu partner programme** — this mock is a swappable stand-in for
  that, exactly like the rest of the mock data layer.

### Data provenance labelling
- `components/common/ProvenanceBadge.jsx` tags data as Self-reported / Verified /
  DigiLocker Verified / Projected / Assessment-verified wherever it appears (profile
  sections, wage progression, opportunity match %, peer benchmarks, simulator
  output) — mirroring the Government Portal's Observed/Predicted/Recommended
  badges, at individual scale.

### Skill intelligence upgrades
- A readiness **trend line** (4-month history) alongside the existing current-vs-
  required skill gap chart.
- **Recommended courses** next to critical skill gaps, keyed by skill
  (`COURSES_BY_SKILL`).
- **Peer benchmarking** — anonymised average wage and time-to-placement for
  trainees pursuing the same role, the personal-scale equivalent of the Government
  Portal's district comparison.
- **Filters** (location, wage band, job type) on Skills & Opportunities.

### Career Journey made real + a What-If simulator
- The timeline now interleaves live application and assessment events with the
  base training/placement narrative, instead of showing only fixed demo data.
- A transparent **What-If simulator** (`components/journey/WhatIfSimulator.jsx`):
  pick a skill to improve, run it, see baseline → projected readiness and wage —
  clearly labelled as projected, not guaranteed, the same spirit as the Government
  Portal's Policy Simulator.

### Downloadable profile
- **Download profile summary** on My Profile builds a plain-text summary client-side
  and triggers a browser download — a stand-in for a future backend-rendered PDF.

### Language toggle (EN / हिंदी / मराठी)
- `LanguageContext` + `src/i18n/translations.js` cover navigation and page headers.
  This is a **working scaffold, not full coverage** — the chatbot script and mock
  data strings are the next things to translate once this is backed by a real API;
  noted here the same way the Government Portal documents its own trade-offs.

## Folder structure

```
src/
├── main.jsx                     LanguageProvider → ProfileProvider → AppDataProvider → App
├── App.jsx                      Route definitions
│
├── context/
│   ├── ProfileContext.jsx       Profile fields, completeness, verification + DigiLocker connect
│   ├── AppDataContext.jsx       Applications, assessments, derived notifications, opportunities
│   └── LanguageContext.jsx      t() translation helper + language switch
│
├── i18n/
│   └── translations.js          EN / HI / MR string tables
│
├── data/
│   ├── chatbotScript.js         Saathi's scripted conversation (unchanged)
│   ├── mockData.js              Roles, skill-gap matrix, opportunities, journey, wages
│   └── appData.js               Applications, assessments, courses, benchmarks,
│                                 readiness history, DigiLocker document types
│
├── components/
│   ├── layout/                  AppShell, Sidebar (+ bell, language toggle), TopBar
│   ├── chat/                    Unchanged from the base assistant build
│   ├── profile/, profilepage/   ProfilePanel, EditableField, DownloadReportButton
│   ├── verification/
│   │   └── DigiLockerCard.jsx   Consent → fetch → verified flow
│   ├── applications/
│   │   ├── ApplicationStatusTrack.jsx
│   │   └── ApplicationRow.jsx
│   ├── assessments/
│   │   ├── AssessmentCard.jsx
│   │   ├── McqRunner.jsx
│   │   └── PsSubmission.jsx
│   ├── skills/                  SkillGapChart, ReadinessTrendChart,
│   │                             CourseSuggestionCard, PeerBenchmarkCard, OpportunityCard
│   ├── journey/                 TimelineNode, WhatIfSimulator
│   ├── notifications/
│   │   └── NotificationBell.jsx
│   └── common/                  Badge, ProgressBar, ProvenanceBadge, EmptyState, Skeleton,
│                                 LanguageToggle
│
└── pages/
    ├── DashboardPage.jsx        Stats, nudges panel, matched opportunities
    ├── AssistantPage.jsx        Chat + live profile panel + stepper (unchanged)
    ├── MyProfilePage.jsx        Editable profile + Verification + DigiLocker + download
    ├── CareerJourneyPage.jsx    Timeline (+ live events) + wage chart + What-If simulator
    ├── SkillsOpportunitiesPage.jsx  Gap chart, trend, courses, benchmark, filters, list
    ├── OpportunityDetailPage.jsx    /skills/:id
    ├── ApplicationsPage.jsx         /applications
    ├── AssessmentsPage.jsx          /assessments
    └── AssessmentDetailPage.jsx     /assessments/:id
```

## Design notes

Unchanged from the base build: Lexend + IBM Plex Sans, the navy/ochre gov-tech
palette, small deliberate motion, `prefers-reduced-motion` respected globally.

## Swapping in a real backend / AI later

- `AppDataContext` is the seam: replace its in-memory `useState` arrays and mock
  actions (`applyToJob`, `submitMcqAssessment`, …) with real API calls — no
  component using `useAppData()` needs to change shape.
- `DigiLockerCard`'s mocked consent/fetch timeout is where the real DigiLocker
  Requester API call goes once your organisation is onboarded.
- `ProfileContext`'s `connectDigiLocker` already models the data shape (documents
  array with issuer + fetch date) a real integration would populate.
- `useChatSimulation`'s scripted `pushBotStep` calls are still the place to swap in
  real LLM-driven dialogue, as in the original build.

## Known trade-offs (given hackathon time constraints)

- Language toggle covers navigation/headers only, not full string coverage — see above.
- No true async loading (this app has no real network calls yet), so `useSimulatedLoad`
  is provided but only lightly used — wire it up per-page once real API calls land.
- MCQ scoring and PS review are entirely client-side/mocked; a real backend would
  auto-grade server-side and give employers a manual-review queue for PS submissions.
