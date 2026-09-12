// The seam between this panel's UI and its data.
//
// Pages and contexts import from here. Each call hits the real FastAPI
// backend and falls back to the bundled demonstration data when the backend
// is unreachable, so the panel — including Saathi, the onboarding chat, which
// is entirely local by design — always works in a demo.
//
//   VITE_API_BASE_URL  where the backend lives (default http://localhost:8000)
//   VITE_USE_MOCK      "true" forces demonstration data
//   VITE_NO_FALLBACK   "true" surfaces backend errors instead of falling back
import * as real from "./traineeService";
import { RECOMMENDED_OPPORTUNITIES, SKILL_GAP_MATRIX } from "../data/mockData";
import { OPPORTUNITY_DETAILS, SEED_APPLICATIONS } from "../data/appData";

export const USE_MOCK = String(import.meta.env.VITE_USE_MOCK) === "true";
const NO_FALLBACK = String(import.meta.env.VITE_NO_FALLBACK) === "true";

export const dataSource = { current: USE_MOCK ? "demo" : "unknown", lastError: null };

function withFallback(realFn, fallbackFn) {
  return async (...args) => {
    if (USE_MOCK) return fallbackFn(...args);
    try {
      const result = await realFn(...args);
      dataSource.current = "live";
      return result;
    } catch (err) {
      dataSource.current = "demo";
      dataSource.lastError = err;
      if (NO_FALLBACK) throw err;
      // eslint-disable-next-line no-console
      console.warn(`[api] falling back to demonstration data — ${err.message}`);
      return fallbackFn(...args);
    }
  };
}

const demoOpportunities = () =>
  RECOMMENDED_OPPORTUNITIES.map((op) => ({ ...op, ...(OPPORTUNITY_DETAILS[op.id] || {}) }));

// The live opportunity list carries the backend's own fields; merge in the
// richer copy for any opportunity the demo data also describes.
const mergeDetail = (list) =>
  list.map((op) => ({ ...(OPPORTUNITY_DETAILS[op.id] || {}), ...op }));

export const fetchOpportunities = withFallback(
  async (limit) => mergeDetail(await real.fetchOpportunities(limit)),
  () => demoOpportunities()
);

export const fetchApplications = withFallback(
  () => real.fetchApplications(),
  () => SEED_APPLICATIONS
);

export const fetchSkillGap = withFallback(
  async (occupation) => {
    const result = await real.fetchSkillGap(occupation);
    return { ...result, rows: result.rows || [] };
  },
  (occupation) => ({
    occupation,
    rows: SKILL_GAP_MATRIX[occupation] || SKILL_GAP_MATRIX.default,
    matchScore: null,
    criticalGaps: [],
    provenance: "demo",
  })
);

export const fetchProfile = withFallback(() => real.fetchProfile(), () => null);
export const fetchSkills = withFallback(() => real.fetchSkills(), () => []);
export const fetchOccupations = withFallback(() => real.fetchOccupations(), () => []);
export const fetchNotifications = withFallback(() => real.fetchNotifications(), () => []);
export const fetchPeerBenchmark = withFallback(() => real.fetchPeerBenchmark(), () => ({}));
export const fetchAssessments = withFallback(() => real.fetchAssessments(), () => []);

// Writes are attempted but never block the UI: the panel keeps its own
// optimistic copy either way (see AppDataContext).
export async function applyToJob(jobId) {
  if (USE_MOCK || !jobId) return null;
  try {
    return await real.applyToJob(jobId);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`[api] application not persisted to the backend — ${err.message}`);
    return null;
  }
}

// Auth is deliberately NOT behind the fallback: if the backend is
// unreachable, a sign-in must fail loudly rather than appear to succeed.
export const login = real.login;
export const register = real.register;
export const fetchMe = real.fetchMe;
export const fetchDistricts = real.fetchDistricts;
export const setToken = real.setToken;
export const getToken = real.getToken;
