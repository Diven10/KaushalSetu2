import React, { useState } from "react";
import { UploadCloud } from "lucide-react";

export default function PsSubmission({ assessment, onSubmit }) {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-line bg-surface p-5">
        <p className="text-sm font-semibold text-ink">Problem statement</p>
        <p className="mt-1.5 text-sm text-ink-soft">{assessment.brief}</p>
      </div>

      <div className="rounded-lg border border-line bg-surface p-5">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-ink-soft">Your write-up / link to your work</span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            placeholder="Describe your approach, and paste a link or code snippet here…"
            className="rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none"
          />
        </label>

        <label className="mt-3 flex w-fit cursor-pointer items-center gap-2 rounded-md border border-dashed border-line px-3 py-2 text-xs text-ink-soft hover:border-ink-soft">
          <UploadCloud size={14} />
          {fileName || "Attach a file (optional)"}
          <input
            type="file"
            className="hidden"
            onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
          />
        </label>
      </div>

      <button
        type="button"
        disabled={!text.trim()}
        onClick={() => onSubmit(fileName ? `${text}\n\nAttachment: ${fileName}` : text)}
        className="self-start rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
      >
        Submit for review
      </button>
    </div>
  );
}
