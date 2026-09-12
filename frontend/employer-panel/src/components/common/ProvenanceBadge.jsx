import React from "react";
import { ShieldCheck, Sparkles, ClipboardCheck } from "lucide-react";

// Labels a figure or status by where it came from, so a model-generated
// match score is never confused with a confirmed, backend-verified fact —
// the same idea used across the Government Portal and Trainee Panel.
const KINDS = {
  verified: { label: "Verified", icon: ShieldCheck, className: "bg-success-soft text-success" },
  digilocker: { label: "DigiLocker Verified", icon: ShieldCheck, className: "bg-success-soft text-success" },
  predicted: { label: "Model-matched", icon: Sparkles, className: "bg-accent-soft text-accent-dark" },
  assessed: { label: "Assessment-scored", icon: ClipboardCheck, className: "bg-accent-soft text-accent-dark" },
};

export default function ProvenanceBadge({ kind = "predicted", className = "" }) {
  const cfg = KINDS[kind] || KINDS.predicted;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-[10px] font-medium leading-none ${cfg.className} ${className}`}
    >
      <Icon size={11} strokeWidth={2.5} />
      {cfg.label}
    </span>
  );
}
