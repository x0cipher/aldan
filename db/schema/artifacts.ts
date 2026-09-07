import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { conversations } from "./chat";

export const artifacts = pgTable("artifacts", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  type: text("type").notNull(), // 'code' | 'markdown' | 'html' | 'svg'
  language: text("language"), // e.g. 'typescript', 'python', 'json'
  content: text("content").notNull(),
  version: integer("version").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
