import React from "react";
import { Link } from "react-router-dom";
import { ClipboardCheck, ShieldCheck, ArrowRight, MessageCircle, ClipboardList, Briefcase } from "lucide-react";
import TopBar from "../components/layout/TopBar";
import StatCard from "../components/dashboard/StatCard";
import ProgressBar from "../components/common/ProgressBar";
import ProvenanceBadge from "../components/common/ProvenanceBadge";
import { useProfile } from "../context/ProfileContext";
import { useAppData } from "../context/AppDataContext";
import { useLanguage } from "../context/LanguageContext";
import { CAREER_JOURNEY } from "../data/mockData";
import { firstName } from "../data/chatbotScript";

export default function DashboardPage() {
  const { profile, overallCompleteness, isVerified } = useProfile();
  const { opportunities, applications, assessments, notifications } = useAppData();
  const { t } = useLanguage();

  const currentStageEntry = CAREER_JOURNEY.find((s) => s.status === "current") || CAREER_JOURNEY[0];
  const pendingAssessments = assessments.filter((a) => a.status === "Assigned" || a.status === "In Progress");
  const activeApplications = applications.filter((a) => !a.rejected && a.stage !== "Hired").length;

  return (
    <>
      <TopBar
        title={`${t("dashboard_title")}${profile.identity.fullName ? ", " + firstName(profile.identity.fullName) : ""}`}
        subtitle={t("dashboard_subtitle")}
      />
      <div className="flex-1 overflow-y-auto px-8 py-6 scrollbar-thin">
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            icon={ClipboardCheck}
            label="Profile completeness"
            value={`${overallCompleteness}%`}
            sublabel={overallCompleteness < 100 ? "Continue with the AI Assistant" : "All sections complete"}
          />
          <StatCard
            icon={ShieldCheck}
            label="Verification"
            value={isVerified ? "Verified" : "Pending"}
            sublabel={isVerified ? `via ${profile.verification.method || "Self-attestation"}` : "Try instant DigiLocker verification"}
            accentColor={isVerified ? "text-success" : "text-warn"}
          />
          <StatCard
            icon={Briefcase}
            label="Active applications"
            value={activeApplications}
            sublabel={`${applications.length} total submitted`}
          />
          <StatCard
            icon={ClipboardList}
            label="Assessments due"
            value={pendingAssessments.length}
            sublabel={pendingAssessments.length > 0 ? "Test / PS assigned by an employer" : "Nothing pending"}
            accentColor={pendingAssessments.length > 0 ? "text-warn" : "text-accent-dark"}
          />
        </div>

        <div className="mt-6 grid grid-cols-3 gap-5">
          <div className="col-span-2 rounded-lg border border-line bg-surface p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-ink">Continue building your profile</h2>
              <Link
                to="/assistant"
                className="flex items-center gap-1 text-sm font-medium text-accent-dark hover:underline"
              >
                Open AI Assistant <ArrowRight size={14} />
              </Link>
            </div>
            <ProgressBar value={overallCompleteness} label="Overall profile" tone="accent" />
            <div className="mt-5 flex items-start gap-3 rounded-md bg-paper p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-paper">
                <MessageCircle size={16} />
              </div>
              <div>
                <p className="text-sm font-medium text-ink">Saathi, your assistant, is ready</p>
                <p className="mt-0.5 text-sm text-ink-soft">
                  A short guided conversation covers identity, education, training, employment, preferences and
                  verification — usually under five minutes.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-line bg-surface p-6">
            <h2 className="mb-4 text-base font-semibold text-ink">Currently in</h2>
            <div className="rounded-md border-l-4 border-accent bg-paper px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-accent-dark">
                {currentStageEntry.title}
              </p>
              <p className="mt-1 text-sm text-ink">{currentStageEntry.summary}</p>
              <p className="mt-2 text-xs text-ink-faint">{currentStageEntry.date}</p>
            </div>
            <Link
              to="/journey"
              className="mt-4 flex items-center gap-1 text-sm font-medium text-accent-dark hover:underline"
            >
              View full journey <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {notifications.length > 0 && (
          <div className="mt-6 rounded-lg border border-line bg-surface p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-ink">Needs your attention</h2>
              <span className="text-xs text-ink-faint">{notifications.length} item(s)</span>
            </div>
            <div className="flex flex-col gap-3">
              {notifications.slice(0, 3).map((n) => (
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

        <div className="mt-6 rounded-lg border border-line bg-surface p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-ink">Opportunities matched to you</h2>
              <ProvenanceBadge kind="predicted" />
            </div>
            <Link
              to="/skills"
              className="flex items-center gap-1 text-sm font-medium text-accent-dark hover:underline"
            >
              See all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {opportunities.slice(0, 2).map((op) => (
              <div key={op.id} className="rounded-md border border-line p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-ink">{op.role}</p>
                    <p className="text-xs text-ink-soft">{op.employer}</p>
                  </div>
                  <span className="shrink-0 rounded-sm bg-success-soft px-2 py-1 text-xs font-medium text-success">
                    {op.match}% match
                  </span>
                </div>
                <p className="mt-3 text-xs text-ink-faint">
                  {op.location} · {op.wage}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-3 text-[11px] text-ink-faint">
          Readiness and match scores are model-projected — see Skills &amp; Opportunities for details.
        </p>
      </div>
    </>
  );
}
