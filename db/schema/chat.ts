import { pgTable, text, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const conversations = pgTable("conversations", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull().default("New Conversation"),
  model: text("model").notNull().default("gemini-2.0-flash"),
  systemPrompt: text("system_prompt"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const messages = pgTable("messages", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // 'user' | 'assistant' | 'system'
  content: text("content").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const messageParts = pgTable("message_parts", {
  id: text("id").primaryKey(),
  messageId: text("message_id")
    .notNull()
    .references(() => messages.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'text' | 'reasoning' | 'tool-call' | 'tool-result'
  content: text("content"),
  toolName: text("tool_name"),
  toolCallId: text("tool_call_id"),
  toolArgs: jsonb("tool_args").$type<Record<string, unknown>>(),
  toolResult: jsonb("tool_result").$type<Record<string, unknown>>(),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
