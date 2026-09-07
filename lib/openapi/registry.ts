import {
  OpenAPIRegistry,
  extendZodWithOpenApi,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

// Security Scheme
export const bearerAuth = registry.registerComponent("securitySchemes", "BearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "aldan_sk_*",
  description: "Enter your Aldan API Key (e.g. aldan_sk_...)",
});

// Chat Completion schemas
export const ChatMessageSchema = z
  .object({
    role: z.enum(["system", "user", "assistant"]),
    content: z.string().describe("Content of the message"),
  })
  .openapi("ChatMessage");

export const ChatCompletionRequestSchema = z
  .object({
    model: z
      .string()
      .default("aldan-stateful-v1")
      .describe("Model ID to run inference on. Supports 'aldan-stateful-v1', 'gemini-2.0-flash', etc."),
    messages: z.array(ChatMessageSchema).describe("List of chat messages"),
    temperature: z.number().min(0).max(2).optional().default(0.7),
    max_tokens: z.number().int().positive().optional(),
    stream: z.boolean().optional().default(false).describe("Whether to stream response chunks via SSE"),
    conversation_id: z.string().optional().describe("Optional conversation session ID for persistence"),
    user_id: z.string().optional().describe("User ID for stateful context compilation"),
  })
  .openapi("ChatCompletionRequest");

export const ChatCompletionResponseSchema = z
  .object({
    id: z.string(),
    object: z.literal("chat.completion"),
    created: z.number(),
    model: z.string(),
    choices: z.array(
      z.object({
        index: z.number(),
        message: ChatMessageSchema,
        finish_reason: z.string(),
      })
    ),
    usage: z.object({
      prompt_tokens: z.number(),
      completion_tokens: z.number(),
      total_tokens: z.number(),
    }),
  })
  .openapi("ChatCompletionResponse");

// Models Schemas
export const ModelSchema = z
  .object({
    id: z.string(),
    object: z.literal("model"),
    created: z.number(),
    owned_by: z.string(),
    context_window: z.number(),
    description: z.string().optional(),
  })
  .openapi("Model");

export const ModelListResponseSchema = z
  .object({
    object: z.literal("list"),
    data: z.array(ModelSchema),
  })
  .openapi("ModelListResponse");

// Memory Schemas
export const MemorySchema = z
  .object({
    id: z.string(),
    userId: z.string(),
    category: z.enum(["preference", "fact", "instruction", "style"]),
    content: z.string(),
    confidence: z.number().nullable(),
    createdAt: z.date(),
  })
  .openapi("Memory");

export const CreateMemoryRequestSchema = z
  .object({
    category: z.enum(["preference", "fact", "instruction", "style"]),
    content: z.string().min(3),
    confidence: z.number().min(0).max(1).optional().default(1.0),
  })
  .openapi("CreateMemoryRequest");

// Register Routes in OpenAPI Registry
registry.registerPath({
  method: "post",
  path: "/api/v1/chat/completions",
  description: "OpenAI-compatible inference endpoint with stateful context compilation and adaptive memory injection.",
  security: [{ [bearerAuth.name]: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: ChatCompletionRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Chat completion response or SSE stream",
      content: {
        "application/json": {
          schema: ChatCompletionResponseSchema,
        },
        "text/event-stream": {
          schema: z.string().describe("Server-Sent Events (SSE) data stream"),
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/models",
  description: "List available models and stateful engines.",
  security: [{ [bearerAuth.name]: [] }],
  responses: {
    200: {
      description: "List of supported models",
      content: {
        "application/json": {
          schema: ModelListResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/v1/memories",
  description: "List learned facts, preferences, and guidelines for the authenticated user.",
  security: [{ [bearerAuth.name]: [] }],
  responses: {
    200: {
      description: "List of user memories",
      content: {
        "application/json": {
          schema: z.object({
            object: z.literal("list"),
            data: z.array(MemorySchema),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/v1/memories",
  description: "Create or inject a new permanent memory or rule for the user.",
  security: [{ [bearerAuth.name]: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateMemoryRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Memory successfully stored",
      content: {
        "application/json": {
          schema: MemorySchema,
        },
      },
    },
  },
});
