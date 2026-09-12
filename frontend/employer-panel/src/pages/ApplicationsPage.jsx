import React, { useCallback, useMemo, useState } from "react";
import { Filter } from "lucide-react";
import TopBar from "../components/layout/TopBar";
import Spinner from "../components/common/Spinner";
import ErrorState from "../components/common/ErrorState";
import EmptyState from "../components/common/EmptyState";
import PipelineBoard from "../components/applications/PipelineBoard";
import { useAsync } from "../hooks/useAsync";
import {
  fetchJobs,
  fetchApplicants,
  updateApplicationStatus,
  fetchAssessmentsForJob,
  assignAssessment,
} from "../services/api";

export default function ApplicationsPage() {
  const jobsState = useAsync(useCallback(() => fetchJobs(), []));
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const activeJobId = selectedJobId ?? jobsState.data?.[0]?.id ?? null;

  const applicantsState = useAsync(
    useCallback(() => (activeJobId ? fetchApplicants(activeJobId) : Promise.resolve([])), [activeJobId])
  );
  const assessmentsState = useAsync(
    useCallback(() => (activeJobId ? fetchAssessmentsForJob(activeJobId) : Promise.resolve([])), [activeJobId])
  );

  const handleStatusChange = async (applicationId, status) => {
    await updateApplicationStatus(applicationId, status);
    applicantsState.reload();
  };

  const handleAssign = async (assessmentId, applicationId) => {
    await assignAssessment(assessmentId, [applicationId]);
    assessmentsState.reload();
  };

  const applications = applicantsState.data || [];
  const visibleApplications = useMemo(
    () =>
      verifiedOnly
        ? applications.filter((a) => a.trainee_verified ?? a.verified ?? a.digilocker_verified)
        : applications,
    [applications, verifiedOnly]
  );

  return (
    <>
      <TopBar title="Applications" subtitle="Track candidates through your hiring pipeline">
        <button
          type="button"
          onClick={() => setVerifiedOnly((v) => !v)}
          className={`flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-medium transition-colors ${
            verifiedOnly ? "border-ink bg-ink text-paper" : "border-line text-ink-soft hover:bg-paper"
          }`}
        >
          <Filter size={13} /> Verified only
        </button>
        {jobsState.data && jobsState.data.length > 0 && (
          <select
            value={activeJobId || ""}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink"
          >
            {jobsState.data.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        )}
      </TopBar>

      <div className="flex-1 p-8">
        {jobsState.loading ? (
          <Spinner label="Loading postings…" />
        ) : jobsState.error ? (
          <ErrorState error={jobsState.error} onRetry={jobsState.reload} />
        ) : (jobsState.data || []).length === 0 ? (
          <EmptyState title="No postings yet" description="Create a posting first — applications will show up here once trainees apply." />
        ) : applicantsState.loading ? (
          <Spinner label="Loading pipeline…" />
        ) : applicantsState.error ? (
          <ErrorState error={applicantsState.error} onRetry={applicantsState.reload} />
        ) : verifiedOnly && visibleApplications.length === 0 ? (
          <EmptyState title="No verified applicants yet" description="No applicant on this posting has a DigiLocker-verified profile yet." />
        ) : (
          <PipelineBoard
            applications={visibleApplications}
            onStatusChange={handleStatusChange}
            assessments={assessmentsState.data || []}
            onAssign={handleAssign}
          />
        )}
      </div>
    </>
  );
}
