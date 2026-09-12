import React, { useState } from "react";
import { ShieldCheck, Landmark, Loader2, FileCheck2 } from "lucide-react";
import { useProfile } from "../../context/ProfileContext";
import { DIGILOCKER_DOCUMENT_TYPES } from "../../data/appData";
import ProvenanceBadge from "../common/ProvenanceBadge";

// idle -> consenting -> fetching -> done
export default function DigiLockerCard() {
  const { profile, connectDigiLocker } = useProfile();
  const [phase, setPhase] = useState(
    profile.verification.method === "DigiLocker" ? "done" : "idle"
  );

  function startConsent() {
    setPhase("consenting");
  }

  function grantConsent() {
    setPhase("fetching");
    setTimeout(() => {
      const documents = DIGILOCKER_DOCUMENT_TYPES.map((d) => ({
        ...d,
        fetchedOn: new Date().toISOString().slice(0, 10),
      }));
      connectDigiLocker(documents);
      setPhase("done");
    }, 1400);
  }

  if (phase === "done") {
    return (
      <div className="rounded-md border border-success/30 bg-success-soft p-4">
        <div className="mb-2 flex items-center gap-2">
          <ShieldCheck size={18} className="text-success" strokeWidth={2} />
          <p className="text-sm font-semibold text-ink">DigiLocker verification complete</p>
          <ProvenanceBadge kind="digilocker" />
        </div>
        <div className="flex flex-col gap-1.5">
          {profile.verification.documents.map((doc) => (
            <div key={doc.key} className="flex items-center justify-between text-xs text-ink-soft">
              <span className="flex items-center gap-1.5">
                <FileCheck2 size={12} className="text-success" /> {doc.label} · {doc.issuer}
              </span>
              <span className="text-ink-faint">Fetched {doc.fetchedOn}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-line bg-paper p-4">
      <div className="mb-2 flex items-center gap-2">
        <Landmark size={18} className="text-ink-soft" strokeWidth={2} />
        <p className="text-sm font-semibold text-ink">Verify instantly with DigiLocker</p>
      </div>
      <p className="mb-3 text-xs text-ink-soft">
        Fetch your Aadhaar e-KYC, qualification marksheet and training certificate directly from the
        Government of India's DigiLocker, instead of manual self-attestation.
      </p>

      {phase === "idle" && (
        <button
          type="button"
          onClick={startConsent}
          className="rounded-md bg-ink px-4 py-2 text-xs font-medium text-paper"
        >
          Connect DigiLocker
        </button>
      )}

      {phase === "consenting" && (
        <div className="rounded-md border border-line bg-surface p-3">
          <p className="mb-2 text-xs text-ink-soft">
            KaushalSetu is requesting access to the following documents from your DigiLocker account:
          </p>
          <ul className="mb-3 flex flex-col gap-1 text-xs text-ink">
            {DIGILOCKER_DOCUMENT_TYPES.map((d) => (
              <li key={d.key}>• {d.label} <span className="text-ink-faint">({d.issuer})</span></li>
            ))}
          </ul>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={grantConsent}
              className="rounded-md bg-ink px-3.5 py-1.5 text-xs font-medium text-paper"
            >
              Allow access
            </button>
            <button
              type="button"
              onClick={() => setPhase("idle")}
              className="rounded-md border border-line px-3.5 py-1.5 text-xs font-medium text-ink-soft"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {phase === "fetching" && (
        <div className="flex items-center gap-2 text-xs text-ink-soft">
          <Loader2 size={14} className="animate-spin" /> Fetching documents from DigiLocker…
        </div>
      )}
    </div>
  );
}
