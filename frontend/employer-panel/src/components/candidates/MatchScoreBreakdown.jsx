import React from "react";
import ProgressBar from "../common/ProgressBar";

const DIMENSIONS = [
  { key: "skills", label: "Skills" },
  { key: "education", label: "Education" },
  { key: "experience", label: "Experience" },
  { key: "location", label: "Location" },
  { key: "career_preference", label: "Career preference" },
];

export default function MatchScoreBreakdown({ breakdown }) {
  if (!breakdown) return null;

  return (
    <div className="flex flex-col gap-2.5">
      {DIMENSIONS.map(({ key, label }) =>
        breakdown[key] === undefined ? null : (
          <ProgressBar key={key} label={label} value={breakdown[key]} tone="ink" />
        )
      )}
    </div>
  );
}
