import React, { useState } from "react";
import { ShieldCheck, Landmark, Loader2, FileCheck2, AlertTriangle } from "lucide-react";
import { verifyEmployerViaDigiLocker } from "../../services/api";

const DOCUMENT_TYPES = [
  { key: "gstin", label: "GSTIN Certificate", issuer: "GST Network" },
  { key: "incorporation", label: "Certificate of Incorporation / MSME Registration", issuer: "Ministry of Corporate Affairs" },
  { key: "signatory_id", label: "Authorized Signatory ID", issuer: "UIDAI" },
];

// idle -> consenting -> fetching -> saving -> done | error
export default function DigiLockerBusinessCard({ initialStatus }) {
  const [phase, setPhase] = useState(initialStatus === "verified" ? "done" : "idle");
  const [documents, setDocuments] = useState(initialStatus === "verified" ? DOCUMENT_TYPES.map((d) => ({ ...d, fetchedOn: "—" })) : []);
  const [error, setError] = useState(null);

  function startConsent() {
    setError(null);
    setPhase("consenting");
  }

  function grantConsent() {
    setPhase("fetching");
    // The consent screen and document "fetch" are simulated here for the
    // same reason as the trainee panel's DigiLocker card: real DigiLocker
    // integration requires onboarding as a Requester via the DigiLocker /
    // API Setu partner programme. What happens next — persisting the
    // verified status — is a real API call, not simulated.
    setTimeout(async () => {
      const fetchedDocs = DOCUMENT_TYPES.map((d) => ({ ...d, fetchedOn: new Date().toISOString().slice(0, 10) }));
      setPhase("saving");
      try {
        await verifyEmployerViaDigiLocker(fetchedDocs);
        setDocuments(fetchedDocs);
        setPhase("done");
      } catch (err) {
        setError(err);
        setPhase("error");
      }
    }, 1400);
  }

  if (phase === "done") {
    return (
      <div className="rounded-md border border-success/30 bg-success-soft p-4">
        <div className="mb-2 flex items-center gap-2">
          <ShieldCheck size={18} className="text-success" strokeWidth={2} />
          <p className="text-sm font-semibold text-ink">Company verified via DigiLocker</p>
        </div>
        <div className="flex flex-col gap-1.5">
          {documents.map((doc) => (
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
        <p className="text-sm font-semibold text-ink">Verify your company with DigiLocker</p>
      </div>
      <p className="mb-3 text-xs text-ink-soft">
        Fetch your GSTIN certificate and incorporation/MSME registration directly from DigiLocker so
        trainees see a verified employer badge on your postings.
      </p>

      {phase === "idle" && (
        <button type="button" onClick={startConsent} className="rounded-md bg-ink px-4 py-2 text-xs font-medium text-paper">
          Connect DigiLocker
        </button>
      )}

      {phase === "consenting" && (
        <div className="rounded-md border border-line bg-surface p-3">
          <p className="mb-2 text-xs text-ink-soft">KaushalSetu is requesting access to:</p>
          <ul className="mb-3 flex flex-col gap-1 text-xs text-ink">
            {DOCUMENT_TYPES.map((d) => (
              <li key={d.key}>
                • {d.label} <span className="text-ink-faint">({d.issuer})</span>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <button type="button" onClick={grantConsent} className="rounded-md bg-ink px-3.5 py-1.5 text-xs font-medium text-paper">
              Allow access
            </button>
            <button type="button" onClick={() => setPhase("idle")} className="rounded-md border border-line px-3.5 py-1.5 text-xs font-medium text-ink-soft">
              Cancel
            </button>
          </div>
        </div>
      )}

      {(phase === "fetching" || phase === "saving") && (
        <div className="flex items-center gap-2 text-xs text-ink-soft">
          <Loader2 size={14} className="animate-spin" />
          {phase === "fetching" ? "Fetching documents from DigiLocker…" : "Saving verification to your profile…"}
        </div>
      )}

      {phase === "error" && (
        <div className="flex flex-col gap-2">
          <p className="flex items-center gap-1.5 text-xs text-warn">
            <AlertTriangle size={13} /> {error?.message || "Couldn't save verification."}
          </p>
          <button type="button" onClick={startConsent} className="w-fit rounded-md border border-line px-3.5 py-1.5 text-xs font-medium text-ink-soft">
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
