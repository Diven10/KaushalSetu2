// Session handling for the Government Portal. Separate from services/api.js
// because none of this may fall back to demonstration data: if the backend is
// unreachable, the session has to fail rather than appear to succeed.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const TOKEN_KEY = 'kaushalsetu_gov_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) =>
  token ? localStorage.setItem(TOKEN_KEY, token) : localStorage.removeItem(TOKEN_KEY);

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => null);
    throw new Error(payload?.detail || `Request failed (${res.status})`);
  }
  return res.json();
}

export const fetchMe = () => request('/auth/me');

// --- handoff from the shared sign-in page -------------------------------
// The three panels are separate origins, so localStorage can't be shared.
// The sign-in page (served by the API at http://localhost:8000/) forwards the
// browser here with the token in the URL fragment; we read it, store it, and
// wipe it from the address bar.
export const LOGIN_URL = import.meta.env.VITE_LOGIN_URL || 'http://localhost:8000/';

const PREFIX = '#token=';

export function adoptTokenFromUrl() {
  const { hash } = window.location;
  if (!hash.startsWith(PREFIX)) return false;

  const token = decodeURIComponent(hash.slice(PREFIX.length));
  if (token) setToken(token);

  window.history.replaceState({}, '', window.location.pathname + window.location.search);
  return Boolean(token);
}

export function goToLogin({ expired = false } = {}) {
  const params = new URLSearchParams({ from: 'government' });
  if (expired) params.set('expired', '1');
  window.location.replace(`${LOGIN_URL}?${params.toString()}`);
}
