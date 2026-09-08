# 004 - Vector and Hybrid Memory Retrieval

A stateful memory engine cannot rely purely on naive full-text matching or raw cosine similarity. Aldan pairs **Voyage AI state-of-the-art retrieval embeddings** with **PostgreSQL `pgvector`** and **Voyage Cross-Encoder Reranking** to create an accurate, low-latency memory pipeline.

---

## 1. Storage: Voyage AI + PostgreSQL pgvector

### Dense Vector Embeddings (`voyage-3`)
- **Model**: Voyage AI `voyage-3` (or `voyage-3-large`).
- **Dimensionality**: 1024 / 1536 floating point values.
- **Why Voyage**: Consistently tops MTEB retrieval leaderboards, exhibiting superior domain generalization across complex reasoning, technical jargon, and natural language compared to OpenAI `text-embedding-3`.

### In-Database Indexing (`pgvector`)
- Embeddings are stored natively in the PostgreSQL `user_memories` table via the `vector` type.
- **HNSW Indexing** (`hnsw (embedding vector_cosine_ops)`): Provides sub-millisecond approximate nearest neighbor (ANN) retrieval with high recall without relying on an external specialized vector database cluster.

---

## 2. Ingestion: Near-Neighbor Dedup & Conflict Check

Before a candidate memory is inserted into the database:
1. An embedding is generated via Voyage AI.
2. An ANN search runs in `pgvector` against the user's existing memory space.
3. If a semantic near-neighbor exists (cosine distance $< 0.15$):
   - It is checked for redundancy.
   - If redundant, the system increments the existing memory's `reinforcement_count` and updates `last_reinforced_at` rather than creating a duplicate record.
   - If in conflict, the conflict reconciliation protocol is initiated.

---

## 3. Retrieval: Hybrid Search + Precision Reranking

```text
Query Prompt
     │
     ├─────────────────────────────────┬─────────────────────────────────┐
     ▼                                 ▼                                 ▼
Dense Retrieval (pgvector)     Sparse Search (tsvector)        Active Facets / Dossier
Top 30 by Cosine Similarity     Top 30 by Keyword Match         Direct Profile Context
     │                                 │                                 │
     └────────────────┬────────────────┘                                 │
                      ▼                                                  │
         Reciprocal Rank Fusion (RRF)                                    │
                      ▼                                                  │
         Dynamic Activation Scoring                                      │
       (Decay x Confidence x Reinforce)                                  │
                      ▼                                                  │
            Top 15 Candidates                                            │
                      ▼                                                  │
          Voyage AI Precision Reranker                                   │
              (rerank-2 cross-encoder)                                   │
                      ▼                                                  │
             Top 5 Final Memories ───────────────────────────────────────┘
                      │
                      ▼
               Context Compiler
```

1. **Hybrid Retrieval**: Combines dense semantic recall (captures conceptual meaning) with sparse full-text search (captures exact entities, acronyms, and proper nouns).
2. **Dynamic Scoring**: Blends retrieval scores with cognitive decay and reinforcement.
3. **Voyage Cross-Encoder Reranking (`rerank-2`)**:
   - Bi-encoders (embeddings) map queries and documents into vectors independently.
   - Cross-encoders evaluate query and document simultaneously with full self-attention across the pair.
   - Reranking filters out semantic "false friends" and guarantees only memories with direct pragmatic relevance reach the prompt.

---

## Related Documents
- [Cognitive Memory Dynamics](./003-cognitive-memory-dynamics.md)
- [Cognitive Database Schema](../design/001-cognitive-database-schema.md)
- [Memory Reconciliation Pipeline](../design/002-memory-reconciliation-pipeline.md)
