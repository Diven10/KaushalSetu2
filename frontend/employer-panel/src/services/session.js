// Handoff from the shared sign-in page served by the API at
// http://localhost:8000/. See the trainee panel's copy for the full rationale:
// the panels are separate origins, so the token travels in the URL fragment
// and is wiped from the address bar the moment it's read.
import { getToken, setToken } from "../lib/apiClient";

export const LOGIN_URL = import.meta.env.VITE_LOGIN_URL || "http://localhost:8000/";

const ROLE = "employer";
const PREFIX = "#token=";

export function adoptTokenFromUrl() {
  const { hash } = window.location;
  if (!hash.startsWith(PREFIX)) return false;

  const token = decodeURIComponent(hash.slice(PREFIX.length));
  if (token) setToken(token);

  window.history.replaceState({}, "", window.location.pathname + window.location.search);
  return Boolean(token);
}

export function goToLogin({ expired = false } = {}) {
  const params = new URLSearchParams({ from: ROLE });
  if (expired) params.set("expired", "1");
  window.location.replace(`${LOGIN_URL}?${params.toString()}`);
}

export { getToken, setToken };
