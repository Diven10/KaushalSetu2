import React from "react";
import { Download } from "lucide-react";

function buildReportText(analytics, skillDemand, jobs) {
  const lines = [
    "KaushalSetu — Employer Hiring Report",
    "=".repeat(40),
    `Generated: ${new Date().toLocaleDateString("en-IN")}`,
    "",
    "POSTINGS",
    `Total postings: ${jobs.length}`,
    `Open: ${jobs.filter((j) => j.status === "open").length}`,
    "",
    "FUNNEL & RETENTION",
    `30-day retention: ${analytics?.retention_30_day ?? "—"}%`,
    `90-day retention: ${analytics?.retention_90_day ?? "—"}%`,
    `Avg. time to hire: ${analytics?.avg_time_to_hire_days ?? "—"} days`,
    `Total hires: ${analytics?.total_hires ?? "—"}`,
    "",
    "SKILL DEMAND vs APPLICANT POOL",
    ...(skillDemand || []).map((row) => `${row.skill}: required in ${row.required_count} posting(s), ${row.coverage_percentage}% of applicants meet it`),
  ];
  return lines.join("\n");
}

export default function DownloadHiringReportButton({ analytics, skillDemand, jobs }) {
  function handleDownload() {
    const text = buildReportText(analytics, skillDemand, jobs || []);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "skillconnect_hiring_report.txt";
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
      <Download size={14} /> Download report
    </button>
  );
}
