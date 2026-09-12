import React from "react";
import { Check, Circle, Clock } from "lucide-react";

const STATUS_STYLES = {
  complete: {
    dot: "bg-success border-success text-white",
    icon: Check,
    label: "Complete",
    labelClass: "text-success",
  },
  current: {
    dot: "bg-ink border-ink text-paper",
    icon: Circle,
    label: "In progress",
    labelClass: "text-accent-dark",
  },
  upcoming: {
    dot: "bg-surface border-line text-ink-faint",
    icon: Clock,
    label: "Upcoming",
    labelClass: "text-ink-faint",
  },
};

export default function TimelineNode({ item, isLast }) {
  const style = STATUS_STYLES[item.status];
  const Icon = style.icon;

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${style.dot}`}>
          <Icon size={14} strokeWidth={2.5} />
        </div>
        {!isLast && <div className={`w-px flex-1 ${item.status === "complete" ? "bg-success" : "bg-line"}`} />}
      </div>

      <div className={`pb-8 ${isLast ? "pb-0" : ""}`}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h3 className="text-sm font-semibold text-ink">{item.title}</h3>
          <span className={`text-xs font-medium ${style.labelClass}`}>{style.label}</span>
        </div>
        <p className="mt-0.5 text-xs text-ink-faint">{item.date}</p>
        <p className="mt-2 max-w-lg text-sm text-ink-soft">{item.summary}</p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-sm bg-paper px-3 py-1.5">
          <span className="text-xs text-ink-faint">{item.metric.label}</span>
          <span className="text-xs font-semibold text-ink">{item.metric.value}</span>
        </div>
      </div>
    </div>
  );
}
