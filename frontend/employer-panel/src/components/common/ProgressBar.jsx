import React from "react";

export default function ProgressBar({ value, tone = "accent", label }) {
  const clamped = Math.max(0, Math.min(100, value ?? 0));
  const toneClass = tone === "success" ? "bg-success" : tone === "ink" ? "bg-ink" : "bg-accent";

  return (
    <div className="w-full">
      {label && (
        <div className="mb-1.5 flex items-center justify-between text-xs text-ink-soft">
          <span>{label}</span>
          <span className="font-medium text-ink">{clamped}%</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-line-soft">
        <div
          className={`h-full origin-left rounded-full ${toneClass} transition-transform duration-700 ease-out`}
          style={{ transform: `scaleX(${clamped / 100})`, width: "100%" }}
        />
      </div>
    </div>
  );
}
