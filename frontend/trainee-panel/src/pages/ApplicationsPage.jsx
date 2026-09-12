import React from "react";
import { Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import TopBar from "../components/layout/TopBar";
import ApplicationRow from "../components/applications/ApplicationRow";
import EmptyState from "../components/common/EmptyState";
import { useAppData } from "../context/AppDataContext";
import { useLanguage } from "../context/LanguageContext";

export default function ApplicationsPage() {
  const { applications } = useAppData();
  const { t } = useLanguage();

  return (
    <>
      <TopBar title={t("applications_title")} subtitle={t("applications_subtitle")} />
      <div className="flex-1 overflow-y-auto px-8 py-6 scrollbar-thin">
        {applications.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No applications yet"
            description="Apply to a matched opportunity from Skills & Opportunities to start tracking it here."
            action={
              <Link to="/skills" className="text-sm font-medium text-accent-dark hover:underline">
                Browse opportunities →
              </Link>
            }
          />
        ) : (
          <div className="flex flex-col gap-4">
            {applications.map((app) => (
              <ApplicationRow key={app.id} application={app} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
