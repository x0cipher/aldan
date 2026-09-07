"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Copy, Check, Code2, Eye } from "lucide-react";

export interface ArtifactData {
  id: string;
  title: string;
  type: "code" | "markdown" | "html" | "svg";
  language?: string;
  content: string;
}

interface ArtifactPanelProps {
  artifact: ArtifactData | null;
  onClose: () => void;
}

export function ArtifactPanel({ artifact, onClose }: ArtifactPanelProps) {
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<"code" | "preview">("code");

  if (!artifact) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(artifact.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasPreview =
    artifact.type === "html" ||
    artifact.type === "svg" ||
    artifact.type === "markdown";

  return (
    <div className="flex flex-col h-full border-l border-zinc-800 bg-zinc-950/80 backdrop-blur w-full md:w-[540px] lg:w-[620px] transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center gap-2 overflow-hidden">
          <Code2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="text-sm font-semibold text-zinc-100 truncate">
            {artifact.title}
          </span>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-zinc-800 text-zinc-300">
            {artifact.language || artifact.type}
          </Badge>
        </div>

        <div className="flex items-center gap-1.5">
          {hasPreview && (
            <div className="flex bg-zinc-800 rounded-md p-0.5 mr-2 text-xs">
              <button
                onClick={() => setTab("code")}
                className={`px-2 py-1 rounded flex items-center gap-1 ${
                  tab === "code"
                    ? "bg-zinc-700 text-zinc-100 font-medium"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Code2 className="h-3 w-3" /> Code
              </button>
              <button
                onClick={() => setTab("preview")}
                className={`px-2 py-1 rounded flex items-center gap-1 ${
                  tab === "preview"
                    ? "bg-zinc-700 text-zinc-100 font-medium"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Eye className="h-3 w-3" /> Preview
              </button>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-zinc-400 hover:text-zinc-100"
            onClick={handleCopy}
            title="Copy content"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-zinc-400 hover:text-zinc-100"
            onClick={onClose}
            title="Close workspace panel"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-4 font-mono text-xs">
        {tab === "code" ? (
          <pre className="text-zinc-300 leading-relaxed overflow-x-auto whitespace-pre">
            <code>{artifact.content}</code>
          </pre>
        ) : (
          <div className="h-full w-full bg-white rounded p-4 text-zinc-900 font-sans">
            {artifact.type === "html" || artifact.type === "svg" ? (
              <iframe
                title="Artifact Live Preview"
                srcDoc={artifact.content}
                className="w-full h-full border-0"
                sandbox="allow-scripts"
              />
            ) : (
              <div className="whitespace-pre-wrap">{artifact.content}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
