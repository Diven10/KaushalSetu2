import React, { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TopBar from "../components/layout/TopBar";
import Spinner from "../components/common/Spinner";
import ErrorState from "../components/common/ErrorState";
import AssessmentForm from "../components/assessments/AssessmentForm";
import { useAsync } from "../hooks/useAsync";
import { fetchJobs, fetchJob, createAssessment } from "../services/api";

export default function AssessmentFormPage() {
  const { jobId: jobIdFromRoute } = useParams();
  const navigate = useNavigate();
  const [selectedJobId, setSelectedJobId] = useState(jobIdFromRoute || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const jobsState = useAsync(useCallback(() => (jobIdFromRoute ? Promise.resolve(null) : fetchJobs()), [jobIdFromRoute]));
  const jobState = useAsync(useCallback(() => (selectedJobId ? fetchJob(selectedJobId) : Promise.resolve(null)), [selectedJobId]));

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setError(null);
    try {
      await createAssessment(payload);
      navigate(jobIdFromRoute ? `/postings/${jobIdFromRoute}` : "/assessments");
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <TopBar title="New assessment" subtitle="A test or problem statement, scoped to one posting's required skills" />
      <div className="flex-1 p-8">
        <div className="mx-auto max-w-2xl">
          {!jobIdFromRoute && (
            <div className="mb-5">
              {jobsState.loading ? (
                <Spinner label="Loading your postings…" />
              ) : jobsState.error ? (
                <ErrorState error={jobsState.error} onRetry={jobsState.reload} />
              ) : (
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-ink-soft">Posting</span>
                  <select
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    className="rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink"
                  >
                    <option value="">Select a posting…</option>
                    {(jobsState.data || []).map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.title}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
          )}

          {selectedJobId && jobState.loading ? (
            <Spinner label="Loading posting…" />
          ) : selectedJobId && jobState.error ? (
            <ErrorState error={jobState.error} onRetry={jobState.reload} />
          ) : selectedJobId && jobState.data ? (
            <AssessmentForm job={jobState.data} onSubmit={handleSubmit} submitting={submitting} error={error} />
          ) : (
            !jobIdFromRoute && <p className="text-sm text-ink-soft">Pick a posting above to scope the assessment to its required skills.</p>
          )}
        </div>
      </div>
    </>
  );
}
