# Aldan Documentation Cabinet

Welcome to the Aldan documentation cabinet. Documentation in this repository follows the **Cabinet Rule**: every top-level folder is a drawer, and every file inside a drawer is an atomic topic (`NNN-{topic}.md`).

---

## The Cabinet Drawers

### 📂 [`architecture/`](./architecture/)
High-level system design, cognitive theories, and core invariants.
- [`001-domain-agnostic-platform.md`](./architecture/001-domain-agnostic-platform.md) — Universal stateful platform principles.
- [`002-evolutionary-user-model.md`](./architecture/002-evolutionary-user-model.md) — Dynamic trait clusters and rolling living dossiers.
- [`003-cognitive-memory-dynamics.md`](./architecture/003-cognitive-memory-dynamics.md) — Memory decay, reinforcement, asymptotic confidence, and mutation.
- [`004-vector-and-hybrid-retrieval.md`](./architecture/004-vector-and-hybrid-retrieval.md) — Voyage AI, pgvector, hybrid search, and cross-encoder reranking.

### 📂 [`design/`](./design/)
Component-level technical specifications, database schemas, and workflows.
- [`001-cognitive-database-schema.md`](./design/001-cognitive-database-schema.md) — Drizzle ORM schema for cognitive memory, traits, and vectors.
- [`002-memory-reconciliation-pipeline.md`](./design/002-memory-reconciliation-pipeline.md) — Ingestion, semantic dedup, contradiction handling, and embedding lifecycle.

### 📂 [`features/`](./features/)
User-facing and developer capabilities.
- [`001-dual-inference-surface.md`](./features/001-dual-inference-surface.md) — OpenAI-compatible wire protocol and Vercel AI SDK provider.
- [`002-artifact-workspace.md`](./features/002-artifact-workspace.md) — Split-pane workspace for code, SVG, and HTML preview.

### 📂 [`notes/`](./notes/)
Meta-rules, guidelines, and operational notes.
- [`001-cabinet-system-rules.md`](./notes/001-cabinet-system-rules.md) — Standard operating procedure for documentation maintenance.
