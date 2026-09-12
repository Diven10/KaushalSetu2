import React from "react";

const ROWS = [
  { key: "status", label: "Status", format: (v) => (v === "open" ? "Open" : "Closed") },
  { key: "openings", label: "Openings" },
  { key: "applicant_count", label: "Applicants", fallbackKey: "applicants_count" },
  { key: "strong_match_count", label: "Strong matches (≥75%)" },
  { key: "application_deadline", label: "Deadline" },
  { key: "location", label: "Location" },
  { key: "work_mode", label: "Work mode" },
];

export default function PostingCompareCard({ jobs }) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface">
      <table className="w-full text-sm">
        <thead className="border-b border-line bg-paper text-left text-xs font-medium uppercase tracking-wide text-ink-faint">
          <tr>
            <th className="px-4 py-2.5">Metric</th>
            {jobs.map((job) => (
              <th key={job.id} className="px-4 py-2.5 text-ink">
                {job.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.key} className="border-b border-line-soft last:border-0">
              <td className="px-4 py-2.5 font-medium text-ink-soft">{row.label}</td>
              {jobs.map((job) => {
                const raw = job[row.key] ?? (row.fallbackKey ? job[row.fallbackKey] : undefined);
                const value = raw == null ? "—" : row.format ? row.format(raw) : raw;
                return (
                  <td key={job.id} className="px-4 py-2.5 text-ink">
                    {value}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
