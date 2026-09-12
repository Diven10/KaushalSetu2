import React from "react";
import { GraduationCap } from "lucide-react";
import { COURSES_BY_SKILL } from "../../data/appData";

export default function CourseSuggestionCard({ criticalGaps }) {
  const suggestions = criticalGaps
    .flatMap((g) => (COURSES_BY_SKILL[g.skill] || []).map((c) => ({ ...c, skill: g.skill })))
    .slice(0, 4);

  if (suggestions.length === 0) return null;

  return (
    <div className="rounded-lg border border-line bg-surface p-6">
      <div className="mb-3 flex items-center gap-2">
        <GraduationCap size={16} className="text-accent-dark" />
        <h2 className="text-base font-semibold text-ink">Recommended to close your gaps</h2>
      </div>
      <div className="flex flex-col gap-2.5">
        {suggestions.map((c) => (
          <div key={c.name} className="flex items-center justify-between rounded-md border border-line px-3.5 py-2.5">
            <div>
              <p className="text-sm font-medium text-ink">{c.name}</p>
              <p className="text-xs text-ink-faint">Closes: {c.skill} · {c.hours}h</p>
            </div>
            <button
              type="button"
              className="shrink-0 rounded-md border border-line px-3 py-1.5 text-xs font-medium text-ink hover:border-ink"
            >
              Enroll
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
