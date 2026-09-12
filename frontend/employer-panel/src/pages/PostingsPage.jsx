import React, { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Scale } from "lucide-react";
import TopBar from "../components/layout/TopBar";
import Spinner from "../components/common/Spinner";
import ErrorState from "../components/common/ErrorState";
import EmptyState from "../components/common/EmptyState";
import JobPostingCard from "../components/postings/JobPostingCard";
import PostingCompareCard from "../components/postings/PostingCompareCard";
import { useAsync } from "../hooks/useAsync";
import { fetchJobs, closeJob } from "../services/api";

export default function PostingsPage() {
  const { data, loading, error, reload } = useAsync(useCallback(() => fetchJobs(), []));
  const jobs = data || [];
  const [compareIds, setCompareIds] = useState([]);
  const [compareMode, setCompareMode] = useState(false);

  const compareJobs = useMemo(() => jobs.filter((j) => compareIds.includes(j.id)), [jobs, compareIds]);

  const toggleCompare = (jobId) => {
    setCompareIds((prev) => {
      if (prev.includes(jobId)) return prev.filter((id) => id !== jobId);
      if (prev.length >= 2) return [prev[1], jobId];
      return [...prev, jobId];
    });
  };

  const handleClose = async (jobId) => {
    try {
      await closeJob(jobId);
      reload();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <TopBar title="My Postings" subtitle="Manage your job and internship postings">
        <button
          type="button"
          onClick={() => setCompareMode((v) => !v)}
          className={`flex items-center gap-1.5 rounded-md border px-3.5 py-2 text-xs font-medium transition-colors ${
            compareMode ? "border-ink bg-ink text-paper" : "border-line text-ink-soft hover:bg-paper"
          }`}
        >
          <Scale size={13} /> Compare
        </button>
        <Link
          to="/postings/new"
          className="flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink/90"
        >
          <Plus size={15} /> New posting
        </Link>
      </TopBar>
      <div className="flex-1 space-y-6 p-8">
        {compareMode && (
          <div className="rounded-lg border border-line bg-surface p-4">
            <p className="mb-3 text-xs text-ink-soft">
              Select up to 2 postings below to compare side by side.
              {compareJobs.length > 0 && ` (${compareJobs.length}/2 selected)`}
            </p>
            {compareJobs.length === 2 ? (
              <PostingCompareCard jobs={compareJobs} />
            ) : (
              <p className="text-xs text-ink-faint">Pick 2 postings using the checkbox on each card.</p>
            )}
          </div>
        )}

        {loading ? (
          <Spinner label="Loading postings…" />
        ) : error ? (
          <ErrorState error={error} onRetry={reload} />
        ) : jobs.length === 0 ? (
          <EmptyState
            title="No postings yet"
            description="Create a posting and it'll show up here, along with how well your candidate pool matches it."
            action={
              <Link to="/postings/new" className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink/90">
                New posting
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {jobs.map((job) => (
              <div key={job.id} className="relative">
                {compareMode && (
                  <label className="absolute right-4 top-4 z-10 flex items-center gap-1.5 rounded-md bg-surface px-2 py-1 text-[11px] font-medium text-ink-soft shadow-panel">
                    <input
                      type="checkbox"
                      checked={compareIds.includes(job.id)}
                      onChange={() => toggleCompare(job.id)}
                    />
                    Compare
                  </label>
                )}
                <JobPostingCard job={job} onClose={handleClose} />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
