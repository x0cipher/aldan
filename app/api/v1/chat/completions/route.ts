import { type NextRequest, NextResponse } from "next/server";
import { streamText, generateText, type CoreMessage } from "ai";
import { authenticateApiRequest } from "@/lib/api-auth";
import { compileStatefulContext } from "@/lib/ai/context-compiler";
import { getGeminiModel, DEFAULT_MODEL } from "@/lib/ai/gemini";
import { extractAndPersistMemories } from "@/lib/ai/memory-extractor";
import { ChatCompletionRequestSchema } from "@/lib/openapi/registry";
import crypto from "node:crypto";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const authContext = await authenticateApiRequest(req);

  // If no auth provided, return standard OpenAI 401 response
  if (!authContext) {
    return NextResponse.json(
      {
        error: {
          message:
            "Unauthorized. Please provide a valid Aldan API Key (Authorization: Bearer aldan_sk_...) or authenticate via web session.",
          type: "invalid_request_error",
          param: null,
          code: "invalid_api_key",
        },
      },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      {
        error: {
          message: "Invalid JSON body provided.",
          type: "invalid_request_error",
        },
      },
      { status: 400 }
    );
  }

  const parsed = ChatCompletionRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          message: parsed.error.message,
          type: "invalid_request_error",
        },
      },
      { status: 400 }
    );
  }

  const {
    model: requestedModel,
    messages: inputMessages,
    temperature,
    stream,
    conversation_id,
  } = parsed.data;

  // Map model name (aldan-stateful-v1 maps to default Gemini backing)
  const targetGeminiModel =
    requestedModel === "aldan-stateful-v1" ? DEFAULT_MODEL : requestedModel;

  // Format incoming messages to CoreMessage format
  const coreMessages: CoreMessage[] = inputMessages.map((m) => ({
    role: m.role as "user" | "assistant" | "system",
    content: m.content,
  }));

  // Stateful Context Compilation
  const compiled = await compileStatefulContext({
    userId: authContext.userId,
    conversationId: conversation_id,
    incomingMessages: coreMessages,
  });

  const completionId = `chatcmpl-${crypto.randomUUID()}`;
  const createdTimestamp = Math.floor(Date.now() / 1000);

  // Find the last user message for memory reflection
  const lastUserMsg = [...coreMessages].reverse().find((m) => m.role === "user");
  const userContent =
    typeof lastUserMsg?.content === "string" ? lastUserMsg.content : "";

  // Streaming Mode (OpenAI SSE wire protocol)
  if (stream) {
    const result = streamText({
      model: getGeminiModel(targetGeminiModel),
      system: compiled.systemPrompt,
      messages: compiled.messages,
      temperature,
    });

    const encoder = new TextEncoder();
    let accumulatedText = "";

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.textStream) {
            accumulatedText += chunk;
            const sseData = {
              id: completionId,
              object: "chat.completion.chunk",
              created: createdTimestamp,
              model: requestedModel,
              choices: [
                {
                  index: 0,
                  delta: { content: chunk },
                  finish_reason: null,
                },
              ],
            };
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(sseData)}\n\n`)
            );
          }

          // Send finish chunk
          const finishData = {
            id: completionId,
            object: "chat.completion.chunk",
            created: createdTimestamp,
            model: requestedModel,
            choices: [
              {
                index: 0,
                delta: {},
                finish_reason: "stop",
              },
            ],
          };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(finishData)}\n\n`)
          );
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
          // Asynchronously trigger reflection and memory extraction
          if (userContent) {
            extractAndPersistMemories({
              userId: authContext.userId,
              conversationId: conversation_id,
              userMessage: userContent,
              assistantResponse: accumulatedText,
            }).catch(() => {});
          }
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  }

  // Non-Streaming Mode
  const { text, usage } = await generateText({
    model: getGeminiModel(targetGeminiModel),
    system: compiled.systemPrompt,
    messages: compiled.messages,
    temperature,
  });

  // Background reflection
  if (userContent) {
    extractAndPersistMemories({
      userId: authContext.userId,
      conversationId: conversation_id,
      userMessage: userContent,
      assistantResponse: text,
    }).catch(() => {});
  }

  return NextResponse.json({
    id: completionId,
    object: "chat.completion",
    created: createdTimestamp,
    model: requestedModel,
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content: text,
        },
        finish_reason: "stop",
      },
    ],
    usage: {
      prompt_tokens: usage?.promptTokens ?? 0,
      completion_tokens: usage?.completionTokens ?? 0,
      total_tokens:
        (usage?.promptTokens ?? 0) + (usage?.completionTokens ?? 0),
    },
  });
}
