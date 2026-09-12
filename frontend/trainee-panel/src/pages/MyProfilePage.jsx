import React from "react";
import TopBar from "../components/layout/TopBar";
import EditableField from "../components/profilepage/EditableField";
import VerificationCard from "../components/profile/VerificationCard";
import ProgressBar from "../components/common/ProgressBar";
import ProvenanceBadge from "../components/common/ProvenanceBadge";
import DigiLockerCard from "../components/verification/DigiLockerCard";
import DownloadReportButton from "../components/profile/DownloadReportButton";
import { useProfile } from "../context/ProfileContext";
import { useLanguage } from "../context/LanguageContext";

const SECTIONS = [
  {
    key: "identity",
    title: "Identity",
    description: "Basic details used to identify you across KaushalSetu.",
    provenance: "self-reported",
    fields: [
      ["fullName", "Full name"],
      ["dob", "Date of birth"],
      ["gender", "Gender"],
      ["state", "State"],
      ["district", "District"],
    ],
  },
  {
    key: "education",
    title: "Education",
    description: "Your academic background prior to skilling.",
    provenance: "self-reported",
    fields: [
      ["qualification", "Highest qualification"],
      ["field", "Field of study"],
      ["yearCompleted", "Year completed"],
    ],
  },
  {
    key: "training",
    title: "Training",
    description: "Details of the skilling program you enrolled in.",
    provenance: "assessed",
    fields: [
      ["scheme", "Scheme / program"],
      ["courseName", "Course name"],
      ["status", "Status"],
      ["score", "Assessment score"],
    ],
  },
  {
    key: "employment",
    title: "Employment",
    description: "Your current work status, if any.",
    provenance: "self-reported",
    fields: [
      ["status", "Employment status"],
      ["employer", "Employer"],
      ["wageBand", "Current wage band"],
    ],
  },
  {
    key: "preferences",
    title: "Preferences",
    description: "What you're looking for in your next role.",
    provenance: null,
    fields: [
      ["roles", "Preferred roles"],
      ["location", "Preferred location"],
      ["expectedSalary", "Expected salary"],
      ["relocate", "Willing to relocate"],
    ],
  },
];

export default function MyProfilePage() {
  const { profile, setField, overallCompleteness } = useProfile();
  const { t } = useLanguage();

  return (
    <>
      <TopBar title={t("profile_title")} subtitle={t("profile_subtitle")}>
        <DownloadReportButton />
      </TopBar>
      <div className="flex-1 overflow-y-auto px-8 py-6 scrollbar-thin">
        <div className="mb-6 max-w-md">
          <ProgressBar value={overallCompleteness} label="Overall completeness" />
        </div>

        <div className="grid grid-cols-2 gap-5">
          {SECTIONS.map((section) => (
            <div key={section.key} className="rounded-lg border border-line bg-surface p-6">
              <div className="mb-0.5 flex items-center gap-2">
                <h2 className="text-base font-semibold text-ink">{section.title}</h2>
                {section.provenance && <ProvenanceBadge kind={section.provenance} />}
              </div>
              <p className="mb-4 mt-0.5 text-xs text-ink-soft">{section.description}</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                {section.fields.map(([key, label]) => {
                  const value = profile[section.key][key];
                  const isArray = Array.isArray(value);
                  return (
                    <div key={key} className={isArray ? "col-span-2" : ""}>
                      <EditableField
                        label={label}
                        value={isArray ? value.join(", ") : value}
                        onChange={(v) =>
                          setField(
                            `${section.key}.${key}`,
                            isArray ? v.split(",").map((s) => s.trim()).filter(Boolean) : v
                          )
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="col-span-2 rounded-lg border border-line bg-surface p-6">
            <h2 className="text-base font-semibold text-ink">Verification</h2>
            <p className="mb-4 mt-0.5 text-xs text-ink-soft">
              Confirmed through KaushalSetu's identity and certificate checks.
            </p>
            <div className="grid grid-cols-2 gap-5">
              <div className="flex flex-col gap-2.5">
                <VerificationCard label="Identity (Aadhaar-linked)" status={profile.verification.identity} method={profile.verification.method} />
                <VerificationCard label="Training certificate" status={profile.verification.certificate} method={profile.verification.method} />
              </div>
              <DigiLockerCard />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
