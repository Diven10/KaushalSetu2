import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Banknote, Briefcase, Check } from "lucide-react";
import { useAppData } from "../../context/AppDataContext";

export default function OpportunityCard({ opportunity }) {
  const { hasApplied, applyToJob } = useAppData();
  const applied = hasApplied(opportunity.id);
  const matchTone =
    opportunity.match >= 75 ? "bg-success-soft text-success" : opportunity.match >= 55 ? "bg-accent-soft text-accent-dark" : "bg-line-soft text-ink-soft";

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-5 transition-colors hover:border-ink-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink">{opportunity.role}</p>
          <p className="text-xs text-ink-soft">{opportunity.employer}</p>
        </div>
        <span className={`shrink-0 rounded-sm px-2 py-1 text-xs font-medium ${matchTone}`}>
          {opportunity.match}% match
        </span>
      </div>

      <div className="flex flex-col gap-1.5 text-xs text-ink-faint">
        <span className="flex items-center gap-1.5">
          <MapPin size={13} /> {opportunity.location}
        </span>
        <span className="flex items-center gap-1.5">
          <Banknote size={13} /> {opportunity.wage}
        </span>
        <span className="flex items-center gap-1.5">
          <Briefcase size={13} /> {opportunity.type}
        </span>
      </div>

      <div className="mt-1 flex items-center gap-2">
        <Link
          to={`/skills/${opportunity.id}`}
          className="rounded-md border border-line px-3.5 py-1.5 text-xs font-medium text-ink transition-colors hover:border-ink hover:bg-paper"
        >
          View details
        </Link>
        <button
          type="button"
          disabled={applied}
          onClick={() => applyToJob(opportunity)}
          className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors ${
            applied ? "cursor-default bg-success-soft text-success" : "bg-ink text-paper hover:opacity-90"
          }`}
        >
          {applied ? (
            <>
              <Check size={13} /> Applied
            </>
          ) : (
            "Apply"
          )}
        </button>
      </div>
    </div>
  );
}
