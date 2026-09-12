import React, { useState } from "react";

export default function McqRunner({ assessment, onSubmit }) {
  const [answers, setAnswers] = useState({});

  const allAnswered = assessment.questions.every((q) => answers[q.id] !== undefined);

  return (
    <div className="flex flex-col gap-6">
      {assessment.questions.map((q, idx) => (
        <div key={q.id} className="rounded-lg border border-line bg-surface p-5">
          <p className="text-sm font-medium text-ink">
            {idx + 1}. {q.prompt}
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {q.options.map((opt, optIdx) => (
              <label
                key={optIdx}
                className={`flex cursor-pointer items-center gap-2.5 rounded-md border px-3 py-2 text-sm transition-colors ${
                  answers[q.id] === optIdx ? "border-ink bg-paper" : "border-line hover:bg-paper"
                }`}
              >
                <input
                  type="radio"
                  name={q.id}
                  className="accent-[#14213D]"
                  checked={answers[q.id] === optIdx}
                  onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                />
                <span className="text-ink-soft">{opt}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      <button
        type="button"
        disabled={!allAnswered}
        onClick={() => onSubmit(answers)}
        className="self-start rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
      >
        Submit test
      </button>
    </div>
  );
}
