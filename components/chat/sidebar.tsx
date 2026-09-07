"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  MessageSquarePlus,
  Brain,
  Key,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Bot,
  Sparkles,
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onNewChat?: () => void;
}

export function Sidebar({
  collapsed,
  onToggleCollapse,
  onNewChat,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`flex flex-col border-r border-zinc-800 bg-zinc-950 transition-all duration-200 z-20 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-zinc-800/80">
        <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-zinc-950 font-bold shadow-lg shadow-emerald-500/20 shrink-0">
            A
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-sm tracking-tight text-zinc-100 flex items-center gap-1.5">
                Aldan <Sparkles className="h-3 w-3 text-emerald-400" />
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                Stateful AI Engine
              </span>
            </div>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-zinc-400 hover:text-zinc-100 hidden md:flex"
          onClick={onToggleCollapse}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>

      {/* New Chat Action */}
      <div className="p-2.5">
        <Button
          variant="outline"
          className={`w-full justify-start gap-2 border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-200 ${
            collapsed ? "px-2 justify-center" : "px-3"
          }`}
          onClick={onNewChat}
        >
          <MessageSquarePlus className="h-4 w-4 text-emerald-400 shrink-0" />
          {!collapsed && <span className="text-xs font-medium">New Chat</span>}
        </Button>
      </div>

      {/* Center Nav / Recent Items */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
        {!collapsed && (
          <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Platform
          </div>
        )}

        <Link href="/">
          <Button
            variant="ghost"
            size="sm"
            className={`w-full justify-start gap-2.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 ${
              pathname === "/" ? "bg-zinc-900 font-medium text-emerald-400" : ""
            } ${collapsed ? "px-2 justify-center" : "px-2.5"}`}
            title="Chat Interface"
          >
            <Bot className="h-4 w-4 shrink-0 text-emerald-400" />
            {!collapsed && <span>Chat Workspace</span>}
          </Button>
        </Link>

        <Link href="/memories">
          <Button
            variant="ghost"
            size="sm"
            className={`w-full justify-start gap-2.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 ${
              pathname === "/memories"
                ? "bg-zinc-900 font-medium text-emerald-400"
                : ""
            } ${collapsed ? "px-2 justify-center" : "px-2.5"}`}
            title="Learned Memories & Persona"
          >
            <Brain className="h-4 w-4 shrink-0 text-amber-400" />
            {!collapsed && <span>Memories & Persona</span>}
          </Button>
        </Link>

        <Link href="/keys">
          <Button
            variant="ghost"
            size="sm"
            className={`w-full justify-start gap-2.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 ${
              pathname === "/keys"
                ? "bg-zinc-900 font-medium text-emerald-400"
                : ""
            } ${collapsed ? "px-2 justify-center" : "px-2.5"}`}
            title="API Keys & Tokens"
          >
            <Key className="h-4 w-4 shrink-0 text-sky-400" />
            {!collapsed && <span>API Keys</span>}
          </Button>
        </Link>

        <Link href="/docs">
          <Button
            variant="ghost"
            size="sm"
            className={`w-full justify-start gap-2.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 ${
              pathname === "/docs"
                ? "bg-zinc-900 font-medium text-emerald-400"
                : ""
            } ${collapsed ? "px-2 justify-center" : "px-2.5"}`}
            title="API Reference (/v1)"
          >
            <BookOpen className="h-4 w-4 shrink-0 text-purple-400" />
            {!collapsed && <span>OpenAPI Docs</span>}
          </Button>
        </Link>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/60">
        {!collapsed ? (
          <div className="flex items-center justify-between text-[11px] text-zinc-500">
            <span>Aldan v0.1.0</span>
            <span className="font-mono text-emerald-500">online</span>
          </div>
        ) : (
          <div className="h-2 w-2 rounded-full bg-emerald-500 mx-auto" />
        )}
      </div>
    </aside>
  );
}
