import { useCallback, useEffect, useRef, useState } from "react";
import { CHAT_SCRIPT, FIRST_STEP_ID, getStepById } from "../data/chatbotScript";
import { useProfile } from "../context/ProfileContext";

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `m-${idCounter}`;
}

function resolveBotMessage(step, answer, profile) {
  return typeof step.bot === "function" ? step.bot(answer, profile) : step.bot;
}

function resolveNextId(step, answer) {
  if (typeof step.next === "function") return step.next(answer);
  return step.next;
}

export function useChatSimulation() {
  const { profile, setField, markStageReached } = useProfile();
  const [messages, setMessages] = useState([]);
  const [currentStepId, setCurrentStepId] = useState(FIRST_STEP_ID);
  const [isTyping, setIsTyping] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const hasStarted = useRef(false);
  const profileRef = useRef(profile);
  profileRef.current = profile;

  const pushBotStep = useCallback(
    (stepId, answerForTemplate) => {
      const step = getStepById(stepId);
      if (!step) return;
      markStageReached(step.stage);
      const rawMessages = resolveBotMessage(step, answerForTemplate, profileRef.current);
      const lines = Array.isArray(rawMessages) ? rawMessages : [rawMessages];

      setIsTyping(true);
      let delay = 450;
      lines.forEach((line, idx) => {
        const isLast = idx === lines.length - 1;
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: nextId(),
              sender: "bot",
              text: line,
              step: isLast ? step : null,
            },
          ]);
          if (isLast) setIsTyping(false);
        }, delay);
        delay += 600 + Math.min(line.length * 6, 500);
      });
      setCurrentStepId(stepId);
      if (step.inputType === "done") setIsDone(true);
    },
    [markStageReached]
  );

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    pushBotStep(FIRST_STEP_ID);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitAnswer = useCallback(
    (rawAnswer) => {
      const step = getStepById(currentStepId);
      if (!step || step.inputType === "done") return;

      const displayText = Array.isArray(rawAnswer) ? rawAnswer.join(", ") : rawAnswer;
      if (!displayText && !step.optional) return;

      setMessages((prev) => [...prev, { id: nextId(), sender: "user", text: displayText || "(skipped)" }]);

      if (step.target) {
        const valueToStore = step.resultValue ? step.resultValue : rawAnswer;
        setField(step.target, valueToStore);
      }

      const nextStepId = resolveNextId(step, rawAnswer);
      if (nextStepId) {
        pushBotStep(nextStepId, rawAnswer);
      } else {
        setIsDone(true);
      }
    },
    [currentStepId, pushBotStep, setField]
  );

  const currentStep = getStepById(currentStepId);

  return {
    messages,
    currentStep,
    isTyping,
    isDone,
    submitAnswer,
  };
}
