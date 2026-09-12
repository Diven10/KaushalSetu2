// Real network calls. Nothing in here catches errors — the facade in
// services/api.js decides what to do when a call fails.
import { API_BASE_URL, ENDPOINTS } from "../config/api";

const TOKEN_KEY = "kaushalsetu_trainee_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) =>
  token ? localStorage.setItem(TOKEN_KEY, token) : localStorage.removeItem(TOKEN_KEY);

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.json().catch(() => null);
    throw new Error(detail?.detail || `Request failed (${res.status}) on ${path}`);
  }
  return res.status === 204 ? null : res.json();
}

export const login = (email, password) =>
  request(ENDPOINTS.login, { method: "POST", auth: false, body: { email, password } });

export const register = (payload) =>
  request(ENDPOINTS.register, { method: "POST", auth: false, body: { ...payload, role: "trainee" } });

export const fetchMe = () => request(ENDPOINTS.me);
export const fetchDistricts = () => request(ENDPOINTS.districts, { auth: false });

export const fetchProfile = () => request(ENDPOINTS.profile);
export const fetchSkills = () => request(ENDPOINTS.skills);
export const fetchOccupations = () => request(ENDPOINTS.occupations);
export const fetchOpportunities = (limit = 12) =>
  request(`${ENDPOINTS.opportunities}?limit=${limit}`);
export const fetchApplications = () => request(ENDPOINTS.applications);
export const applyToJob = (jobId) =>
  request(ENDPOINTS.applications, { method: "POST", body: { job_id: jobId } });
export const fetchNotifications = () => request(ENDPOINTS.notifications);
export const fetchPeerBenchmark = () => request(ENDPOINTS.peerBenchmark);
export const fetchAssessments = () => request(ENDPOINTS.assessments);
export const submitAssessment = (submissionId, payload) =>
  request(ENDPOINTS.submitAssessment(submissionId), { method: "POST", body: payload });
export const fetchVerification = () => request(ENDPOINTS.verification);
export const saveVerification = (documents) =>
  request(ENDPOINTS.verification, { method: "POST", body: { documents } });

// Target occupation can be given by name (what the role dropdown has) or id.
export function fetchSkillGap(occupation) {
  if (!occupation) return request(ENDPOINTS.skillGap);
  const key = typeof occupation === "number" ? "occupation_id" : "occupation";
  return request(`${ENDPOINTS.skillGap}?${key}=${encodeURIComponent(occupation)}`);
}
