import React, { useEffect, useState } from "react";

export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-md bg-line-soft ${className}`} />;
}

// Simulates the brief network delay a real API call would have, so pages
// show a loading state instead of popping in instantly. Swap this out for
// real async data fetching later — the calling page's shape doesn't change.
export function useSimulatedLoad(delayMs = 380) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);
  return loading;
}
