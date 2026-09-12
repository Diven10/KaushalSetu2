// Every page imports from THIS file, never directly from employerService or
// mockEmployerService.
//
// All of it now calls the real FastAPI backend. If a call fails because the
// backend is unreachable or the route isn't live, it falls back to the
// in-session demo implementation rather than leaving the page empty — except
// for the three functions below, which represent real trainees applying and
// matching and therefore have no meaningful demo equivalent.
//
//   VITE_API_BASE_URL  where the backend lives (default http://localhost:8000)
//   VITE_USE_MOCK      "true" forces demo data for everything fallback-able
//   VITE_NO_FALLBACK   "true" surfaces backend errors instead of falling back
import * as real from "./employerService";
import * as mock from "./mockEmployerService";

export const USE_MOCK = String(import.meta.env.VITE_USE_MOCK) === "true";
const NO_FALLBACK = String(import.meta.env.VITE_NO_FALLBACK) === "true";

export const dataSource = { current: USE_MOCK ? "demo" : "unknown", lastError: null };

// real first, demo second
function withFallback(realFn, mockFn) {
  return async (...args) => {
    if (USE_MOCK) return mockFn(...args);
    try {
      const result = await realFn(...args);
      dataSource.current = "live";
      return result;
    } catch (err) {
      dataSource.current = "demo";
      dataSource.lastError = err;
      if (NO_FALLBACK) throw err;
      // eslint-disable-next-line no-console
      console.warn(`[api] ${realFn.name}: falling back to demo data — ${err.message}`);
      return mockFn(...args);
    }
  };
}

// --- always real, never faked: the live trainee-application link ---
export const fetchApplicants = real.fetchApplicants;
export const fetchCandidateMatches = real.fetchCandidateMatches;
export const updateApplicationStatus = real.updateApplicationStatus;

// --- auth ---
// Signing in happens on the shared page served by the API, so only the
// session check lives here. It is deliberately NOT behind the mock fallback:
// if the backend is unreachable the session must fail, not quietly succeed.
export const fetchCurrentUser = USE_MOCK ? mock.fetchCurrentUser : real.fetchCurrentUser;

// --- profile ---
export const fetchEmployerProfile = withFallback(real.fetchEmployerProfile, mock.fetchEmployerProfile);
export const verifyEmployerViaDigiLocker = withFallback(
  real.verifyEmployerViaDigiLocker,
  mock.verifyEmployerViaDigiLocker
);

// --- postings ---
export const fetchJobs = withFallback(real.fetchJobs, mock.fetchJobs);
export const fetchJob = withFallback(real.fetchJob, mock.fetchJob);
export const createJob = withFallback(real.createJob, mock.createJob);
export const updateJob = withFallback(real.updateJob, mock.updateJob);
export const closeJob = withFallback(real.closeJob, mock.closeJob);

// --- analytics ---
export const fetchAnalytics = withFallback(real.fetchAnalytics, mock.fetchAnalytics);
export const fetchSkillDemand = withFallback(real.fetchSkillDemand, mock.fetchSkillDemand);

// --- Test & PS assessments ---
export const fetchAllAssessments = withFallback(real.fetchAllAssessments, mock.fetchAllAssessments);
export const fetchAssessmentsForJob = withFallback(real.fetchAssessmentsForJob, mock.fetchAssessmentsForJob);
export const fetchAssessment = withFallback(real.fetchAssessment, mock.fetchAssessment);
export const createAssessment = withFallback(real.createAssessment, mock.createAssessment);
export const assignAssessment = withFallback(real.assignAssessment, mock.assignAssessment);
export const fetchAssessmentSubmissions = withFallback(
  real.fetchAssessmentSubmissions,
  mock.fetchAssessmentSubmissions
);
export const reviewSubmission = withFallback(real.reviewSubmission, mock.reviewSubmission);
export const fetchAssessmentsSummary = withFallback(
  real.fetchAssessmentsSummary,
  mock.fetchAssessmentsSummary
);
