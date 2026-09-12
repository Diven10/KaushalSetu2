import React from "react";
import Avatar from "../common/Avatar";

export default function MessageBubble({ sender, text }) {
  const isBot = sender === "bot";

  return (
    <div className={`flex items-end gap-2.5 animate-fade-in ${isBot ? "" : "flex-row-reverse"}`}>
      <Avatar type={isBot ? "bot" : "user"} size={28} />
      <div
        className={`max-w-[70%] px-4 py-2.5 text-[14px] leading-relaxed ${
          isBot
            ? "rounded-t-lg rounded-br-lg rounded-bl-sm bg-surface text-ink shadow-panel"
            : "rounded-t-lg rounded-bl-lg rounded-br-sm bg-ink text-paper"
        }`}
      >
        {text}
      </div>
    </div>
  );
}
