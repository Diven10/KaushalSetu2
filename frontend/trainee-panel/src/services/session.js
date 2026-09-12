// Handoff from the shared sign-in page.
//
// All three panels sit on different ports, so localStorage can't be shared
// between them. The sign-in page (served by the API at http://localhost:8000/)
// forwards the browser here with the token in the URL fragment; this module
// picks it up, stores it, and wipes it out of the address bar.
import { getToken, setToken } from "./traineeService";

export const LOGIN_URL = import.meta.env.VITE_LOGIN_URL || "http://localhost:8000/";

const ROLE = "trainee";
const PREFIX = "#token=";

// Call this before reading the stored token, so a fresh handoff wins.
export function adoptTokenFromUrl() {
  const { hash } = window.location;
  if (!hash.startsWith(PREFIX)) return false;

  const token = decodeURIComponent(hash.slice(PREFIX.length));
  if (token) setToken(token);

  // Don't leave the token sitting in the address bar, history or a screenshot.
  window.history.replaceState({}, "", window.location.pathname + window.location.search);
  return Boolean(token);
}

export function goToLogin({ expired = false } = {}) {
  const params = new URLSearchParams({ from: ROLE });
  if (expired) params.set("expired", "1");
  window.location.replace(`${LOGIN_URL}?${params.toString()}`);
}

export { getToken, setToken };
