import React from "react";
import { Check } from "lucide-react";
import { STAGES } from "../../data/mockData";

export default function ProgressStepper({ currentStage, stageCompleteness }) {
  const currentIdx = STAGES.findIndex((s) => s.key === currentStage);

  return (
    <ol className="flex w-full items-center" aria-label="Profile build progress">
      {STAGES.map((stage, idx) => {
        const isComplete = idx < currentIdx || stageCompleteness[stage.key] === 100;
        const isCurrent = idx === currentIdx && !isComplete;
        return (
          <li key={stage.key} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold transition-colors ${
                  isComplete
                    ? "border-success bg-success text-white"
                    : isCurrent
                    ? "border-ink bg-ink text-paper"
                    : "border-line bg-surface text-ink-faint"
                }`}
              >
                {isComplete ? <Check size={14} strokeWidth={2.5} /> : idx + 1}
              </div>
              <span
                className={`whitespace-nowrap text-[11px] font-medium ${
                  isCurrent || isComplete ? "text-ink" : "text-ink-faint"
                }`}
              >
                {stage.label}
              </span>
            </div>
            {idx < STAGES.length - 1 && (
              <div
                className={`mx-2 h-px flex-1 ${idx < currentIdx ? "bg-success" : "bg-line"}`}
                style={{ marginBottom: 18 }}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
