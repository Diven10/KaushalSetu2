import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { adoptTokenFromUrl, fetchMe, getToken, setToken, goToLogin } from '../services/auth';

const AuthContext = createContext(null);

// Signing in happens on the shared page served by the API. This context only
// validates the token that arrives and holds the resulting account.
const GOVERNMENT_ROLES = ['government', 'gov', 'government_user'];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let cancelled = false;

    adoptTokenFromUrl();

    if (!getToken()) {
      setInitializing(false);
      return () => { cancelled = true; };
    }

    fetchMe()
      .then((me) => {
        if (cancelled) return;
        if (!GOVERNMENT_ROLES.includes(me.role)) {
          // A valid token for the wrong panel — back to the sign-in page.
          setToken(null);
          goToLogin();
          return;
        }
        setUser(me);
      })
      .catch(() => {
        setToken(null);
        if (!cancelled) setUser(null);
      })
      .finally(() => { if (!cancelled) setInitializing(false); });

    return () => { cancelled = true; };
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    goToLogin();
  }, []);

  return (
    <AuthContext.Provider value={{ user, initializing, logout, isAuthenticated: Boolean(user) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
