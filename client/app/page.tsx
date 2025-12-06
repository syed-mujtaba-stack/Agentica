"use client";

import AnimatedBackground from "@/components/AnimatedBackground";
import ChatInterface from "@/components/ChatInterface";
import Sidebar from "@/components/Sidebar";
import { useState } from "react";

export default function Home() {
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);

  return (
    <main className="relative flex h-screen w-full overflow-hidden bg-black text-white">
      <AnimatedBackground />
      <Sidebar
        onSelectConversation={(id) => setCurrentConversationId(id)}
        currentConversationId={currentConversationId}
      />
      <div className="flex-1 flex flex-col h-full relative z-10">
        <ChatInterface conversationId={currentConversationId} />
      </div>
    </main>
  );
}
