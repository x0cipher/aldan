"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/chat/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Key, Plus, Copy, Check, Trash2, Terminal, Code2 } from "lucide-react";

interface KeyItem {
  id: string;
  name: string;
  start: string;
  enabled: boolean;
  createdAt: string;
  lastRequest: string | null;
}

export default function KeysPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [keys, setKeys] = useState<KeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyName, setKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [creating, setCreating] = useState(false);

  const fetchKeys = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/keys");
      if (res.ok) {
        const data = await res.json();
        setKeys(data.keys || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: keyName || "API Key" }),
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedKey(data.apiKey);
        setKeyName("");
        fetchKeys();
      }
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      const res = await fetch(`/api/keys?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setKeys((prev) => prev.filter((k) => k.id !== id));
      }
    } catch {
      //
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-950">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main className="flex-1 flex flex-col h-full overflow-y-auto p-6 md:p-8">
        <div className="max-w-4xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Key className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-100">
                API Keys & Programmatic Access
              </h1>
              <p className="text-xs text-zinc-400">
                Use your Aldan API keys to integrate stateful inference into any Next.js app, Cursor, or curl script.
              </p>
            </div>
          </div>

          {/* New Key Alert if just generated */}
          {generatedKey && (
            <div className="p-4 rounded-xl border border-emerald-500/50 bg-emerald-950/40 text-emerald-200 text-xs space-y-2">
              <div className="font-semibold flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-400" /> New Key Created!
              </div>
              <p className="text-emerald-300/80">
                Please copy your key now. You won&apos;t be able to see the full key again:
              </p>
              <div className="flex items-center gap-2 font-mono bg-zinc-950/80 p-2 rounded-lg border border-emerald-900/60">
                <span className="flex-1 select-all">{generatedKey}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-emerald-400 hover:text-emerald-200"
                  onClick={() => copyToClipboard(generatedKey)}
                >
                  {copiedKey ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
          )}

          {/* Create Key Form */}
          <Card className="border-zinc-800 bg-zinc-900/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-zinc-200">
                Generate New API Key
              </CardTitle>
              <CardDescription className="text-xs text-zinc-400">
                Keys start with <code className="text-zinc-300 font-mono">aldan_sk_</code> and inherit your persistent user memory.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateKey} className="flex gap-2.5">
                <Input
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  placeholder="Key name (e.g. My Next.js Project, Cursor)"
                  className="border-zinc-800 bg-zinc-950 text-xs text-zinc-100 placeholder:text-zinc-500"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={creating}
                  className="bg-sky-500 hover:bg-sky-600 text-zinc-950 font-medium text-xs whitespace-nowrap"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Create Secret Key
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Keys Table */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-zinc-300">
              Active Keys ({keys.length})
            </h2>

            {loading ? (
              <div className="p-8 text-center text-xs text-zinc-500">
                Loading API keys...
              </div>
            ) : keys.length === 0 ? (
              <Card className="border-dashed border-zinc-800 bg-zinc-950/40 p-8 text-center">
                <p className="text-xs text-zinc-400">No active API keys found.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-2.5">
                {keys.map((k) => (
                  <div
                    key={k.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-800/80 bg-zinc-900/40"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-zinc-200">
                          {k.name}
                        </span>
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0 bg-zinc-800 text-zinc-400 font-mono"
                        >
                          {k.start}...
                        </Badge>
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        Created {new Date(k.createdAt).toLocaleDateString()}
                        {k.lastRequest && ` • Last used ${new Date(k.lastRequest).toLocaleDateString()}`}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10"
                      onClick={() => handleRevoke(k.id)}
                      title="Revoke key"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quickstart Integration Code */}
          <Card className="border-zinc-800 bg-zinc-900/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                <Terminal className="h-4 w-4 text-emerald-400" />
                Quickstart Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 font-mono text-xs">
              <div className="text-zinc-400">1. Using standard curl (OpenAI format):</div>
              <pre className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 overflow-x-auto">
{`curl http://localhost:3000/api/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_ALDAN_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "aldan-stateful-v1",
    "messages": [{"role": "user", "content": "Review my architecture"}],
    "stream": true
  }'`}
              </pre>

              <div className="text-zinc-400 pt-2 flex items-center gap-1.5">
                <Code2 className="h-3.5 w-3.5 text-sky-400" /> 2. Using Vercel AI SDK (@aldan/provider):
              </div>
              <pre className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 overflow-x-auto">
{`import { createAldan } from "@/lib/ai/provider";
import { streamText } from "ai";

const aldan = createAldan({ apiKey: process.env.ALDAN_API_KEY });

const result = await streamText({
  model: aldan("aldan-stateful-v1"),
  prompt: "What were my saved preferences?",
});`}
              </pre>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
