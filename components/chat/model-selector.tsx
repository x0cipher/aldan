"use client";

import React from "react";
import { SUPPORTED_MODELS, DEFAULT_MODEL } from "@/lib/ai/gemini";
import { Sparkles } from "lucide-react";

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

export function ModelSelector({
  selectedModel,
  onModelChange,
}: ModelSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative inline-flex items-center">
        <Sparkles className="absolute left-2.5 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
        <select
          value={selectedModel}
          onChange={(e) => onModelChange(e.target.value)}
          className="appearance-none bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs rounded-lg pl-8 pr-7 py-1.5 focus:outline-none focus:ring-1 focus:ring-zinc-700 hover:border-zinc-700 transition cursor-pointer font-medium"
        >
          <option value="aldan-stateful-v1">
            Aldan Adaptive v1 (Stateful)
          </option>
          {SUPPORTED_MODELS.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name} {model.recommended ? "★" : ""}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
