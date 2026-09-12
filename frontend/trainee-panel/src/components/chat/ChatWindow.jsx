import React, { useEffect, useRef } from "react";
import { CheckCircle2 } from "lucide-react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import QuickReplyChips from "./QuickReplyChips";
import ChatInput from "./ChatInput";
import { useChatSimulation } from "../../hooks/useChatSimulation";

export default function ChatWindow() {
  const { messages, currentStep, isTyping, isDone, submitAnswer } = useChatSimulation();
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const showChips =
    !isTyping && currentStep && (currentStep.inputType === "chips" || currentStep.inputType === "multiChips");
  const showTextInput = !isTyping && currentStep && currentStep.inputType === "text";

  return (
    <div className="flex h-full flex-1 flex-col bg-paper">
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-6 py-6 scrollbar-thin">
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          {messages.map((m) => (
            <MessageBubble key={m.id} sender={m.sender} text={m.text} />
          ))}

          {isTyping && <TypingIndicator />}

          {showChips && (
            <QuickReplyChips
              options={currentStep.options}
              multi={currentStep.inputType === "multiChips"}
              onSubmit={submitAnswer}
            />
          )}

          {isDone && (
            <div className="ml-[38px] flex items-center gap-2 rounded-md border border-success/30 bg-success-soft px-4 py-3 text-sm font-medium text-success animate-pop-in">
              <CheckCircle2 size={18} strokeWidth={2} />
              Profile complete — nice work.
            </div>
          )}
        </div>
      </div>

      {showTextInput && (
        <div className="w-full bg-surface">
          <div className="mx-auto max-w-2xl">
            <ChatInput
              placeholder={currentStep.placeholder}
              optional={currentStep.optional}
              disabled={isTyping}
              onSubmit={submitAnswer}
            />
          </div>
        </div>
      )}

      {!showTextInput && !isDone && (
        <div className="border-t border-line bg-surface px-6 py-4">
          <p className="mx-auto max-w-2xl text-center text-xs text-ink-faint">
            {isTyping ? "Saathi is typing..." : "Choose an option above to continue"}
          </p>
        </div>
      )}
    </div>
  );
}
