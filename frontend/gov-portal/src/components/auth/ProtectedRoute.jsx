import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { goToLogin } from '../../services/auth';

// Set VITE_BYPASS_AUTH=true in .env to skip the sign-in check while working on
// a page. Never leave it on for a demo.
const BYPASS_AUTH = String(import.meta.env.VITE_BYPASS_AUTH) === 'true';

export default function ProtectedRoute() {
  const { isAuthenticated, initializing } = useAuth();
  const redirecting = !BYPASS_AUTH && !initializing && !isAuthenticated;

  useEffect(() => {
    if (redirecting) goToLogin();
  }, [redirecting]);

  if (BYPASS_AUTH) return <Outlet />;

  if (initializing || redirecting) {
    return (
      <div style={{ padding: 40, color: 'var(--grey-500)', fontSize: 13.5 }}>
        {redirecting ? 'Taking you to sign in…' : 'Checking your session…'}
      </div>
    );
  }

  return <Outlet />;
}
