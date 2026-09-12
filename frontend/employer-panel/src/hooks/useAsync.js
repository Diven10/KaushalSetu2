import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Runs an async function (a real API call) and tracks its lifecycle.
 * Re-runs whenever `deps` change. Every page in this app uses this instead
 * of holding fake placeholder data while "loading".
 */
export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const run = useCallback(() => {
    let cancelled = false;
    setState((prev) => ({ data: prev.data, loading: true, error: null }));

    fnRef
      .current()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (!cancelled) setState({ data: null, loading: false, error });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => run(), [run]);

  return { ...state, reload: run };
}
