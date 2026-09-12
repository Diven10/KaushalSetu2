import React, { useState } from "react";
import { ArrowUp } from "lucide-react";

export default function ChatInput({ placeholder, optional, disabled, onSubmit }) {
  const [value, setValue] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value.trim()) return;
    onSubmit(value.trim());
    setValue("");
  };

  const handleSkip = () => {
    onSubmit("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-line bg-surface px-6 py-4">
      <input
        type="text"
        value={value}
        disabled={disabled}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder || "Type your answer..."}
        className="flex-1 rounded-md border border-line bg-paper px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none disabled:opacity-50"
      />
      {optional && (
        <button
          type="button"
          onClick={handleSkip}
          disabled={disabled}
          className="shrink-0 rounded-md px-3 py-2.5 text-sm font-medium text-ink-soft hover:bg-paper disabled:opacity-40"
        >
          Skip
        </button>
      )}
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        aria-label="Send message"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-ink text-paper transition-opacity disabled:opacity-30"
      >
        <ArrowUp size={18} strokeWidth={2.25} />
      </button>
    </form>
  );
}
