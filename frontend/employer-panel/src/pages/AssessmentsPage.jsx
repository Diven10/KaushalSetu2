import React, { useCallback } from "react";
import { Link } from "react-router-dom";
import { Plus, ClipboardList } from "lucide-react";
import TopBar from "../components/layout/TopBar";
import Spinner from "../components/common/Spinner";
import ErrorState from "../components/common/ErrorState";
import EmptyState from "../components/common/EmptyState";
import AssessmentCard from "../components/assessments/AssessmentCard";
import { useAsync } from "../hooks/useAsync";
import { fetchAllAssessments } from "../services/api";

export default function AssessmentsPage() {
  const { data, loading, error, reload } = useAsync(useCallback(() => fetchAllAssessments(), []));
  const assessments = data || [];

  return (
    <>
      <TopBar title="Test & PS" subtitle="Assessments you've given trainees before hiring, across all postings">
        <Link
          to="/assessments/new"
          className="flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink/90"
        >
          <Plus size={15} /> New assessment
        </Link>
      </TopBar>
      <div className="flex-1 p-8">
        {loading ? (
          <Spinner label="Loading assessments…" />
        ) : error ? (
          <ErrorState error={error} onRetry={reload} />
        ) : assessments.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No assessments yet"
            description="Create a test or problem statement based on a posting's required skills, then assign it to shortlisted applicants."
            action={
              <Link to="/assessments/new" className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink/90">
                New assessment
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {assessments.map((a) => (
              <AssessmentCard key={a.id} assessment={a} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
