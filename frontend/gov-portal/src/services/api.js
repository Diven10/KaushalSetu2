// The single seam between the UI and the data layer. Every page and component
// imports from here, never from mockApi or mockGovernmentData directly.
//
// Each method now calls the real FastAPI backend and falls back to the mock
// response if the backend is unreachable or errors, so the portal is never a
// blank screen during a demo. `dataSource` tells you which one you got.
//
//   VITE_API_BASE_URL  where the backend lives (default http://localhost:8000/api)
//   VITE_USE_MOCK      set to "true" to force demonstration data
//   VITE_NO_FALLBACK   set to "true" to surface backend errors instead of
//                      silently falling back (use this while debugging)
import { mockApi } from './mockApi';
import { getToken } from './auth';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const USE_MOCK = String(import.meta.env.VITE_USE_MOCK) === 'true';
const NO_FALLBACK = String(import.meta.env.VITE_NO_FALLBACK) === 'true';

// 'live' once any real call has succeeded, 'demo' if we've fallen back.
export const dataSource = { current: USE_MOCK ? 'demo' : 'unknown', lastError: null };

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`API error ${res.status} on ${path}`);
  return res.json();
}

// Wraps one endpoint: real first, mock second.
function endpoint(realFn, mockFn) {
  return async (...args) => {
    if (USE_MOCK) return mockFn(...args);
    try {
      const result = await realFn(...args);
      dataSource.current = 'live';
      return result;
    } catch (err) {
      dataSource.current = 'demo';
      dataSource.lastError = err;
      if (NO_FALLBACK) throw err;
      // eslint-disable-next-line no-console
      console.warn(`[api] falling back to demonstration data: ${err.message}`);
      return mockFn(...args);
    }
  };
}

const postJson = (body) => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export const api = {
  getStateSummary: endpoint(
    () => request('/gov/state-summary'),
    () => mockApi.getStateSummary(),
  ),
  getDistricts: endpoint(
    () => request('/gov/districts'),
    () => mockApi.getDistricts(),
  ),
  getDistrict: endpoint(
    (idOrName) => request(`/gov/districts/${encodeURIComponent(idOrName)}`),
    (idOrName) => mockApi.getDistrict(idOrName),
  ),
  getDistrictTrends: endpoint(
    () => request('/gov/districts/trends'),
    () => mockApi.getDistrictTrends(),
  ),
  getStateSkills: endpoint(
    () => request('/gov/skills'),
    () => mockApi.getStateSkills(),
  ),
  getCareerOutcomes: endpoint(
    () => request('/gov/career-outcomes'),
    () => mockApi.getCareerOutcomes(),
  ),
  getEarlyWarnings: endpoint(
    () => request('/gov/early-warning'),
    () => mockApi.getEarlyWarnings(),
  ),
  getEarlyWarning: endpoint(
    (id) => request(`/gov/early-warning/${encodeURIComponent(id)}`),
    (id) => mockApi.getEarlyWarning(id),
  ),
  runSimulation: endpoint(
    (params) => request('/gov/policy-simulator/run', postJson(params)),
    (params) => mockApi.runSimulation(params),
  ),
  getImpactReport: endpoint(
    () => request('/gov/impact'),
    () => mockApi.getImpactReport(),
  ),
};
