import React, { useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Users, TrendingUp, Clock, ClipboardList, ShieldCheck, ShieldQuestion } from "lucide-react";
import TopBar from "../components/layout/TopBar";
import StatCard from "../components/common/StatCard";
import Spinner from "../components/common/Spinner";
import ErrorState from "../components/common/ErrorState";
import EmptyState from "../components/common/EmptyState";
import JobPostingCard from "../components/postings/JobPostingCard";
import { useAsync } from "../hooks/useAsync";
import { fetchJobs, fetchAnalytics, fetchAssessmentsSummary, fetchEmployerProfile } from "../services/api";
import { deriveNudges } from "../utils/deriveNudges";

export default function OverviewPage() {
  const jobsState = useAsync(useCallback(() => fetchJobs(), []));
  const analyticsState = useAsync(useCallback(() => fetchAnalytics(), []));
  const assessmentsSummaryState = useAsync(useCallback(() => fetchAssessmentsSummary(), []));
  const employerState = useAsync(useCallback(() => fetchEmployerProfile(), []));

  const jobs = jobsState.data || [];
  const openJobs = jobs.filter((j) => j.status === "open");
  const totalApplicants = jobs.reduce((sum, j) => sum + (j.applicant_count ?? 0), 0);
  const isVerified = employerState.data?.verification?.status === "verified";

  const nudges = useMemo(
    () =>
      deriveNudges({
        jobs,
        assessmentsSummary: assessmentsSummaryState.data,
        employerVerified: employerState.error ? undefined : isVerified,
      }),
    [jobs, assessmentsSummaryState.data, employerState.error, isVerified]
  );

  return (
    <>
      <TopBar title="Overview" subtitle="Your hiring activity at a glance" />
      <div className="flex flex-1 flex-col gap-6 p-8">
        {jobsState.loading ? (
          <Spinner label="Loading your postings…" />
        ) : jobsState.error ? (
          <ErrorState error={jobsState.error} onRetry={jobsState.reload} />
        ) : (
          <>
            <div className="grid grid-cols-4 gap-4">
              <StatCard icon={Briefcase} label="Open postings" value={openJobs.length} />
              <StatCard icon={Users} label="Total applicants" value={totalApplicants} />
              <StatCard
                icon={TrendingUp}
                label="Hires (all time)"
                value={analyticsState.data?.total_hires ?? "—"}
                sublabel={analyticsState.error ? "Not connected yet" : undefined}
              />
              <StatCard
                icon={Clock}
                label="Avg. time to hire"
                value={analyticsState.data?.avg_time_to_hire_days ? `${analyticsState.data.avg_time_to_hire_days}d` : "—"}
                sublabel={analyticsState.error ? "Not connected yet" : undefined}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <StatCard
                icon={ClipboardList}
                label="Assessments awaiting review"
                value={assessmentsSummaryState.data?.pending_review_count ?? "—"}
                sublabel={assessmentsSummaryState.error ? "Not connected yet" : "Test & PS submissions"}
                accentColor={assessmentsSummaryState.data?.pending_review_count > 0 ? "text-warn" : "text-accent-dark"}
              />
              <StatCard
                icon={ClipboardList}
                label="Assigned, not yet submitted"
                value={assessmentsSummaryState.data?.awaiting_submission_count ?? "—"}
                sublabel={assessmentsSummaryState.error ? "Not connected yet" : "Trainees still working on it"}
              />
              <StatCard
                icon={isVerified ? ShieldCheck : ShieldQuestion}
                label="Company verification"
                value={employerState.error ? "—" : isVerified ? "Verified" : "Pending"}
                sublabel={employerState.error ? "Not connected yet" : isVerified ? "via DigiLocker" : "Verify to build trust with trainees"}
                accentColor={isVerified ? "text-success" : "text-warn"}
              />
            </div>

            {nudges.length > 0 && (
              <div className="rounded-lg border border-line bg-surface p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-display text-base font-semibold text-ink">Needs your attention</h2>
                  <span className="text-xs text-ink-faint">{nudges.length} item(s)</span>
                </div>
                <div className="flex flex-col gap-3">
                  {nudges.slice(0, 4).map((n) => (
                    <div key={n.id} className="flex items-start justify-between gap-3 rounded-md border border-line-soft bg-paper px-4 py-3">
                      <div>
                        <p className="text-sm text-ink">{n.signal}</p>
                        <p className="mt-0.5 text-xs text-ink-soft">{n.action}</p>
                      </div>
                      <Link to={n.link} className="shrink-0 text-xs font-medium text-accent-dark hover:underline">
                        Open
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-base font-semibold text-ink">Your postings</h2>
                <Link to="/postings" className="text-sm font-medium text-accent-dark hover:underline">
                  View all →
                </Link>
              </div>

              {jobs.length === 0 ? (
                <EmptyState
                  title="No postings yet"
                  description="Create your first job or internship posting to start matching with candidates."
                  action={
                    <Link
                      to="/postings/new"
                      className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink/90"
                    >
                      New posting
                    </Link>
                  }
                />
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {jobs.slice(0, 4).map((job) => (
                    <JobPostingCard key={job.id} job={job} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
