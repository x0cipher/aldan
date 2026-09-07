import { pgTable, text, timestamp, boolean, doublePrecision } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const userMemories = pgTable("user_memories", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  category: text("category").notNull(), // 'preference' | 'fact' | 'instruction' | 'style'
  content: text("content").notNull(),
  confidence: doublePrecision("confidence").default(1.0),
  sourceConversationId: text("source_conversation_id"),
  isArchived: boolean("is_archived").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const userProfiles = pgTable("user_profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  persona: text("persona"), // General role/identity of user
  guidelines: text("guidelines"), // Coding style, tone, architectural guidelines
  techStack: text("tech_stack"), // Frequently used frameworks and languages
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
