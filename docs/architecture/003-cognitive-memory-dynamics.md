# 003 - Cognitive Memory Dynamics

Human memories are neither binary nor permanent. They evolve, decay, reinforce through repetition, and update when contradicted. Aldan implements a non-monotonic, dynamic memory model governed by cognitive science principles.

---

## 1. Non-Absolute Confidence Scaling

Confidence scores in Aldan never reach absolute extremes ($0.0$ or $1.0$). 
- Bounded to the open interval $(0.05, 0.95)$.
- New observations enter with an initial provisional confidence (typically $0.40$ to $0.65$).
- Additional confirmatory observations update confidence asymptotically.
- Single contradictory observations do not instantly wipe out a memory; they decrement confidence and trigger semantic reconciliation.

---

## 2. Temporal Decay (Forgetting Curve)

Unreinforced observations decay exponentially following an adapted Ebbinghaus curve:

$$\text{Decay}(t) = \exp\left(-\frac{t - t_{\text{last\_reinforced}}}{\text{HalfLife} \times \text{Stability}}\right)$$

- **HalfLife**: Base rate at which memory activation declines if unaccessed.
- **Stability**: Multiplier boosted each time the memory is actively reinforced or utilized in successful task completion. Highly stable memories decay at negligible rates.

---

## 3. Reinforcement & Access Tracking

Every memory tracks:
- `access_count`: Number of times the memory was retrieved and injected into a context.
- `reinforcement_count`: Number of times the user explicitly reaffirmed or repeated the preference.
- `last_accessed_at`: Timestamp of latest retrieval.
- `last_reinforced_at`: Timestamp of latest explicit confirmation.

---

## 4. Contradiction & Mutation Lifecycle

When a new observation conflicts with an existing memory:
1. **Direct Contradiction**:
   - The superseded memory has its confidence decremented and is marked with `superseded_by_id`.
   - The new memory is created with references to the previous belief.
2. **Contextual Specialization / Mutation**:
   - Rather than invalidating the old memory, the system splits or mutates the memory into conditional rules.
   - Example: *"Prefers concise answers"* $\to$ *"Prefers concise answers generally, but detailed comprehensive breakdowns for architecture discussions."*

---

## 5. Dynamic Activation Scoring

When querying memories for prompt injection, candidates are ranked by their **Composite Activation Score**:

$$\text{Activation}(m) = S(m, q) \times C(m) \times \text{Decay}(m) \times \ln(1 + R(m))$$

Where:
- $S(m, q)$ is the semantic similarity between memory $m$ and user prompt $q$.
- $C(m)$ is the current confidence rating.
- $\text{Decay}(m)$ is the temporal decay factor.
- $R(m)$ is the cumulative reinforcement score.

---

## Related Documents
- [Evolutionary User Model](./002-evolutionary-user-model.md)
- [Vector and Hybrid Retrieval](./004-vector-and-hybrid-retrieval.md)
- [Memory Reconciliation Pipeline](../design/002-memory-reconciliation-pipeline.md)
