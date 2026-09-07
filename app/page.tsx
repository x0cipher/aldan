"use client";

import React, { useState } from "react";
import { useChat } from "ai/react";
import { Sidebar } from "@/components/chat/sidebar";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatInput } from "@/components/chat/chat-input";
import { ArtifactPanel, type ArtifactData } from "@/components/artifacts/artifact-panel";
import { DEFAULT_MODEL } from "@/lib/ai/gemini";

export default function ChatPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini-2.0-flash");
  const [selectedArtifact, setSelectedArtifact] = useState<ArtifactData | null>(null);
  const [conversationId, setConversationId] = useState<string>(() => `conv_${Date.now()}`);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    stop,
    setMessages,
  } = useChat({
    api: "/api/chat",
    body: {
      model: selectedModel,
      conversationId,
    },
  });

  const handleNewChat = () => {
    setMessages([]);
    setSelectedArtifact(null);
    setConversationId(`conv_${Date.now()}`);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-950">
      {/* Collapsible Left Navigation */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onNewChat={handleNewChat}
      />

      {/* Main Conversation Canvas */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-12 border-b border-zinc-800/60 px-4 flex items-center justify-between bg-zinc-950/40 backdrop-blur z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-zinc-400">Session</span>
            <span className="text-xs font-mono text-zinc-500 truncate max-w-[200px]">
              {conversationId}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] text-zinc-400 font-mono">
              Adaptive Harness Active
            </span>
          </div>
        </header>

        <div className="flex-1 flex flex-col overflow-hidden relative">
          <ChatMessages
            messages={messages}
            isLoading={isLoading}
            onSelectArtifact={(artifact) => setSelectedArtifact(artifact)}
          />

          <ChatInput
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            stop={stop}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />
        </div>
      </main>

      {/* Side-by-side Artifact & Code Workspace */}
      <ArtifactPanel
        artifact={selectedArtifact}
        onClose={() => setSelectedArtifact(null)}
      />
    </div>
  );
}
