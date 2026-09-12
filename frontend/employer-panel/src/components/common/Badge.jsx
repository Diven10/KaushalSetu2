import React from "react";

// The portal's status pills: square-ish corners, small caps weight, tinted
// background from the shared status palette.
const TONES = {
  neutral: "bg-line-soft text-ink-soft",
  accent: "bg-accent-soft text-accent-dark",
  success: "bg-success-soft text-success",
  caution: "bg-caution-soft text-caution",
  alert: "bg-alert-soft text-alert",
  warn: "bg-warn-soft text-warn",
};

export default function Badge({ children, tone = "neutral", className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm px-2 py-[3px] text-[11px] font-semibold leading-none ${
        TONES[tone] || TONES.neutral
      } ${className}`}
    >
      {children}
    </span>
  );
}
