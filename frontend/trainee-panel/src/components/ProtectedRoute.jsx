import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { goToLogin } from "../services/session";
import AppShell from "./layout/AppShell";

// Set VITE_BYPASS_AUTH=true in .env to skip the sign-in check while working on
// a page. Never leave it on for a demo.
const BYPASS_AUTH = String(import.meta.env.VITE_BYPASS_AUTH) === "true";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, initializing } = useAuth();
  const redirecting = !BYPASS_AUTH && !initializing && !isAuthenticated;

  useEffect(() => {
    if (redirecting) goToLogin();
  }, [redirecting]);

  if (BYPASS_AUTH) return <AppShell>{children}</AppShell>;

  if (initializing || redirecting) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-paper">
        <p className="text-sm text-ink-soft">
          {redirecting ? "Taking you to sign in…" : "Checking your session…"}
        </p>
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
