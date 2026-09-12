import React from "react";
import { Sparkles, User } from "lucide-react";

export default function Avatar({ type = "bot", size = 32 }) {
  const isBot = type === "bot";
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full ${
        isBot ? "bg-ink text-paper" : "bg-accent-soft text-accent-dark"
      }`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {isBot ? <Sparkles size={size * 0.5} strokeWidth={2} /> : <User size={size * 0.5} strokeWidth={2} />}
    </div>
  );
}
