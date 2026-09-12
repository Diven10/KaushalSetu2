import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { fetchMe } from "../services/api";
import { adoptTokenFromUrl, getToken, setToken, goToLogin } from "../services/session";

const AuthContext = createContext(null);

// This panel is for trainees. Signing in happens on the shared page served by
// the API; all this context does is validate the token that arrives and hold
// the resulting user.
const REQUIRED_ROLE = "trainee";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    adoptTokenFromUrl();

    if (!getToken()) {
      setInitializing(false);
      return () => {
        cancelled = true;
      };
    }

    fetchMe()
      .then((me) => {
        if (cancelled) return;
        if (me.role !== REQUIRED_ROLE) {
          // A valid token for the wrong panel — send them back to choose again
          // rather than showing them an empty trainee dashboard.
          setToken(null);
          setError(`That is a ${me.role} account.`);
          goToLogin();
          return;
        }
        setUser(me);
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
    goToLogin();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, initializing, error, logout, isAuthenticated: Boolean(user) }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
