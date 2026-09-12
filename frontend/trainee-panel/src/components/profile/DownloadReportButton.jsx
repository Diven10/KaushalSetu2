import React from "react";
import { Download } from "lucide-react";
import { useProfile } from "../../context/ProfileContext";

// Frontend-only stand-in for a real PDF export: builds a plain-text summary
// and triggers a browser download. Swappable later for a backend-rendered
// PDF without changing how this button is used.
function buildReportText(profile, overallCompleteness) {
  const lines = [
    "KaushalSetu — Trainee Profile Summary",
    "=".repeat(40),
    `Generated: ${new Date().toLocaleDateString("en-IN")}`,
    `Profile completeness: ${overallCompleteness}%`,
    "",
    "IDENTITY",
    `Name: ${profile.identity.fullName || "—"}`,
    `DOB: ${profile.identity.dob || "—"}`,
    `Location: ${profile.identity.district || "—"}, ${profile.identity.state || "—"}`,
    "",
    "EDUCATION",
    `Qualification: ${profile.education.qualification || "—"} (${profile.education.field || "—"}, ${profile.education.yearCompleted || "—"})`,
    "",
    "TRAINING",
    `Scheme: ${profile.training.scheme || "—"}`,
    `Course: ${profile.training.courseName || "—"} — ${profile.training.status || "—"}`,
    `Score: ${profile.training.score || "Not recorded"}`,
    "",
    "EMPLOYMENT",
    `Status: ${profile.employment.status || "—"}`,
    `Employer: ${profile.employment.employer || "—"}`,
    `Wage band: ${profile.employment.wageBand || "—"}`,
    "",
    "PREFERENCES",
    `Preferred roles: ${(profile.preferences.roles || []).join(", ") || "—"}`,
    `Preferred location: ${profile.preferences.location || "—"}`,
    "",
    "VERIFICATION",
    `Identity: ${profile.verification.identity || "Pending"} (${profile.verification.method || "Self-attested"})`,
    `Certificate: ${profile.verification.certificate || "Pending"}`,
  ];
  return lines.join("\n");
}

export default function DownloadReportButton() {
  const { profile, overallCompleteness } = useProfile();

  function handleDownload() {
    const text = buildReportText(profile, overallCompleteness);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(profile.identity.fullName || "trainee").replace(/\s+/g, "_")}_skillconnect_profile.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="flex items-center gap-1.5 rounded-md border border-line px-3.5 py-2 text-xs font-medium text-ink hover:border-ink"
    >
      <Download size={14} /> Download profile summary
    </button>
  );
}
