import React, { useState } from "react";
import Badge from "../common/Badge";
import ProvenanceBadge from "../common/ProvenanceBadge";

const STATUSES = ["applied", "shortlisted", "interview", "hired", "rejected"];

export default function ApplicationCard({ application, onStatusChange, assessments = [], onAssign }) {
  const [updating, setUpdating] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(assessments[0]?.id || "");
  const name = application.candidate_name || application.trainee_name || `Applicant #${application.id}`;
  const matchPct = application.match_score ?? application.match_percentage;
  const isVerified = application.trainee_verified ?? application.verified ?? application.digilocker_verified;

  const handleChange = async (e) => {
    const nextStatus = e.target.value;
    setUpdating(true);
    try {
      await onStatusChange(application.id, nextStatus);
    } finally {
      setUpdating(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedAssessment) return;
    setAssigning(true);
    try {
      await onAssign(selectedAssessment, application.id);
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 rounded-md border border-line bg-surface p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium text-ink">{name}</p>
          {isVerified && <ProvenanceBadge kind="digilocker" />}
        </div>
        {matchPct !== undefined && <Badge tone="accent">{Math.round(matchPct)}%</Badge>}
      </div>
      {application.job_title && <p className="text-xs text-ink-soft">{application.job_title}</p>}
      <select
        value={application.status}
        disabled={updating}
        onChange={handleChange}
        className="mt-1 w-full rounded-md border border-line bg-paper px-2 py-1.5 text-xs text-ink disabled:opacity-60"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </option>
        ))}
      </select>

      {onAssign && assessments.length > 0 && (
        <div className="mt-1 flex items-center gap-1.5 border-t border-line-soft pt-2">
          <select
            value={selectedAssessment}
            onChange={(e) => setSelectedAssessment(e.target.value)}
            className="min-w-0 flex-1 rounded-md border border-line bg-paper px-2 py-1.5 text-[11px] text-ink"
          >
            {assessments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={assigning}
            onClick={handleAssign}
            className="shrink-0 rounded-md border border-line px-2 py-1.5 text-[11px] font-medium text-ink hover:bg-paper disabled:opacity-60"
          >
            Assign
          </button>
        </div>
      )}
    </div>
  );
}
