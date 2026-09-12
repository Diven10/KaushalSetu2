import React from "react";
import Avatar from "../common/Avatar";

export default function TypingIndicator() {
  return (
    <div className="flex items-end gap-2.5 animate-fade-in">
      <Avatar type="bot" size={28} />
      <div className="flex items-center gap-1 rounded-t-lg rounded-br-lg rounded-bl-sm bg-surface px-4 py-3.5 shadow-panel">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-ink-faint animate-blink"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
