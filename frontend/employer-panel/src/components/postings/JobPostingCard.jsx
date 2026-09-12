import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Briefcase, Clock, Pencil, XCircle } from "lucide-react";
import Badge from "../common/Badge";

export default function JobPostingCard({ job, onClose }) {
  const isOpen = job.status === "open";
  const applicantCount = job.applicant_count ?? job.applicants_count ?? null;
  const strongMatches = job.strong_match_count ?? null;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <h3 className="font-display text-base font-semibold text-ink">{job.title}</h3>
            <Badge tone={job.type === "internship" ? "accent" : "neutral"}>
              {job.type === "internship" ? "Internship" : "Job"}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-soft">
            {job.location && (
              <span className="flex items-center gap-1">
                <MapPin size={13} /> {job.location}
              </span>
            )}
            {job.work_mode && (
              <span className="flex items-center gap-1">
                <Briefcase size={13} /> {job.work_mode}
              </span>
            )}
            {job.application_deadline && (
              <span className="flex items-center gap-1">
                <Clock size={13} /> Closes {job.application_deadline}
              </span>
            )}
          </div>
        </div>
        <Badge tone={isOpen ? "success" : "neutral"}>{isOpen ? "Open" : "Closed"}</Badge>
      </div>

      <div className="flex items-center justify-between border-t border-line-soft pt-3">
        <p className="text-sm text-ink-soft">
          {applicantCount === null ? (
            "Applicant data not available"
          ) : (
            <>
              <span className="font-medium text-ink">{applicantCount}</span> applicant
              {applicantCount === 1 ? "" : "s"}
              {strongMatches !== null && (
                <>
                  {" · "}
                  <span className="font-medium text-ink">{strongMatches}</span> strong match
                  {strongMatches === 1 ? "" : "es"} (≥75%)
                </>
              )}
            </>
          )}
        </p>
        <div className="flex items-center gap-2">
          <Link
            to={`/postings/${job.id}`}
            className="rounded-md border border-line px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-paper"
          >
            View
          </Link>
          <Link
            to={`/postings/${job.id}/edit`}
            className="flex items-center gap-1 rounded-md border border-line px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-paper"
          >
            <Pencil size={13} /> Edit
          </Link>
          {isOpen && (
            <button
              onClick={() => onClose?.(job.id)}
              className="flex items-center gap-1 rounded-md border border-line px-3 py-1.5 text-xs font-medium text-warn transition-colors hover:bg-warn-soft"
            >
              <XCircle size={13} /> Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
