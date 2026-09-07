import { generateObject } from "ai";
import { z } from "zod";
import { db } from "@/db";
import { userMemories, userProfiles } from "@/db/schema";
import { getGeminiModel } from "./gemini";
import crypto from "node:crypto";

const memoryExtractionSchema = z.object({
  memories: z.array(
    z.object({
      category: z.enum(["preference", "fact", "instruction", "style"]),
      content: z
        .string()
        .describe(
          "A concise, high-signal fact or preference about the user, their codebase, or their habits."
        ),
      confidence: z.number().min(0).max(1),
    })
  ),
  profileUpdates: z
    .object({
      persona: z.string().optional().describe("Summary of user's role or engineering persona if revealed."),
      guidelines: z
        .string()
        .optional()
        .describe("Key coding rules, styling preferences, or architectural principles to remember."),
      techStack: z
        .string()
        .optional()
        .describe("Comma-separated frameworks, tools, or languages user actively uses."),
    })
    .optional(),
});

export async function extractAndPersistMemories({
  userId,
  conversationId,
  userMessage,
  assistantResponse,
}: {
  userId: string;
  conversationId?: string;
  userMessage: string;
  assistantResponse?: string;
}) {
  // If the user's message is too short (e.g. "hi", "yes", "thanks"), skip extraction
  if (userMessage.trim().length < 12) {
    return { extracted: 0 };
  }

  try {
    const { object } = await generateObject({
      model: getGeminiModel("gemini-2.0-flash"),
      schema: memoryExtractionSchema,
      prompt: `
You are the adaptive reflection engine of the Aldan AI platform.
Analyze the following user input and optional assistant response.
Extract any durable, high-value facts, user preferences, style requirements, or instructions that should be remembered across future sessions.
Only extract facts if they are clearly stated or strongly implied. Avoid trivial ephemeral statements (e.g. "I have a bug on line 4").

User Message:
"""
${userMessage}
"""

${assistantResponse ? `Assistant Response:\n"""\n${assistantResponse.slice(0, 1000)}\n"""` : ""}
      `,
    });

    let count = 0;

    // Persist new memories
    if (object.memories && object.memories.length > 0) {
      for (const mem of object.memories) {
        if (mem.confidence >= 0.7 && mem.content.length > 5) {
          await db.insert(userMemories).values({
            id: `mem_${crypto.randomUUID()}`,
            userId,
            category: mem.category,
            content: mem.content,
            confidence: mem.confidence,
            sourceConversationId: conversationId,
          });
          count++;
        }
      }
    }

    // Upsert profile updates if extracted
    if (object.profileUpdates) {
      const updates: { persona?: string; guidelines?: string; techStack?: string } = {};
      if (object.profileUpdates.persona) updates.persona = object.profileUpdates.persona;
      if (object.profileUpdates.guidelines) updates.guidelines = object.profileUpdates.guidelines;
      if (object.profileUpdates.techStack) updates.techStack = object.profileUpdates.techStack;

      if (Object.keys(updates).length > 0) {
        await db
          .insert(userProfiles)
          .values({
            userId,
            ...updates,
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: userProfiles.userId,
            set: {
              ...updates,
              updatedAt: new Date(),
            },
          });
      }
    }

    return { extracted: count };
  } catch {
    // Reflection failure should never disrupt the core user loop
    return { extracted: 0 };
  }
}
