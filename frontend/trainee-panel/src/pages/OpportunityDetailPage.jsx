import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Banknote, Briefcase, Check, Clock } from "lucide-react";
import TopBar from "../components/layout/TopBar";
import { useAppData } from "../context/AppDataContext";
import EmptyState from "../components/common/EmptyState";

export default function OpportunityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { opportunities, hasApplied, applyToJob } = useAppData();
  const opportunity = opportunities.find((o) => o.id === id);
  const applied = opportunity && hasApplied(opportunity.id);

  return (
    <>
      <TopBar title="Opportunity Detail" subtitle="Full posting details before you apply." />
      <div className="flex-1 overflow-y-auto px-8 py-6 scrollbar-thin">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-1.5 text-xs font-medium text-ink-soft hover:text-ink"
        >
          <ArrowLeft size={14} /> Back
        </button>

        {!opportunity ? (
          <EmptyState title="Opportunity not found" description="It may have been filled or removed." />
        ) : (
          <div className="max-w-2xl rounded-lg border border-line bg-surface p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-lg font-semibold text-ink">{opportunity.role}</h1>
                <p className="text-sm text-ink-soft">{opportunity.employer}</p>
              </div>
              <span className="shrink-0 rounded-sm bg-success-soft px-2.5 py-1 text-xs font-medium text-success">
                {opportunity.match}% match
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink-faint">
              <span className="flex items-center gap-1.5"><MapPin size={13} /> {opportunity.location}</span>
              <span className="flex items-center gap-1.5"><Banknote size={13} /> {opportunity.wage}</span>
              <span className="flex items-center gap-1.5"><Briefcase size={13} /> {opportunity.type}</span>
              {opportunity.postedDaysAgo != null && (
                <span className="flex items-center gap-1.5"><Clock size={13} /> Posted {opportunity.postedDaysAgo} days ago</span>
              )}
            </div>

            {opportunity.description && (
              <p className="mt-4 text-sm leading-relaxed text-ink-soft">{opportunity.description}</p>
            )}

            {opportunity.requiredSkills?.length > 0 && (
              <div className="mt-4">
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-faint">Required skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {opportunity.requiredSkills.map((s) => (
                    <span key={s} className="rounded-sm bg-line-soft px-2.5 py-1 text-xs text-ink-soft">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center gap-3 border-t border-line-soft pt-5">
              <button
                type="button"
                disabled={applied}
                onClick={() => applyToJob(opportunity)}
                className={`flex items-center gap-1.5 rounded-md px-5 py-2.5 text-sm font-medium transition-colors ${
                  applied ? "cursor-default bg-success-soft text-success" : "bg-ink text-paper hover:opacity-90"
                }`}
              >
                {applied ? (
                  <>
                    <Check size={15} /> Applied
                  </>
                ) : (
                  "Apply now"
                )}
              </button>
              {applied && (
                <Link to="/applications" className="text-sm font-medium text-accent-dark hover:underline">
                  Track this application →
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
