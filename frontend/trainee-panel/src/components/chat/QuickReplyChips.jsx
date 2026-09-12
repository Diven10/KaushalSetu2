import React, { useState } from "react";
import { Check } from "lucide-react";

export default function QuickReplyChips({ options, multi = false, onSubmit }) {
  const [selected, setSelected] = useState([]);

  const toggle = (option) => {
    if (!multi) {
      onSubmit(option);
      return;
    }
    setSelected((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-2 pl-[38px] pt-1 animate-fade-in">
      {options.map((option) => {
        const isSelected = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => toggle(option)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
              isSelected
                ? "border-accent bg-accent-soft text-accent-dark"
                : "border-line bg-surface text-ink hover:border-ink-soft"
            }`}
          >
            {multi && isSelected && <Check size={13} strokeWidth={2.5} />}
            {option}
          </button>
        );
      })}
      {multi && (
        <button
          type="button"
          disabled={selected.length === 0}
          onClick={() => onSubmit(selected)}
          className="ml-1 rounded-full bg-ink px-4 py-1.5 text-[13px] font-medium text-paper transition-opacity disabled:opacity-30"
        >
          Continue
        </button>
      )}
    </div>
  );
}
