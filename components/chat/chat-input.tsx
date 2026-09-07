"use client";

import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp, Square } from "lucide-react";
import { ModelSelector } from "./model-selector";

interface ChatInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  stop: () => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
}

export function ChatInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  stop,
  selectedModel,
  onModelChange,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        handleSubmit(e as unknown as React.FormEvent);
      }
    }
  };

  return (
    <div className="p-4 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent">
      <div className="max-w-3xl mx-auto rounded-2xl border border-zinc-800 bg-zinc-900/90 p-2 shadow-2xl focus-within:border-zinc-700 transition">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Message Aldan (or teach it new preferences)..."
          rows={1}
          className="w-full resize-none bg-transparent px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none max-h-48 font-sans"
        />

        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 px-2">
          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={onModelChange}
          />

          <div className="flex items-center gap-2">
            {isLoading ? (
              <Button
                type="button"
                size="sm"
                variant="destructive"
                className="h-8 px-3 text-xs gap-1.5 rounded-lg"
                onClick={stop}
              >
                <Square className="h-3 w-3 fill-current" /> Stop
              </Button>
            ) : (
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim()}
                onClick={handleSubmit}
                className="h-8 w-8 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-zinc-950 disabled:opacity-30 disabled:bg-zinc-800 disabled:text-zinc-500"
              >
                <ArrowUp className="h-4 w-4 stroke-[2.5]" />
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="text-center mt-2 text-[11px] text-zinc-500">
        Aldan automatically compiles your stateful memories and preferences.
      </div>
    </div>
  );
}
