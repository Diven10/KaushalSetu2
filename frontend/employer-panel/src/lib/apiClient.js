import { API_BASE_URL } from "../config/api";

const TOKEN_KEY = "skillconnect_employer_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

// Thrown for every failed request. `status` is 0 for a network-level failure
// (backend unreachable), otherwise the HTTP status code. `details` is the
// parsed JSON error body, when there was one.
export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

/**
 * Every real network call in this app goes through here.
 * @param {string} path - one of the paths from src/config/api.js's ENDPOINTS
 * @param {object} options
 * @param {"GET"|"POST"|"PUT"|"PATCH"|"DELETE"} [options.method]
 * @param {object} [options.body] - sent as JSON
 * @param {boolean} [options.auth] - attach the stored bearer token (default true)
 */
export async function apiRequest(path, { method = "GET", body, auth = true, headers = {} } = {}) {
  const finalHeaders = { "Content-Type": "application/json", ...headers };

  if (auth) {
    const token = getToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    throw new ApiError(
      `Couldn't reach the backend at ${API_BASE_URL}. Is the FastAPI server running, and is this app's origin allowed in its CORS settings?`,
      0,
      networkErr
    );
  }

  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : null;

  if (!response.ok) {
    if (response.status === 401) setToken(null);

    if (response.status === 404) {
      throw new ApiError(
        `This endpoint isn't live on the backend yet (404 at ${path}). Check src/config/api.js against your FastAPI routes.`,
        404,
        payload
      );
    }

    const detail = payload?.detail || payload?.message;
    const message =
      typeof detail === "string"
        ? detail
        : Array.isArray(detail)
        ? detail.map((d) => d.msg || JSON.stringify(d)).join("; ")
        : `Request failed (${response.status})`;

    throw new ApiError(message, response.status, payload);
  }

  return payload;
}
