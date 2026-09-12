import React from "react";
import TopBar from "../components/layout/TopBar";
import ChatWindow from "../components/chat/ChatWindow";
import ProfilePanel from "../components/profile/ProfilePanel";
import ProgressStepper from "../components/profile/ProgressStepper";
import { useProfile } from "../context/ProfileContext";

export default function AssistantPage() {
  const { furthestStage, stageCompleteness } = useProfile();

  return (
    <>
      <TopBar title="AI Assistant" subtitle="Chat with Saathi to build your career profile step by step." />
      <div className="border-b border-line bg-surface px-8 py-4">
        <ProgressStepper currentStage={furthestStage} stageCompleteness={stageCompleteness} />
      </div>
      <div className="flex min-h-0 flex-1">
        <ChatWindow />
        <ProfilePanel />
      </div>
    </>
  );
}
