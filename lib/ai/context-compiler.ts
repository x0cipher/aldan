import { db } from "@/db";
import { userMemories, userProfiles, artifacts } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import type { CoreMessage } from "ai";

export interface ContextCompilerOptions {
  userId: string;
  conversationId?: string;
  customSystemPrompt?: string;
  incomingMessages: CoreMessage[];
}

export interface CompiledContext {
  systemPrompt: string;
  messages: CoreMessage[];
  memoriesUsed: Array<{ id: string; category: string; content: string }>;
  artifactsCount: number;
}

export async function compileStatefulContext({
  userId,
  conversationId,
  customSystemPrompt,
  incomingMessages,
}: ContextCompilerOptions): Promise<CompiledContext> {
  // 1. Fetch user adaptive profile
  let profile: { persona: string | null; guidelines: string | null; techStack: string | null } | null = null;
  try {
    const [foundProfile] = await db
      .select({
        persona: userProfiles.persona,
        guidelines: userProfiles.guidelines,
        techStack: userProfiles.techStack,
      })
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);
    profile = foundProfile ?? null;
  } catch {
    // If DB is temporarily unavailable or in test mode, proceed gracefully
  }

  // 2. Fetch active long-term memories
  let memories: Array<{ id: string; category: string; content: string }> = [];
  try {
    memories = await db
      .select({
        id: userMemories.id,
        category: userMemories.category,
        content: userMemories.content,
      })
      .from(userMemories)
      .where(and(eq(userMemories.userId, userId), eq(userMemories.isArchived, false)))
      .orderBy(desc(userMemories.confidence), desc(userMemories.createdAt))
      .limit(25);
  } catch {
    // Graceful fallback
  }

  // 3. Fetch conversation artifacts if conversationId is provided
  let activeArtifacts: Array<{ id: string; title: string; type: string; language: string | null }> = [];
  if (conversationId) {
    try {
      activeArtifacts = await db
        .select({
          id: artifacts.id,
          title: artifacts.title,
          type: artifacts.type,
          language: artifacts.language,
        })
        .from(artifacts)
        .where(eq(artifacts.conversationId, conversationId))
        .orderBy(desc(artifacts.updatedAt))
        .limit(5);
    } catch {
      // Graceful fallback
    }
  }

  // 4. Assemble the stateful system prompt
  const systemSections: string[] = [
    `You are Aldan, a stateful and adaptive AI platform designed for advanced engineering, reasoning, and pair programming.`,
    `You continuously adapt to the user's workflow, communication style, technical preferences, and conventions.`,
  ];

  if (profile) {
    const profileParts: string[] = [];
    if (profile.persona) profileParts.push(`User Role/Persona: ${profile.persona}`);
    if (profile.techStack) profileParts.push(`Primary Tech Stack: ${profile.techStack}`);
    if (profile.guidelines) profileParts.push(`Code & Tone Guidelines: ${profile.guidelines}`);
    if (profileParts.length > 0) {
      systemSections.push(`\n### Adaptive User Profile\n${profileParts.join("\n")}`);
    }
  }

  if (memories.length > 0) {
    const memoryList = memories
      .map((m) => `- [${m.category.toUpperCase()}] ${m.content}`)
      .join("\n");
    systemSections.push(`\n### Long-Term Memories & User Context\n${memoryList}`);
  }

  if (activeArtifacts.length > 0) {
    const artifactList = activeArtifacts
      .map((a) => `- Artifact "${a.title}" (ID: ${a.id}, Type: ${a.type}${a.language ? `, Lang: ${a.language}` : ""})`)
      .join("\n");
    systemSections.push(`\n### Active Conversation Artifacts\n${artifactList}`);
  }

  // Artifact output instruction for clean UI rendering
  systemSections.push(`
### Artifact Guidelines
When creating substantial code projects, full-file components, complex SVG diagrams, HTML demos, or comprehensive architecture documents, enclose them in an artifact block:
\`\`\`artifact
title: "<short descriptive title>"
type: "code" | "markdown" | "html" | "svg"
language: "<language identifier e.g. typescript, python, css>"
---
<content here>
\`\`\`
This enables the user to view, copy, and iterate on the artifact in their dedicated workspace panel.
`);

  if (customSystemPrompt) {
    systemSections.push(`\n### Conversation Specific Instructions\n${customSystemPrompt}`);
  }

  return {
    systemPrompt: systemSections.join("\n"),
    messages: incomingMessages,
    memoriesUsed: memories,
    artifactsCount: activeArtifacts.length,
  };
}
