import React, { useCallback } from "react";
import { useParams } from "react-router-dom";
import TopBar from "../components/layout/TopBar";
import Badge from "../components/common/Badge";
import Spinner from "../components/common/Spinner";
import ErrorState from "../components/common/ErrorState";
import EmptyState from "../components/common/EmptyState";
import SubmissionRow from "../components/assessments/SubmissionRow";
import { useAsync } from "../hooks/useAsync";
import { fetchAssessment, fetchAssessmentSubmissions, reviewSubmission } from "../services/api";

export default function AssessmentDetailPage() {
  const { assessmentId } = useParams();

  const assessmentState = useAsync(useCallback(() => fetchAssessment(assessmentId), [assessmentId]));
  const submissionsState = useAsync(useCallback(() => fetchAssessmentSubmissions(assessmentId), [assessmentId]));

  const handleReview = async (submissionId, payload) => {
    await reviewSubmission(submissionId, payload);
    submissionsState.reload();
  };

  const assessment = assessmentState.data;

  return (
    <>
      <TopBar
        title={assessment?.title || "Assessment"}
        subtitle={assessment ? `${assessment.job_title || ""} · ${assessment.type === "test" ? "Test" : "Problem Statement"}`.replace(/^ · /, "") : undefined}
      >
        {assessment && <Badge tone={assessment.type === "test" ? "neutral" : "accent"}>{assessment.type === "test" ? "Test" : "PS"}</Badge>}
      </TopBar>

      <div className="flex-1 space-y-6 p-8">
        {assessmentState.loading ? (
          <Spinner label="Loading assessment…" />
        ) : assessmentState.error ? (
          <ErrorState error={assessmentState.error} onRetry={assessmentState.reload} />
        ) : (
          <div className="rounded-lg border border-line bg-surface p-5">
            {assessment.brief && <p className="mb-2 text-sm text-ink-soft">{assessment.brief}</p>}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-faint">
              {assessment.due_date && <span>Due {assessment.due_date}</span>}
              {assessment.pass_threshold != null && <span>Pass threshold {assessment.pass_threshold}%</span>}
              {(assessment.skills_tested || []).length > 0 && <span>Tests: {assessment.skills_tested.join(", ")}</span>}
            </div>
          </div>
        )}

        <section>
          <h2 className="mb-3 font-display text-base font-semibold text-ink">Submissions</h2>
          {submissionsState.loading ? (
            <Spinner label="Loading submissions…" />
          ) : submissionsState.error ? (
            <ErrorState error={submissionsState.error} onRetry={submissionsState.reload} />
          ) : (submissionsState.data || []).length === 0 ? (
            <EmptyState title="No submissions yet" description="Once assigned trainees start or submit this assessment, they'll appear here." />
          ) : (
            <div className="flex flex-col gap-3">
              {submissionsState.data.map((s) => (
                <SubmissionRow
                  key={s.id}
                  submission={s}
                  assessmentType={assessment?.type}
                  passThreshold={assessment?.pass_threshold}
                  onReview={handleReview}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
