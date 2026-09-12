import React from "react";
import { ShieldCheck, ShieldQuestion } from "lucide-react";
import ProvenanceBadge from "../common/ProvenanceBadge";

export default function VerificationCard({ label, status, method }) {
  const isVerified = status === "Verified";
  return (
    <div
      className={`flex items-center gap-3 rounded-md border px-3 py-2.5 ${
        isVerified ? "border-success/30 bg-success-soft" : "border-line bg-paper"
      }`}
    >
      {isVerified ? (
        <ShieldCheck size={18} className="shrink-0 text-success" strokeWidth={2} />
      ) : (
        <ShieldQuestion size={18} className="shrink-0 text-ink-faint" strokeWidth={2} />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink">{label}</p>
        <p className={`text-xs ${isVerified ? "text-success" : "text-ink-faint"}`}>
          {isVerified ? "Verified" : "Pending verification"}
        </p>
      </div>
      {isVerified && method && <ProvenanceBadge kind={method === "DigiLocker" ? "digilocker" : "verified"} />}
    </div>
  );
}
