import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { fetchCurrentUser, fetchEmployerProfile } from "../services/api";
import { adoptTokenFromUrl, getToken, setToken, goToLogin } from "../services/session";

const AuthContext = createContext(null);

// Signing in happens on the shared page served by the API. This context only
// validates the token that arrives and holds the resulting account.
const REQUIRED_ROLE = "employer";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [employer, setEmployer] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let cancelled = false;

    adoptTokenFromUrl();

    if (!getToken()) {
      setInitializing(false);
      return () => {
        cancelled = true;
      };
    }

    fetchCurrentUser()
      .then(async (me) => {
        if (cancelled) return;
        if (me.role !== REQUIRED_ROLE) {
          // A valid token for the wrong panel — back to the sign-in page.
          setToken(null);
          goToLogin();
          return;
        }
        setUser(me);
        try {
          setEmployer(await fetchEmployerProfile());
        } catch {
          // The session is still valid even if the profile call fails.
          setEmployer(null);
        }
      })
      .catch(() => {
        setToken(null);
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setInitializing(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setEmployer(null);
    goToLogin();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, employer, initializing, logout, isAuthenticated: Boolean(user) }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
