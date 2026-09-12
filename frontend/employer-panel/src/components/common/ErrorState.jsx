import React from "react";
import { WifiOff, AlertTriangle, PlugZap } from "lucide-react";

export default function ErrorState({ error, onRetry }) {
  const status = error?.status;
  const isOffline = status === 0;
  const isUnwired = status === 404;

  const Icon = isOffline ? WifiOff : isUnwired ? PlugZap : AlertTriangle;
  const title = isOffline ? "Backend unreachable" : isUnwired ? "Not connected yet" : "Something went wrong";

  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-warn/30 bg-warn-soft px-6 py-16 text-center">
      <Icon size={22} className="mb-2 text-warn" strokeWidth={1.75} />
      <h3 className="font-display text-base text-ink">{title}</h3>
      <p className="max-w-md text-sm text-ink-soft">
        {error?.message || "The request failed."}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-ink/90"
        >
          Try again
        </button>
      )}
    </div>
  );
}
