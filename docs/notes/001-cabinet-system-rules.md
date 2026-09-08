# 001 - Cabinet Documentation System Rules

The **Cabinet System** is the standard documentation methodology for the Aldan repository. Its goal is to prevent monolithic, outdated "god-files" and maintain an atomic, navigable, and evolutionary knowledge base.

---

## The Metaphor

1. **The Cabinet**: The root `docs/` folder.
2. **The Drawers**: Each top-level folder inside `docs/` represents a specific classification drawer:
   - `architecture/` — High-level system architecture, cross-cutting paradigms, cognitive theories, and invariants.
   - `design/` — Component design specs, database schemas, API contracts, and pipeline workflows.
   - `features/` — User-facing capabilities, interface mechanics, tools, and surfaces.
   - `notes/` — Meta-rules, meeting summaries, research findings, and operational guidelines.
3. **The Files**: Atomic topic files residing inside drawers.

---

## Filing Rules

1. **Naming Convention**:
   `NNN-{relevant-topic-title}.md`
   - `NNN`: Zero-padded 3-digit sequential index within that drawer (e.g., `001`, `002`).
   - `{relevant-topic-title}`: Kebab-cased concise topic descriptor.
   - Example: `docs/architecture/003-cognitive-memory-dynamics.md`

2. **Single-Topic Focus (Atomicity)**:
   - Each file covers **only one cohesive topic**.
   - If a topic expands beyond its immediate scope or branches into a separate architectural concern, open a new file in the appropriate drawer and cross-reference.

3. **Cross-Referencing**:
   - Files should interlink explicitly using relative markdown links.
   - Example: `See [Evolutionary User Model](../architecture/002-evolutionary-user-model.md) for trait representation.`

4. **Evolutionary Maintenance**:
   - When an architectural decision or feature changes, update the specific topic file directly or supersede it by adding a newer document and marking the prior one deprecated.
