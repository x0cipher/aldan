# 001 - Dual Inference Surface

Aldan exposes two complementary inference interfaces that feed into the same stateful and adaptive engine:
1. **OpenAI-Compatible Wire Protocol** (`/api/v1/chat/completions`)
2. **First-Class Vercel AI SDK Provider** (`@aldan/provider` / `LanguageModelV1`)

---

## 1. OpenAI-Compatible Wire Protocol

Located at `POST /api/v1/chat/completions`, this endpoint is a drop-in target for existing tooling, including Cursor, the OpenAI Python/Node SDKs, LangChain, and `curl`.

### Key Characteristics
- **Authentication**: Bearer API key (`Authorization: Bearer aldan_sk_...`) or session cookie.
- **Wire Compatibility**:
  - Accepts standard `{ model, messages, temperature, stream }` JSON body.
  - When `stream: true`, emits standard Server-Sent Events (SSE) `data: {"object": "chat.completion.chunk", ...}` ending in `data: [DONE]`.
  - When `stream: false`, returns a standard `chat.completion` JSON object.
- **Engine Interception**:
  - Automatically compiles stateful context (traits, dossier, activated memories) before reaching the model.
  - Automatically triggers asynchronous memory extraction and reflection upon turn completion.

---

## 2. Vercel AI SDK LanguageModelV1 Provider

Aldan includes a native implementation of Vercel AI SDK's `LanguageModelV1` specification in `lib/ai/provider/aldan-language-model.ts`.

### Usage Example
```typescript
import { createAldan } from "@/lib/ai/provider";
import { streamText } from "ai";

const aldan = createAldan({
  apiKey: process.env.ALDAN_API_KEY,
  baseURL: "http://localhost:3000/api/v1",
});

const result = await streamText({
  model: aldan("aldan-stateful-v1"),
  prompt: "What were my primary project constraints?",
});
```

---

## Related Documents
- [Domain-Agnostic Platform](../architecture/001-domain-agnostic-platform.md)
- [Artifact Workspace](./002-artifact-workspace.md)
