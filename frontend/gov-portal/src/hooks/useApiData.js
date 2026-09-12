import { useEffect, useRef, useState } from 'react';

// Generic data-fetching hook. `fetcher` should be a stable function
// (e.g. `() => api.getDistricts()`); pass `deps` to refetch when inputs change.
export function useApiData(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  // oxlint-disable-next-line react-hooks/exhaustive-deps -- deps is intentionally caller-supplied
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetcherRef.current()
      .then((result) => { if (!cancelled) setData(result); })
      .catch((err) => { if (!cancelled) setError(err); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}
