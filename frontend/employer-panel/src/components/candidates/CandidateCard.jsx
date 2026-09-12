import React, { useState } from "react";
import { ChevronDown, ChevronUp, MapPin, GraduationCap } from "lucide-react";
import Badge from "../common/Badge";
import ProvenanceBadge from "../common/ProvenanceBadge";
import MatchScoreBreakdown from "./MatchScoreBreakdown";

export default function CandidateCard({ candidate }) {
  const [expanded, setExpanded] = useState(false);
  const name = candidate.name || candidate.full_name || `Candidate #${candidate.trainee_id ?? ""}`;
  const matchPct = candidate.match_score ?? candidate.match_percentage;
  const reasons = candidate.match_reasons || candidate.why_matched || [];
  const skills = candidate.skills || candidate.top_skills || [];
  const isVerified = candidate.verified ?? candidate.digilocker_verified ?? candidate.trainee_verified;

  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent-dark">
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-medium text-ink">{name}</p>
              {isVerified && <ProvenanceBadge kind="digilocker" />}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-ink-soft">
              {candidate.location && (
                <span className="flex items-center gap-1">
                  <MapPin size={12} /> {candidate.location}
                </span>
              )}
              {candidate.education && (
                <span className="flex items-center gap-1">
                  <GraduationCap size={12} /> {candidate.education}
                </span>
              )}
            </div>
          </div>
        </div>
        {matchPct !== undefined && (
          <div className="flex flex-col items-end gap-1">
            <Badge tone={matchPct >= 75 ? "success" : matchPct >= 50 ? "accent" : "neutral"}>
              {Math.round(matchPct)}% match
            </Badge>
            <ProvenanceBadge kind="predicted" />
          </div>
        )}
      </div>

      {skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {skills.map((skill) => (
            <Badge key={skill} tone="neutral">
              {skill}
            </Badge>
          ))}
        </div>
      )}

      {(candidate.match_breakdown || reasons.length > 0) && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 flex items-center gap-1 text-xs font-medium text-ink-soft hover:text-ink"
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          Why this candidate?
        </button>
      )}

      {expanded && (
        <div className="mt-3 flex flex-col gap-3 border-t border-line-soft pt-3">
          {candidate.match_breakdown && <MatchScoreBreakdown breakdown={candidate.match_breakdown} />}
          {reasons.length > 0 && (
            <ul className="flex flex-col gap-1 text-xs text-ink-soft">
              {reasons.map((reason, i) => (
                <li key={i} className="flex gap-1.5">
                  <span className="text-ink-faint">•</span>
                  {reason}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
