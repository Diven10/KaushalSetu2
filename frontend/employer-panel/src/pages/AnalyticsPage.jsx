import React, { useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import TopBar from "../components/layout/TopBar";
import StatCard from "../components/common/StatCard";
import Spinner from "../components/common/Spinner";
import ErrorState from "../components/common/ErrorState";
import EmptyState from "../components/common/EmptyState";
import DownloadHiringReportButton from "../components/common/DownloadHiringReportButton";
import { useAsync } from "../hooks/useAsync";
import { fetchAnalytics, fetchSkillDemand, fetchJobs, fetchAssessmentsSummary } from "../services/api";
import { Percent, Clock, Users, ClipboardList } from "lucide-react";

export default function AnalyticsPage() {
  const analyticsState = useAsync(useCallback(() => fetchAnalytics(), []));
  const skillDemandState = useAsync(useCallback(() => fetchSkillDemand(), []));
  const jobsState = useAsync(useCallback(() => fetchJobs(), []));
  const assessmentsSummaryState = useAsync(useCallback(() => fetchAssessmentsSummary(), []));

  const funnel = analyticsState.data?.funnel; // e.g. { applied, shortlisted, interview, hired }

  return (
    <>
      <TopBar title="Analytics" subtitle="Hiring funnel, retention, and skill demand across your postings">
        <DownloadHiringReportButton analytics={analyticsState.data} skillDemand={skillDemandState.data} jobs={jobsState.data || []} />
      </TopBar>
      <div className="flex-1 space-y-8 p-8">
        <section>
          <h2 className="mb-3 font-display text-base font-semibold text-ink">Hiring funnel &amp; retention</h2>
          {analyticsState.loading ? (
            <Spinner label="Loading analytics…" />
          ) : analyticsState.error ? (
            <ErrorState error={analyticsState.error} onRetry={analyticsState.reload} />
          ) : (
            <>
              <div className="mb-5 grid grid-cols-3 gap-4">
                <StatCard
                  icon={Users}
                  label="30-day retention"
                  value={analyticsState.data?.retention_30_day ? `${analyticsState.data.retention_30_day}%` : "—"}
                />
                <StatCard
                  icon={Percent}
                  label="90-day retention"
                  value={analyticsState.data?.retention_90_day ? `${analyticsState.data.retention_90_day}%` : "—"}
                />
                <StatCard
                  icon={Clock}
                  label="Avg. time to hire"
                  value={analyticsState.data?.avg_time_to_hire_days ? `${analyticsState.data.avg_time_to_hire_days}d` : "—"}
                />
              </div>

              {funnel ? (
                <div className="h-72 rounded-lg border border-line bg-surface p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={[
                        { stage: "Applied", count: funnel.applied ?? 0 },
                        { stage: "Shortlisted", count: funnel.shortlisted ?? 0 },
                        { stage: "Assessment", count: funnel.assessment ?? 0 },
                        { stage: "Interview", count: funnel.interview ?? 0 },
                        { stage: "Hired", count: funnel.hired ?? 0 },
                      ]}
                      margin={{ left: 16, right: 24 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E3E6EC" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 12, fill: "#5B6472" }} />
                      <YAxis dataKey="stage" type="category" tick={{ fontSize: 12, fill: "#14213D" }} width={90} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#C9762C" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState title="No funnel data" description="Funnel breakdown wasn't included in the analytics response." />
              )}
            </>
          )}
        </section>

        <section>
          <h2 className="mb-3 font-display text-base font-semibold text-ink">Test &amp; PS performance</h2>
          {assessmentsSummaryState.loading ? (
            <Spinner label="Loading assessment performance…" />
          ) : assessmentsSummaryState.error ? (
            <EmptyState icon={ClipboardList} title="Not connected yet" description="Wire up GET /api/employer/assessments/summary on the backend to see average scores and completion rates here." />
          ) : (
            <div className="grid grid-cols-3 gap-4">
              <StatCard
                icon={ClipboardList}
                label="Assessments created"
                value={assessmentsSummaryState.data?.total_assessments ?? "—"}
              />
              <StatCard
                icon={Percent}
                label="Average score"
                value={assessmentsSummaryState.data?.average_score != null ? `${Math.round(assessmentsSummaryState.data.average_score)}%` : "—"}
              />
              <StatCard
                icon={Users}
                label="Completion rate"
                value={assessmentsSummaryState.data?.completion_rate != null ? `${Math.round(assessmentsSummaryState.data.completion_rate)}%` : "—"}
              />
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 font-display text-base font-semibold text-ink">Skill demand vs. applicant pool</h2>
          {skillDemandState.loading ? (
            <Spinner label="Loading skill demand…" />
          ) : skillDemandState.error ? (
            <ErrorState error={skillDemandState.error} onRetry={skillDemandState.reload} />
          ) : (skillDemandState.data || []).length === 0 ? (
            <EmptyState title="No skill demand data yet" description="This fills in once you have postings with required skills and applicants." />
          ) : (
            <div className="overflow-hidden rounded-lg border border-line bg-surface">
              <table className="w-full text-sm">
                <thead className="border-b border-line bg-paper text-left text-xs font-medium uppercase tracking-wide text-ink-faint">
                  <tr>
                    <th className="px-4 py-2.5">Skill</th>
                    <th className="px-4 py-2.5">Required in postings</th>
                    <th className="px-4 py-2.5">% of applicants meeting it</th>
                  </tr>
                </thead>
                <tbody>
                  {skillDemandState.data.map((row) => (
                    <tr key={row.skill} className="border-b border-line-soft last:border-0">
                      <td className="px-4 py-2.5 font-medium text-ink">{row.skill}</td>
                      <td className="px-4 py-2.5 text-ink-soft">{row.required_count}</td>
                      <td className="px-4 py-2.5 text-ink-soft">{row.coverage_percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
