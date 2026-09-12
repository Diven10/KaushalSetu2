import React from "react";
import ApplicationCard from "./ApplicationCard";

const COLUMNS = [
  { key: "applied", label: "Applied" },
  { key: "shortlisted", label: "Shortlisted" },
  { key: "interview", label: "Interview" },
  { key: "hired", label: "Hired" },
  { key: "rejected", label: "Rejected" },
];

export default function PipelineBoard({ applications, onStatusChange, assessments = [], onAssign }) {
  return (
    <div className="grid grid-cols-5 gap-4">
      {COLUMNS.map((col) => {
        const items = applications.filter((a) => a.status === col.key);
        return (
          <div key={col.key} className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-medium uppercase tracking-wide text-ink-faint">{col.label}</h3>
              <span className="text-xs font-medium text-ink-soft">{items.length}</span>
            </div>
            <div className="flex flex-col gap-2 rounded-lg bg-line-soft/40 p-2 min-h-[120px]">
              {items.map((app) => (
                <ApplicationCard
                  key={app.id}
                  application={app}
                  onStatusChange={onStatusChange}
                  assessments={assessments}
                  onAssign={onAssign}
                />
              ))}
              {items.length === 0 && (
                <p className="px-1 py-3 text-center text-xs text-ink-faint">None yet</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
