import React from "react";
import { useProfile } from "../../context/ProfileContext";
import ProfileField from "./ProfileField";
import VerificationCard from "./VerificationCard";
import ProgressBar from "../common/ProgressBar";

const SECTIONS = [
  {
    key: "identity",
    title: "Identity",
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
    fields: [
      ["qualification", "Qualification"],
      ["field", "Field of study"],
      ["yearCompleted", "Year completed"],
    ],
  },
  {
    key: "training",
    title: "Training",
    fields: [
      ["scheme", "Scheme"],
      ["courseName", "Course"],
      ["status", "Status"],
      ["score", "Score"],
    ],
  },
  {
    key: "employment",
    title: "Employment",
    fields: [
      ["status", "Status"],
      ["employer", "Employer"],
      ["wageBand", "Current wage"],
    ],
  },
  {
    key: "preferences",
    title: "Preferences",
    fields: [
      ["roles", "Preferred roles"],
      ["location", "Preferred location"],
      ["expectedSalary", "Expected salary"],
      ["relocate", "Willing to relocate"],
    ],
  },
];

export default function ProfilePanel() {
  const { profile, overallCompleteness, stageCompleteness } = useProfile();

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col overflow-y-auto border-l border-line bg-surface scrollbar-thin">
      <div className="border-b border-line px-5 py-5">
        <h2 className="text-sm font-semibold text-ink">Live profile</h2>
        <p className="mb-3 mt-0.5 text-xs text-ink-soft">Updates as you chat with Saathi</p>
        <ProgressBar value={overallCompleteness} label="Overall completeness" />
      </div>

      <div className="flex-1 divide-y divide-line-soft px-5">
        {SECTIONS.map((section) => (
          <section key={section.key} className="py-4 animate-fade-in">
            <div className="mb-1 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                {section.title}
              </h3>
              <span className="text-[11px] font-medium text-ink-faint">
                {stageCompleteness[section.key]}%
              </span>
            </div>
            <div className="divide-y divide-line-soft">
              {section.fields.map(([key, label]) => (
                <ProfileField key={key} label={label} value={profile[section.key][key]} />
              ))}
            </div>
          </section>
        ))}

        <section className="py-4">
          <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Verification
          </h3>
          <div className="flex flex-col gap-2 pb-2">
            <VerificationCard label="Identity (Aadhaar-linked)" status={profile.verification.identity} method={profile.verification.method} />
            <VerificationCard label="Training certificate" status={profile.verification.certificate} method={profile.verification.method} />
          </div>
        </section>
      </div>
    </aside>
  );
}
