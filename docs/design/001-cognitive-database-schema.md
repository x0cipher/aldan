# 001 - Cognitive Database Schema Design

This document specifies the database schema evolutions required in Drizzle ORM to support cognitive memory dynamics, Voyage AI vector embeddings, dynamic user trait clusters, and living dossiers.

---

## 1. Table: `user_memories`

Stores atomic, contextual, and episodic memories with activation telemetry.

```typescript
export const userMemories = pgTable("user_memories", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  
  // Categorization & Semantic Content
  category: text("category").notNull(), // 'preference' | 'fact' | 'instruction' | 'heuristic'
  content: text("content").notNull(),
  contextScope: text("context_scope"), // optional domain or project scope
  
  // Dense Vector Embedding (Voyage AI 1024-dim)
  // Note: customType or drizzle-orm/pg-core vector
  embedding: vector("embedding", { dimensions: 1024 }),
  
  // Cognitive Dynamics & Scaling
  confidence: doublePrecision("confidence").notNull().default(0.50), // bounded (0.05, 0.95)
  stability: doublePrecision("stability").notNull().default(1.0),   // resistance to decay
  decayRate: doublePrecision("decay_rate").notNull().default(0.05),
  
  // Telemetry & Reinforcement
  accessCount: integer("access_count").notNull().default(0),
  reinforcementCount: integer("reinforcement_count").notNull().default(1),
  lastAccessedAt: timestamp("last_accessed_at"),
  lastReinforcedAt: timestamp("last_reinforced_at").notNull().defaultNow(),
  
  // Lineage & Mutation
  supersededById: text("superseded_by_id"),
  isArchived: boolean("is_archived").notNull().default(false),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
```

---

## 2. Table: `user_traits`

Replaces rigid profile columns with granular, emergent trait nodes.

```typescript
export const userTraits = pgTable("user_traits", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  
  dimension: text("dimension").notNull(), // 'tone' | 'domain' | 'reasoning' | 'constraint'
  traitKey: text("trait_key").notNull(),   // e.g. 'formatting_preference'
  traitValue: text("trait_value").notNull(), // e.g. 'compact, avoids preamble'
  
  weight: doublePrecision("weight").notNull().default(0.5),
  observationCount: integer("observation_count").notNull().default(1),
  lastObservedAt: timestamp("last_observed_at").notNull().defaultNow(),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
```

---

## 3. Table: `user_dossiers`

Stores the synthesized rolling executive briefing for each user.

```typescript
export const userDossiers = pgTable("user_dossiers", {
  userId: text("user_id").primaryKey().references(() => user.id, { onDelete: "cascade" }),
  
  dossierMarkdown: text("dossier_markdown").notNull(),
  version: integer("version").notNull().default(1),
  sourceTraitCount: integer("source_trait_count").notNull().default(0),
  
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
```

---

## Related Documents
- [Evolutionary User Model](../architecture/002-evolutionary-user-model.md)
- [Cognitive Memory Dynamics](../architecture/003-cognitive-memory-dynamics.md)
- [Vector and Hybrid Retrieval](../architecture/004-vector-and-hybrid-retrieval.md)
