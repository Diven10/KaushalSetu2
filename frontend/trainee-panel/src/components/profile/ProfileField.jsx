import React from "react";

export default function ProfileField({ label, value }) {
  const display = Array.isArray(value) ? value.join(", ") : value;
  const isEmpty = !display;

  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="text-xs text-ink-faint">{label}</span>
      <span
        className={`text-right text-sm ${isEmpty ? "text-ink-faint italic" : "font-medium text-ink"}`}
      >
        {isEmpty ? "Not yet shared" : display}
      </span>
    </div>
  );
}
