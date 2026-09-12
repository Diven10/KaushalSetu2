import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import TopBar from "../components/layout/TopBar";
import McqRunner from "../components/assessments/McqRunner";
import PsSubmission from "../components/assessments/PsSubmission";
import EmptyState from "../components/common/EmptyState";
import { useAppData } from "../context/AppDataContext";

export default function AssessmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getAssessment, startAssessment, submitMcqAssessment, submitPsAssessment } = useAppData();
  const assessment = getAssessment(id);

  if (!assessment) {
    return (
      <>
        <TopBar title="Assessment" subtitle="Test or problem statement detail." />
        <div className="flex-1 px-8 py-6">
          <EmptyState title="Assessment not found" />
        </div>
      </>
    );
  }

  const passed = assessment.status === "Evaluated" && assessment.score !== null
    ? assessment.score >= (assessment.passThreshold ?? 60)
    : null;

  return (
    <>
      <TopBar title={assessment.title} subtitle={`${assessment.employer} · ${assessment.role}`} />
      <div className="flex-1 overflow-y-auto px-8 py-6 scrollbar-thin">
        <button
          type="button"
          onClick={() => navigate("/assessments")}
          className="mb-4 flex items-center gap-1.5 text-xs font-medium text-ink-soft hover:text-ink"
        >
          <ArrowLeft size={14} /> Back to Assessments
        </button>

        <div className="max-w-2xl">
          {assessment.status === "Assigned" && (
            <div className="rounded-lg border border-line bg-surface p-6">
              <p className="text-sm text-ink-soft">
                {assessment.type === "test"
                  ? `This is a ${assessment.durationMinutes}-minute test with ${assessment.questions.length} questions covering: ${assessment.skillsTested.join(", ")}.`
                  : `This is a problem statement covering: ${assessment.skillsTested.join(", ")}.`}
              </p>
              <p className="mt-1 text-xs text-ink-faint">Due {assessment.dueDate}</p>
              <button
                type="button"
                onClick={() => startAssessment(assessment.id)}
                className="mt-4 rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-paper"
              >
                Start now
              </button>
            </div>
          )}

          {assessment.status === "In Progress" && assessment.type === "test" && (
            <McqRunner assessment={assessment} onSubmit={(answers) => submitMcqAssessment(assessment.id, answers)} />
          )}

          {assessment.status === "In Progress" && assessment.type === "ps" && (
            <PsSubmission assessment={assessment} onSubmit={(text) => submitPsAssessment(assessment.id, text)} />
          )}

          {assessment.status === "Submitted" && (
            <div className="rounded-lg border border-line bg-surface p-6">
              <p className="text-sm font-medium text-ink">Submitted — awaiting employer review</p>
              <p className="mt-1.5 whitespace-pre-wrap text-xs text-ink-soft">{assessment.submissionText}</p>
            </div>
          )}

          {assessment.status === "Evaluated" && (
            <div className={`rounded-lg border p-6 ${passed ? "border-success/30 bg-success-soft" : "border-warn/30 bg-warn-soft"}`}>
              <p className={`text-lg font-semibold ${passed ? "text-success" : "text-warn"}`}>
                Score: {assessment.score}% — {passed ? "Passed" : "Below pass threshold"}
              </p>
              <p className="mt-1 text-xs text-ink-soft">
                {passed
                  ? "Great work — this has been shared with the employer alongside your application."
                  : "This didn't meet the pass threshold this time. Check Skills & Opportunities for course recommendations before your next attempt elsewhere."}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
