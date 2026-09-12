// ---------------------------------------------------------------------------
// Every backend URL and route path used by this app lives here, and only
// here. No component, page, or service file ever hardcodes a path — they
// all call ENDPOINTS.something. That means if your FastAPI routes are named
// differently than guessed below (check them at {API_BASE_URL}/docs), this
// is the ONLY file you need to edit to make the whole app match.
// ---------------------------------------------------------------------------

// Set VITE_API_BASE_URL in a .env file (see .env.example) to point this at
// wherever your backend actually runs. Falls back to the common local
// FastAPI/uvicorn default.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const ENDPOINTS = {
  // --- auth ---
  login: "/api/auth/login",
  register: "/api/auth/register",
  me: "/api/auth/me",
  districts: "/api/districts",

  // --- employer profile & verification ---
  employerProfile: "/api/employer/profile",
  employerVerificationDigilocker: "/api/employer/verification/digilocker",

  // --- job / internship postings (CRUD, scoped to the logged-in employer) ---
  jobs: "/api/employer/jobs",
  job: (jobId) => `/api/employer/jobs/${jobId}`,
  closeJob: (jobId) => `/api/employer/jobs/${jobId}/close`,

  // --- applicants & matching for one posting ---
  applicants: (jobId) => `/api/employer/jobs/${jobId}/applications`,
  candidateMatches: (jobId) => `/api/employer/jobs/${jobId}/candidates`,

  // --- moving an application through the pipeline ---
  applicationStatus: (applicationId) => `/api/applications/${applicationId}/status`,

  // --- employer-scoped analytics ---
  analytics: "/api/employer/analytics",
  skillDemand: "/api/employer/skill-demand",

  // --- Test & PS assessments ---
  // List (all postings) / create. Create expects { job_id, ... } in the body
  // since an assessment is always scoped to one posting's required skills.
  assessments: "/api/employer/assessments",
  assessmentsForJob: (jobId) => `/api/employer/jobs/${jobId}/assessments`,
  assessment: (assessmentId) => `/api/employer/assessments/${assessmentId}`,
  // Assign an existing assessment to one or more applicants:
  // POST body { application_ids: [...] }
  assessmentAssign: (assessmentId) => `/api/employer/assessments/${assessmentId}/assign`,
  // Submissions from trainees for one assessment (status, score, answers/PS text)
  assessmentSubmissions: (assessmentId) => `/api/employer/assessments/${assessmentId}/submissions`,
  // Manual review/scoring of one submission (mainly for Problem Statements —
  // MCQ tests are expected to auto-grade server-side):
  // PATCH body { score, status, feedback }
  submissionReview: (submissionId) => `/api/employer/submissions/${submissionId}/review`,
  // Small aggregate for the Dashboard: pending review count, assigned-but-
  // not-submitted count, average score, a handful of recent activity items.
  assessmentsSummary: "/api/employer/assessments/summary",
};
