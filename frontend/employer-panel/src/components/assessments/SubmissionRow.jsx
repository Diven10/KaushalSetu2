import React, { useState } from "react";
import Badge from "../common/Badge";
import ProvenanceBadge from "../common/ProvenanceBadge";

const STATUS_TONE = {
  assigned: "neutral",
  in_progress: "accent",
  submitted: "accent",
  evaluated: "success",
  rejected: "warn",
};

export default function SubmissionRow({ submission, assessmentType, passThreshold, onReview }) {
  const [score, setScore] = useState(submission.score ?? "");
  const [feedback, setFeedback] = useState(submission.feedback ?? "");
  const [saving, setSaving] = useState(false);
  const name = submission.candidate_name || submission.trainee_name || `Trainee #${submission.trainee_id ?? ""}`;

  const handleReview = async (status) => {
    setSaving(true);
    try {
      await onReview(submission.id, { score: Number(score) || 0, feedback, status });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-md border border-line bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-ink">{name}</p>
          {submission.verified && <ProvenanceBadge kind="digilocker" />}
        </div>
        <Badge tone={STATUS_TONE[submission.status] || "neutral"}>{submission.status?.replace("_", " ")}</Badge>
      </div>

      {submission.score != null && (
        <p className="text-xs text-ink-soft">
          Score: <span className="font-medium text-ink">{submission.score}%</span>
          {passThreshold != null && (submission.score >= passThreshold ? " · Passed" : " · Below threshold")}
        </p>
      )}

      {assessmentType === "ps" && submission.submission_text && (
        <div className="rounded-md bg-paper p-3">
          <p className="whitespace-pre-wrap text-xs text-ink-soft">{submission.submission_text}</p>
        </div>
      )}

      {assessmentType === "ps" && submission.status === "submitted" && (
        <div className="flex flex-wrap items-end gap-2 border-t border-line-soft pt-3">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-ink-faint">Score (%)</span>
            <input
              type="number"
              min="0"
              max="100"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="w-20 rounded-md border border-line bg-paper px-2 py-1.5 text-xs text-ink"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1">
            <span className="text-[11px] text-ink-faint">Feedback (optional)</span>
            <input
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full rounded-md border border-line bg-paper px-2 py-1.5 text-xs text-ink"
            />
          </label>
          <button
            type="button"
            disabled={saving}
            onClick={() => handleReview("evaluated")}
            className="rounded-md bg-ink px-3 py-1.5 text-xs font-medium text-paper disabled:opacity-60"
          >
            Save review
          </button>
        </div>
      )}
    </div>
  );
}
