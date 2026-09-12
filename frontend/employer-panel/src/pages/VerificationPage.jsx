import React, { useCallback } from "react";
import TopBar from "../components/layout/TopBar";
import Spinner from "../components/common/Spinner";
import ErrorState from "../components/common/ErrorState";
import DigiLockerBusinessCard from "../components/verification/DigiLockerBusinessCard";
import { useAsync } from "../hooks/useAsync";
import { fetchEmployerProfile } from "../services/api";
import { ShieldQuestion, Users, Filter } from "lucide-react";

export default function VerificationPage() {
  const { data: employer, loading, error, reload } = useAsync(useCallback(() => fetchEmployerProfile(), []));

  const verificationStatus = employer?.verification?.status; // "verified" | "pending" | undefined

  return (
    <>
      <TopBar title="Verification" subtitle="Confirm your company's identity so trainees can trust your postings" />
      <div className="flex-1 p-8">
        <div className="grid max-w-3xl grid-cols-2 gap-5">
          <div className="col-span-2 rounded-lg border border-line bg-surface p-6">
            <div className="mb-1 flex items-center gap-2">
              <ShieldQuestion size={16} className="text-ink-soft" />
              <h2 className="text-base font-semibold text-ink">Company verification</h2>
            </div>
            <p className="mb-4 text-xs text-ink-soft">
              A verified badge appears on your postings and applicant view, the same trust signal
              trainees see on their own DigiLocker-verified profiles.
            </p>

            {loading ? (
              <Spinner label="Loading your profile…" />
            ) : error ? (
              <ErrorState error={error} onRetry={reload} />
            ) : (
              <DigiLockerBusinessCard initialStatus={verificationStatus} />
            )}
          </div>

          <div className="col-span-2 rounded-lg border border-line bg-surface p-6">
            <div className="mb-1 flex items-center gap-2">
              <Users size={16} className="text-ink-soft" />
              <h2 className="text-base font-semibold text-ink">Candidate verification, at a glance</h2>
            </div>
            <p className="text-xs text-ink-soft">
              Wherever an applicant or suggested candidate's trainee profile is DigiLocker-verified, you'll
              see a <span className="font-medium text-ink">DigiLocker Verified</span> badge next to their
              name in Applications and Suggested Candidates — a stronger signal than a self-reported
              profile. Use the <span className="inline-flex items-center gap-1 font-medium text-ink"><Filter size={11} /> Verified only</span> filter
              on the Applications page to focus on them.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
