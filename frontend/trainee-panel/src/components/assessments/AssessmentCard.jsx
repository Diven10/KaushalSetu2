import React from "react";
import { Link } from "react-router-dom";
import { FileText, ListChecks, Clock } from "lucide-react";
import Badge from "../common/Badge";

const STATUS_TONE = {
  Assigned: "warn",
  "In Progress": "accent",
  Submitted: "accent",
  Evaluated: "success",
};

export default function AssessmentCard({ assessment }) {
  const Icon = assessment.type === "test" ? ListChecks : FileText;
  const passed = assessment.status === "Evaluated" && assessment.score !== null
    ? assessment.score >= (assessment.passThreshold ?? 60)
    : null;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-paper text-ink-soft">
            <Icon size={16} />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">{assessment.title}</p>
            <p className="text-xs text-ink-soft">{assessment.employer} · {assessment.role}</p>
          </div>
        </div>
        <Badge tone={STATUS_TONE[assessment.status] || "neutral"}>{assessment.status}</Badge>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-faint">
        <span className="flex items-center gap-1.5">
          <Clock size={12} /> Due {assessment.dueDate}
        </span>
        <span>{assessment.type === "test" ? `${assessment.durationMinutes} min · MCQ` : "Problem Statement"}</span>
        {assessment.skillsTested?.length > 0 && <span>Tests: {assessment.skillsTested.join(", ")}</span>}
      </div>

      {assessment.status === "Evaluated" && assessment.score !== null && (
        <div className={`rounded-md px-3 py-2 text-xs font-medium ${passed ? "bg-success-soft text-success" : "bg-warn-soft text-warn"}`}>
          Score: {assessment.score}% — {passed ? "Passed" : "Below pass threshold"}
        </div>
      )}
      {assessment.status === "Submitted" && (
        <div className="rounded-md bg-accent-soft px-3 py-2 text-xs font-medium text-accent-dark">
          Submitted — awaiting employer review.
        </div>
      )}

      <Link
        to={`/assessments/${assessment.id}`}
        className="mt-1 self-start rounded-md border border-line px-3.5 py-1.5 text-xs font-medium text-ink transition-colors hover:border-ink hover:bg-paper"
      >
        {assessment.status === "Assigned" ? "Start" : assessment.status === "In Progress" ? "Continue" : "View"}
      </Link>
    </div>
  );
}
