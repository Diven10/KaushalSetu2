import React from "react";
import { ClipboardList } from "lucide-react";
import TopBar from "../components/layout/TopBar";
import AssessmentCard from "../components/assessments/AssessmentCard";
import EmptyState from "../components/common/EmptyState";
import { useAppData } from "../context/AppDataContext";
import { useLanguage } from "../context/LanguageContext";

export default function AssessmentsPage() {
  const { assessments } = useAppData();
  const { t } = useLanguage();

  const pending = assessments.filter((a) => a.status === "Assigned" || a.status === "In Progress");
  const done = assessments.filter((a) => a.status === "Submitted" || a.status === "Evaluated");

  return (
    <>
      <TopBar title={t("assessments_title")} subtitle={t("assessments_subtitle")} />
      <div className="flex-1 overflow-y-auto px-8 py-6 scrollbar-thin">
        {assessments.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No assessments assigned yet"
            description="When an employer shortlists you, they may assign a test or problem statement here before hiring."
          />
        ) : (
          <div className="flex flex-col gap-8">
            {pending.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-faint">Pending</h2>
                <div className="grid grid-cols-2 gap-4">
                  {pending.map((a) => (
                    <AssessmentCard key={a.id} assessment={a} />
                  ))}
                </div>
              </section>
            )}
            {done.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-faint">Submitted / Evaluated</h2>
                <div className="grid grid-cols-2 gap-4">
                  {done.map((a) => (
                    <AssessmentCard key={a.id} assessment={a} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </>
  );
}
