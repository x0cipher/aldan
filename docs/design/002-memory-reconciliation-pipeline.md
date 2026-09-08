# 002 - Memory Reconciliation Pipeline

This document details the end-to-end processing pipeline that transforms raw conversation turns into reconciled, non-redundant, and cognitively accurate memory records.

---

## 1. Pipeline Overview

Memory extraction is executed asynchronously post-turn to ensure zero user-facing latency.

```text
Turn Completed (User Message + Assistant Response)
                    │
                    ▼
       1. Extraction Filter & Guard
       (Filter short or trivial responses)
                    │
                    ▼
       2. Structured Candidate Extraction
       (LLM extracts candidate propositions + confidence)
                    │
                    ▼
       3. Vector Embedding Generation
       (Voyage AI voyage-3 embedding)
                    │
                    ▼
       4. Nearest Neighbor Query in pgvector
       (Find existing memories with high cosine similarity)
                    │
       ┌────────────┴────────────┐
       ▼                         ▼
 [Match Found]             [No Match]
       │                         │
       ▼                         ▼
 5. Reconciliation         6. Direct Insert
 - Exact / Paraphrase:        (Insert new record with
   Increment reinforcement     initial confidence & embedding)
   and refresh timestamp
 - Contradiction:
   Decay old record & link
 - Specialization:
   Mutate record into rule
```

---

## 2. Reconciliation Rules

1. **Equivalence Threshold ($d_{\text{cosine}} \le 0.12$)**:
   - The candidate expresses an already known fact.
   - Action: Increment `reinforcement_count`, update `last_reinforced_at`, boost `stability` slightly. Do not insert a duplicate row.
2. **Semantic Tension / Contradiction**:
   - The candidate directly disputes an existing high-confidence memory.
   - Action:
     - Old memory: decrement confidence by $\Delta c$, set `superseded_by_id`.
     - New memory: insert with initial provisional confidence and reference to previous state.
3. **Novelty ($d_{\text{cosine}} > 0.30$)**:
   - The candidate describes a novel facet of the user or project.
   - Action: Direct insertion with initial confidence and embedding.

---

## Related Documents
- [Cognitive Memory Dynamics](../architecture/003-cognitive-memory-dynamics.md)
- [Vector and Hybrid Retrieval](../architecture/004-vector-and-hybrid-retrieval.md)
- [Cognitive Database Schema](./001-cognitive-database-schema.md)
