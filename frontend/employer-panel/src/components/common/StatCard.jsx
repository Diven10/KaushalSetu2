import React from "react";

// Matches the Government Portal's metric tiles: an uppercase label, the value
// set in IBM Plex Mono with tabular figures so columns of numbers align, and a
// quiet sublabel underneath.
export default function StatCard({ icon: Icon, label, value, sublabel, accentColor = "text-accent" }) {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-line bg-surface p-5 shadow-panel">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-faint">{label}</span>
        {Icon && <Icon size={16} className={accentColor} strokeWidth={2} />}
      </div>
      <div>
        <p className="figure text-2xl font-semibold leading-none text-navy-900">{value}</p>
        {sublabel && <p className="mt-1.5 text-xs text-ink-soft">{sublabel}</p>}
      </div>
    </div>
  );
}
