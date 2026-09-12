import React from "react";
import { Loader2 } from "lucide-react";

export default function Spinner({ label = "Loading…", className = "" }) {
  return (
    <div className={`flex items-center justify-center gap-2 py-16 text-sm text-ink-soft ${className}`}>
      <Loader2 size={18} className="animate-spin" />
      <span>{label}</span>
    </div>
  );
}
