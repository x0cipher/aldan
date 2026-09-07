import { type NextRequest } from "next/server";
import { streamText, type CoreMessage } from "ai";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { conversations, messages, user } from "@/db/schema";
import { compileStatefulContext } from "@/lib/ai/context-compiler";
import { getGeminiModel, DEFAULT_MODEL } from "@/lib/ai/gemini";
import { extractAndPersistMemories } from "@/lib/ai/memory-extractor";
import { eq } from "drizzle-orm";
import crypto from "node:crypto";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Authenticate session
  const session = await auth.api.getSession({ headers: req.headers });
  let currentUserId = session?.user?.id;

  // Fallback demo user if not signed in yet (ensures smooth out-of-the-box local testing)
  if (!currentUserId) {
    currentUserId = "guest_user";
    try {
      await db
        .insert(user)
        .values({
          id: "guest_user",
          name: "Guest Explorer",
          email: "guest@aldan.local",
          emailVerified: true,
        })
        .onConflictDoNothing();
    } catch {
      // Ignore if exists or DB uninitialized
    }
  }

  const {
    messages: inputMessages,
    conversationId: clientConvId,
    model: requestedModel,
  } = (await req.json()) as {
    messages: CoreMessage[];
    conversationId?: string;
    model?: string;
  };

  const targetModel = requestedModel || DEFAULT_MODEL;
  const conversationId = clientConvId || `conv_${crypto.randomUUID()}`;

  // Ensure conversation row exists in DB
  try {
    const [existing] = await db
      .select({ id: conversations.id })
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);

    if (!existing) {
      const firstUserMsg = inputMessages.find((m) => m.role === "user");
      const title =
        typeof firstUserMsg?.content === "string"
          ? firstUserMsg.content.slice(0, 40)
          : "New Session";

      await db.insert(conversations).values({
        id: conversationId,
        userId: currentUserId,
        title,
        model: targetModel,
      });
    }
  } catch {
    // Database fallback
  }

  // Compile stateful context (incorporating memories and profile)
  const compiled = await compileStatefulContext({
    userId: currentUserId,
    conversationId,
    incomingMessages: inputMessages,
  });

  const lastUserMsg = [...inputMessages].reverse().find((m) => m.role === "user");
  const userContent =
    typeof lastUserMsg?.content === "string" ? lastUserMsg.content : "";

  // Stream using Gemini via Vercel AI SDK
  const result = streamText({
    model: getGeminiModel(targetModel),
    system: compiled.systemPrompt,
    messages: compiled.messages,
    onFinish: async ({ text }) => {
      // Persist user and assistant messages
      try {
        if (userContent) {
          await db.insert(messages).values({
            id: `msg_${crypto.randomUUID()}`,
            conversationId,
            role: "user",
            content: userContent,
          });
        }
        await db.insert(messages).values({
          id: `msg_${crypto.randomUUID()}`,
          conversationId,
          role: "assistant",
          content: text,
        });
      } catch {
        // Logging error without breaking UX
      }

      // Background reflection & memory extraction
      if (userContent && currentUserId) {
        extractAndPersistMemories({
          userId: currentUserId,
          conversationId,
          userMessage: userContent,
          assistantResponse: text,
        }).catch(() => {});
      }
    },
  });

  return result.toDataStreamResponse({
    headers: {
      "X-Conversation-Id": conversationId,
    },
  });
}
