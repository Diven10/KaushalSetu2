import React, { useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Plus } from "lucide-react";
import TopBar from "../components/layout/TopBar";
import Badge from "../components/common/Badge";
import Spinner from "../components/common/Spinner";
import ErrorState from "../components/common/ErrorState";
import EmptyState from "../components/common/EmptyState";
import ApplicationCard from "../components/applications/ApplicationCard";
import CandidateCard from "../components/candidates/CandidateCard";
import AssessmentCard from "../components/assessments/AssessmentCard";
import { useAsync } from "../hooks/useAsync";
import {
  fetchJob,
  fetchApplicants,
  fetchCandidateMatches,
  updateApplicationStatus,
  fetchAssessmentsForJob,
  assignAssessment,
} from "../services/api";

export default function PostingDetailPage() {
  const { jobId } = useParams();

  const jobState = useAsync(useCallback(() => fetchJob(jobId), [jobId]));
  const applicantsState = useAsync(useCallback(() => fetchApplicants(jobId), [jobId]));
  const matchesState = useAsync(useCallback(() => fetchCandidateMatches(jobId), [jobId]));
  const assessmentsState = useAsync(useCallback(() => fetchAssessmentsForJob(jobId), [jobId]));

  const handleStatusChange = async (applicationId, status) => {
    await updateApplicationStatus(applicationId, status);
    applicantsState.reload();
  };

  const handleAssign = async (assessmentId, applicationId) => {
    await assignAssessment(assessmentId, [applicationId]);
    assessmentsState.reload();
  };

  return (
    <>
      <TopBar
        title={jobState.data?.title || "Posting"}
        subtitle={[jobState.data?.location, jobState.data?.work_mode].filter(Boolean).join(" · ")}
      >
        {jobState.data && (
          <Badge tone={jobState.data.status === "open" ? "success" : "neutral"}>
            {jobState.data.status === "open" ? "Open" : "Closed"}
          </Badge>
        )}
      </TopBar>

      <div className="flex-1 space-y-8 p-8">
        {jobState.loading ? (
          <Spinner label="Loading posting…" />
        ) : jobState.error ? (
          <ErrorState error={jobState.error} onRetry={jobState.reload} />
        ) : (
          <div className="rounded-lg border border-line bg-surface p-5">
            <p className="whitespace-pre-line text-sm text-ink-soft">{jobState.data.description}</p>
            {(jobState.data.required_skills || []).length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {jobState.data.required_skills.map((s) => (
                  <Badge key={s}>{s}</Badge>
                ))}
              </div>
            )}
          </div>
        )}

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-ink">Test &amp; PS assessments</h2>
            {jobState.data && (
              <Link
                to={`/postings/${jobId}/assessments/new`}
                className="flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-xs font-medium text-ink hover:bg-paper"
              >
                <Plus size={13} /> New assessment
              </Link>
            )}
          </div>
          {assessmentsState.loading ? (
            <Spinner label="Loading assessments…" />
          ) : assessmentsState.error ? (
            <ErrorState error={assessmentsState.error} onRetry={assessmentsState.reload} />
          ) : (assessmentsState.data || []).length === 0 ? (
            <EmptyState
              title="No assessments yet"
              description="Create a test or problem statement based on this posting's required skills, then assign it to shortlisted applicants below."
            />
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {assessmentsState.data.map((a) => (
                <AssessmentCard key={a.id} assessment={a} />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 font-display text-base font-semibold text-ink">Applicants</h2>
          {applicantsState.loading ? (
            <Spinner label="Loading applicants…" />
          ) : applicantsState.error ? (
            <ErrorState error={applicantsState.error} onRetry={applicantsState.reload} />
          ) : (applicantsState.data || []).length === 0 ? (
            <EmptyState title="No applicants yet" description="Applications will appear here as trainees apply." />
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {applicantsState.data.map((app) => (
                <ApplicationCard
                  key={app.id}
                  application={app}
                  onStatusChange={handleStatusChange}
                  assessments={assessmentsState.data || []}
                  onAssign={handleAssign}
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-1 font-display text-base font-semibold text-ink">Suggested candidates</h2>
          <p className="mb-3 text-sm text-ink-soft">
            Trainees who match this posting's requirements, ranked by fit.
          </p>
          {matchesState.loading ? (
            <Spinner label="Finding matches…" />
          ) : matchesState.error ? (
            <ErrorState error={matchesState.error} onRetry={matchesState.reload} />
          ) : (matchesState.data || []).length === 0 ? (
            <EmptyState title="No suggested candidates" description="No matching trainees were found for this posting yet." />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {matchesState.data.map((candidate) => (
                <CandidateCard key={candidate.trainee_id || candidate.id} candidate={candidate} />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
