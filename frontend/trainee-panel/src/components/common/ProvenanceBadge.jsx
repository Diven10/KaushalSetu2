import React from "react";
import { ShieldCheck, UserCheck, Sparkles, ClipboardCheck } from "lucide-react";

// Consistent labelling of where a piece of data came from, so a projected
// figure is never mistaken for a confirmed one — same idea as the
// government portal's Observed / Predicted / Recommended badges, applied at
// the level of a single trainee's data instead of a district's.
const KINDS = {
  "self-reported": { label: "Self-reported", icon: UserCheck, className: "bg-line-soft text-ink-soft" },
  verified: { label: "Verified", icon: ShieldCheck, className: "bg-success-soft text-success" },
  digilocker: { label: "DigiLocker Verified", icon: ShieldCheck, className: "bg-success-soft text-success" },
  predicted: { label: "Projected", icon: Sparkles, className: "bg-accent-soft text-accent-dark" },
  assessed: { label: "Assessment-verified", icon: ClipboardCheck, className: "bg-accent-soft text-accent-dark" },
};

export default function ProvenanceBadge({ kind = "self-reported", className = "" }) {
  const cfg = KINDS[kind] || KINDS["self-reported"];
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
