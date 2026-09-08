# 002 - Evolutionary User Model

Traditional user profiles in AI applications are brittle and static: developers define columns like `persona`, `guidelines`, and `techStack`, which quickly fail to capture the complex, shifting reality of a user's work and mental models.

Aldan models the user as an **evolutionary, multi-faceted cognitive profile**.

---

## 1. Dynamic Trait Clusters

Instead of rigid columns, user attributes are captured as dynamic trait nodes with confidence and stability metrics:

```text
Trait Node:
├── Dimension: "Communication Style" | "Domain Expertise" | "Epistemic Stance" | "Operational Rule"
├── Key: e.g. "prefers_socratic_dialogue", "active_project_domain", "data_formatting"
├── Value: Qualitative descriptor or structured preference
├── Stability: Score (0.0 to 1.0) measuring how persistent or fundamental the trait is
├── ObservationCount: Number of distinct sessions observing this trait
└── LastConfirmedAt: Timestamp of the most recent interaction reinforcing the trait
```

### Trait Categories
- **Epistemic Stance**: How the user reasons (first-principles, empirical, consensus-driven, contrarian).
- **Communication Nuance**: Tone preferences, verbosity limits, formatting constraints, pacing.
- **Active Operational Domains**: Current projects, research vectors, or business units.
- **Inviolable Constraints**: Hard negative constraints (e.g., "Never use passive voice", "Always output raw JSON").

---

## 2. The "Living Dossier" (Rolling Synthesis)

Rather than passing raw, disconnected trait rows into an LLM context, Aldan periodically compiles traits into a **Living Dossier**:
- A cohesive, high-density markdown briefing that summarizes who the user is and how they work.
- The dossier is generated asynchronously by a background consolidation worker when new traits achieve sufficient stability.
- Injected directly into the Context Compiler's system layer.

---

## Related Documents
- [Domain-Agnostic Platform](./001-domain-agnostic-platform.md)
- [Cognitive Memory Dynamics](./003-cognitive-memory-dynamics.md)
- [Cognitive Database Schema](../design/001-cognitive-database-schema.md)
