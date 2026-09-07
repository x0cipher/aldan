"use client";

import React from "react";
import type { Message } from "ai";
import { User, Bot, Sparkles, Code2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ArtifactData } from "../artifacts/artifact-panel";

interface ChatMessagesProps {
  messages: Message[];
  isLoading?: boolean;
  onSelectArtifact?: (artifact: ArtifactData) => void;
}

// Helper to parse artifact blocks from markdown
function parseMessageContent(
  rawContent: string,
  onOpenArtifact?: (artifact: ArtifactData) => void
) {
  const artifactRegex = /```artifact\s*\ntitle:\s*"([^"]+)"\ntype:\s*"([^"]+)"\n(?:language:\s*"([^"]+)"\n)?---\n([\s\S]*?)```/g;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = artifactRegex.exec(rawContent)) !== null) {
    const [fullMatch, title, type, language, content] = match;
    const startIndex = match.index;

    // Text before artifact
    if (startIndex > lastIndex) {
      parts.push(
        <div key={`text-${lastIndex}`} className="whitespace-pre-wrap leading-relaxed">
          {rawContent.slice(lastIndex, startIndex)}
        </div>
      );
    }

    const artifactData: ArtifactData = {
      id: `art_${title.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
      title,
      type: type as ArtifactData["type"],
      language: language || undefined,
      content: content.trim(),
    };

    // Render interactive artifact card
    parts.push(
      <div
        key={`artifact-${startIndex}`}
        onClick={() => onOpenArtifact?.(artifactData)}
        className="my-3 flex items-center justify-between p-3.5 rounded-xl border border-zinc-700/80 bg-zinc-900/90 hover:bg-zinc-800/90 hover:border-emerald-500/50 cursor-pointer transition shadow-md group"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 group-hover:bg-emerald-900/60 transition">
            <Code2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-zinc-100 group-hover:text-emerald-300 transition">
              {title}
            </div>
            <div className="text-xs text-zinc-400">
              Click to inspect {type} in workspace
            </div>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="text-xs border-zinc-700 bg-zinc-800 text-zinc-200 group-hover:border-emerald-500/50 group-hover:text-emerald-300"
        >
          Open Workspace ↗
        </Button>
      </div>
    );

    lastIndex = startIndex + fullMatch.length;
  }

  // Remaining text
  if (lastIndex < rawContent.length) {
    parts.push(
      <div key={`text-${lastIndex}`} className="whitespace-pre-wrap leading-relaxed">
        {rawContent.slice(lastIndex)}
      </div>
    );
  }

  return parts;
}

export function ChatMessages({
  messages,
  isLoading,
  onSelectArtifact,
}: ChatMessagesProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-lg mx-auto">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-zinc-950 shadow-xl shadow-emerald-500/20 mb-4">
          <Sparkles className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-zinc-100 mb-2">
          What are we building today?
        </h2>
        <p className="text-sm text-zinc-400 mb-6">
          Aldan remembers your project conventions, coding preferences, and personal style across conversations.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-left">
          <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/40 text-xs text-zinc-300 hover:border-zinc-700 cursor-pointer transition">
            <span className="font-semibold text-emerald-400 block mb-1">Pair Program</span>
            &quot;Refactor this Next.js route with Zod and TypeScript&quot;
          </div>
          <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/40 text-xs text-zinc-300 hover:border-zinc-700 cursor-pointer transition">
            <span className="font-semibold text-teal-400 block mb-1">Stateful Memory</span>
            &quot;Remember that I always prefer pnpm and strict typing&quot;
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 max-w-3xl mx-auto w-full">
      {messages.map((m) => {
        const isUser = m.role === "user";
        return (
          <div
            key={m.id}
            className={`flex gap-3.5 ${isUser ? "justify-end" : "justify-start"}`}
          >
            {!isUser && (
              <div className="h-7 w-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-emerald-400 shrink-0 mt-1">
                <Bot className="h-4 w-4" />
              </div>
            )}

            <div
              className={`relative group max-w-[88%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                isUser
                  ? "bg-emerald-600 text-white rounded-br-none"
                  : "bg-zinc-900/90 border border-zinc-800 text-zinc-100 rounded-bl-none"
              }`}
            >
              {isUser ? (
                <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
              ) : (
                <div className="space-y-2">
                  {parseMessageContent(m.content, onSelectArtifact)}
                </div>
              )}

              {/* Copy button */}
              {!isUser && (
                <button
                  onClick={() => handleCopy(m.id, m.content)}
                  className="absolute -bottom-5 right-2 opacity-0 group-hover:opacity-100 transition text-[11px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1"
                >
                  {copiedId === m.id ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" /> Copy
                    </>
                  )}
                </button>
              )}
            </div>

            {isUser && (
              <div className="h-7 w-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 shrink-0 mt-1">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        );
      })}

      {isLoading && (
        <div className="flex gap-3.5 items-center text-zinc-400 text-xs py-2">
          <div className="h-7 w-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-emerald-400 shrink-0 animate-pulse">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-mono text-zinc-400">Aldan is thinking & synthesizing...</span>
        </div>
      )}
    </div>
  );
}
