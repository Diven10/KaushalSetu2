import React from "react";
import { Check, X } from "lucide-react";

export default function ApplicationStatusTrack({ stages, currentStage, rejected }) {
  const currentIdx = stages.indexOf(currentStage);

  return (
    <ol className="flex w-full items-center" aria-label="Application status">
      {stages.map((stage, idx) => {
        const isPast = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        const isFailedHere = rejected && isCurrent;
        return (
          <li key={stage} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-semibold ${
                  isFailedHere
                    ? "border-warn bg-warn text-white"
                    : isPast || (isCurrent && !rejected && currentIdx === stages.length - 1)
                    ? "border-success bg-success text-white"
                    : isCurrent
                    ? "border-ink bg-ink text-paper"
                    : "border-line bg-surface text-ink-faint"
                }`}
              >
                {isFailedHere ? (
                  <X size={12} strokeWidth={3} />
                ) : isPast || (isCurrent && currentIdx === stages.length - 1 && !rejected) ? (
                  <Check size={12} strokeWidth={3} />
                ) : (
                  idx + 1
                )}
              </div>
              <span className={`whitespace-nowrap text-[10px] font-medium ${idx <= currentIdx ? "text-ink" : "text-ink-faint"}`}>
                {stage}
              </span>
            </div>
            {idx < stages.length - 1 && (
              <div className={`mx-1.5 h-px flex-1 ${idx < currentIdx ? "bg-success" : "bg-line"}`} style={{ marginBottom: 14 }} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
