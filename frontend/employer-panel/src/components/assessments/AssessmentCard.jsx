import React from "react";
import { Link } from "react-router-dom";
import { FileText, ListChecks, Clock, Users } from "lucide-react";
import Badge from "../common/Badge";

export default function AssessmentCard({ assessment }) {
  const Icon = assessment.type === "test" ? ListChecks : FileText;
  const assignedCount = assessment.assigned_count ?? assessment.assignedCount ?? null;
  const pendingReview = assessment.pending_review_count ?? assessment.pendingReviewCount ?? null;
  const avgScore = assessment.average_score ?? assessment.averageScore ?? null;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-paper text-ink-soft">
            <Icon size={16} />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">{assessment.title}</p>
            <p className="text-xs text-ink-soft">{assessment.job_title || assessment.jobTitle}</p>
          </div>
        </div>
        <Badge tone={assessment.type === "test" ? "neutral" : "accent"}>
          {assessment.type === "test" ? "Test" : "Problem Statement"}
        </Badge>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-faint">
        {assessment.due_date && (
          <span className="flex items-center gap-1.5">
            <Clock size={12} /> Due {assessment.due_date}
          </span>
        )}
        {assignedCount !== null && (
          <span className="flex items-center gap-1.5">
            <Users size={12} /> {assignedCount} assigned
          </span>
        )}
        {(assessment.skills_tested || assessment.skillsTested || []).length > 0 && (
          <span>Tests: {(assessment.skills_tested || assessment.skillsTested).join(", ")}</span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {pendingReview !== null && pendingReview > 0 && (
          <span className="rounded-md bg-warn-soft px-3 py-1.5 text-xs font-medium text-warn">
            {pendingReview} awaiting review
          </span>
        )}
        {avgScore !== null && (
          <span className="rounded-md bg-line-soft px-3 py-1.5 text-xs font-medium text-ink-soft">
            Avg. score {Math.round(avgScore)}%
          </span>
        )}
      </div>

      <Link
        to={`/assessments/${assessment.id}`}
        className="mt-1 self-start rounded-md border border-line px-3.5 py-1.5 text-xs font-medium text-ink transition-colors hover:border-ink hover:bg-paper"
      >
        View submissions
      </Link>
    </div>
  );
}
