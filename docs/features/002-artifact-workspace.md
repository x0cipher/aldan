# 002 - Artifact Workspace

The **Artifact Workspace** separates long-form content (code modules, architecture blueprints, data visualizations, and interactive mockups) from conversational chat bubbles, rendering them in a dedicated split-pane interface inspired by Claude Artifacts.

---

## 1. Artifact Protocol

When generating substantial documents or code, the engine wraps them in a structured block:

````markdown
```artifact
title: "System Architecture Diagram"
type: "svg" | "code" | "markdown" | "html"
language: "typescript"
---
<artifact payload here>
```
````

---

## 2. Client Workspace Mechanics

1. **Inline Detection**: The frontend streaming parser in `components/chat/chat-messages.tsx` captures artifact blocks as they stream.
2. **Interactive Capsule**: In the chat thread, the block is replaced with an interactive card showing the title, file type badge, and an *"Open Workspace ↗"* action.
3. **Dedicated Split Pane**:
   - Clicking opens `components/artifacts/artifact-panel.tsx`.
   - **Code Tab**: Syntax-highlighted viewer with quick copy.
   - **Preview Tab**: For HTML, SVG, and markdown, an isolated live preview iframe or formatted view renders immediately.

---

## Related Documents
- [Dual Inference Surface](./001-dual-inference-surface.md)
- [Domain-Agnostic Platform](../architecture/001-domain-agnostic-platform.md)
