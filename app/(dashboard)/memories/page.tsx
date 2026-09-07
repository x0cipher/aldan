"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/chat/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Brain, Plus, Trash2, Sparkles, RefreshCw } from "lucide-react";

interface MemoryItem {
  id: string;
  category: "preference" | "fact" | "instruction" | "style";
  content: string;
  confidence: number | null;
  createdAt: string;
}

export default function MemoriesPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState<"preference" | "fact" | "instruction" | "style">("preference");
  const [saving, setSaving] = useState(false);

  const fetchMemories = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/memories");
      if (res.ok) {
        const data = await res.json();
        setMemories(data.data || []);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    try {
      setSaving(true);
      const res = await fetch("/api/v1/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: newCategory,
          content: newContent.trim(),
        }),
      });

      if (res.ok) {
        setNewContent("");
        fetchMemories();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/memories?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMemories((prev) => prev.filter((m) => m.id !== id));
      }
    } catch {
      //
    }
  };

  const categoryColor = {
    preference: "bg-teal-950 text-teal-300 border-teal-800/60",
    fact: "bg-sky-950 text-sky-300 border-sky-800/60",
    instruction: "bg-amber-950 text-amber-300 border-amber-800/60",
    style: "bg-purple-950 text-purple-300 border-purple-800/60",
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-950">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main className="flex-1 flex flex-col h-full overflow-y-auto p-6 md:p-8">
        <div className="max-w-4xl mx-auto w-full space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                  Learned Memories & Persona
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                </h1>
                <p className="text-xs text-zinc-400">
                  Aldan extracts facts, conventions, and style preferences continuously to personalize your harness.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchMemories}
              disabled={loading}
              className="border-zinc-800 text-zinc-300 hover:text-white"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {/* Quick Add Form */}
          <Card className="border-zinc-800 bg-zinc-900/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-zinc-200">
                Inject Custom Instruction or Rule
              </CardTitle>
              <CardDescription className="text-xs text-zinc-400">
                Explicitly teach Aldan a rule that will be compiled into every future prompt.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddMemory} className="flex flex-col sm:flex-row gap-2.5">
                <select
                  value={newCategory}
                  onChange={(e) =>
                    setNewCategory(
                      e.target.value as "preference" | "fact" | "instruction" | "style"
                    )
                  }
                  className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-zinc-700 font-medium"
                >
                  <option value="preference">Preference</option>
                  <option value="instruction">Instruction</option>
                  <option value="style">Style Guideline</option>
                  <option value="fact">Project Fact</option>
                </select>

                <Input
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="e.g. 'Always use pnpm and strict TypeScript without comments'"
                  className="border-zinc-800 bg-zinc-950 text-xs text-zinc-100 placeholder:text-zinc-500"
                />

                <Button
                  type="submit"
                  size="sm"
                  disabled={saving || !newContent.trim()}
                  className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-medium text-xs whitespace-nowrap"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Save to Brain
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Memories List */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-zinc-300">
              Active Long-Term Memories ({memories.length})
            </h2>

            {loading ? (
              <div className="p-8 text-center text-xs text-zinc-500">
                Loading memories from state store...
              </div>
            ) : memories.length === 0 ? (
              <Card className="border-dashed border-zinc-800 bg-zinc-950/40 p-8 text-center">
                <p className="text-xs text-zinc-400 mb-2">
                  No memories recorded yet.
                </p>
                <p className="text-[11px] text-zinc-500">
                  Chat with Aldan in the Workspace or use the form above to teach your preferences!
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-2.5">
                {memories.map((mem) => (
                  <div
                    key={mem.id}
                    className="flex items-start justify-between p-3.5 rounded-xl border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900/80 transition"
                  >
                    <div className="space-y-1.5 pr-4">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-2 py-0.5 border ${
                            categoryColor[mem.category] || ""
                          }`}
                        >
                          {mem.category}
                        </Badge>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {new Date(mem.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-200 font-medium leading-relaxed">
                        {mem.content}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10"
                      onClick={() => handleDelete(mem.id)}
                      title="Archive memory"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
