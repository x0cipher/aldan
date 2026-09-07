# Aldan

> A full-stack, stateful AI platform and adaptive coding agent harness built with Next.js 15, Google Gemini, Vercel AI SDK, Drizzle ORM, and Better-Auth.

---

## Highlights

- **Stateful Context Compiler**: Beyond static chat history, Aldan dynamically injects learned user personas, long-term semantic memories, project guidelines, and active code artifacts into every prompt.
- **Asynchronous Adaptive Reflection**: Automatically extracts durable facts, user preferences, and code style rules in the background after conversations.
- **OpenAI-Compatible `/v1` APIs**: Drop-in compatible with `curl`, Cursor, OpenAI Python/Node SDKs, and LangChain (`/api/v1/chat/completions`, `/api/v1/models`, `/api/v1/memories`).
- **First-Class Vercel AI SDK Provider**: Exportable `LanguageModelV1` implementation (`@aldan/provider`) for plug-and-play streaming in any AI SDK app.
- **ChatGPT & Claude-style UX**: Clean Next.js App Router frontend with real-time streaming, artifact code workspace, model switcher, and interactive memory curation board.
- **Interactive OpenAPI 3.1 & Scalar Docs**: Live API specification at `/api/v1/openapi.json` and interactive API reference at `/docs`.
- **Automated Releases**: Fully configured with `release-please` and Conventional Commits.

---

## Architecture Overview

```text
aldan/
├── app/
│   ├── (auth)/                # Better-Auth sign-in and sign-up pages
│   ├── (chat)/                # ChatGPT/Claude-style conversation workspace
│   ├── (dashboard)/
│   │   ├── keys/page.tsx      # Developer API key management & snippets
│   │   └── memories/page.tsx  # Interactive memory & persona curation board
│   ├── api/
│   │   ├── auth/[...all]/     # Better-Auth handlers (sessions & bearer)
│   │   ├── chat/              # Internal AI SDK streaming endpoint
│   │   ├── keys/              # Dashboard key management
│   │   └── v1/                # Versioned public OpenAPI endpoints
│   │       ├── chat/completions/route.ts
│   │       ├── models/route.ts
│   │       ├── memories/route.ts
│   │       └── openapi.json/route.ts
│   ├── docs/page.tsx          # Scalar interactive API documentation
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── ui/                    # Shadcn UI primitives (button, card, input, badge)
│   ├── chat/                  # Sidebar, message stream, prompt bar, model selector
│   └── artifacts/             # Split-pane code & live preview workspace
│
├── db/
│   ├── schema/                # Drizzle schema (auth, chat, memory, artifacts)
│   └── index.ts               # PostgreSQL client connection
│
├── lib/
│   ├── auth.ts                # Better-Auth server configuration
│   ├── auth-client.ts         # Better-Auth client React hooks
│   ├── api-key.ts             # Developer API key generator and validator
│   ├── ai/
│   │   ├── gemini.ts          # Google Gemini provider configuration
│   │   ├── context-compiler.ts# Stateful memory & persona compilation
│   │   ├── memory-extractor.ts# Background reflection engine
│   │   └── provider/          # Vercel AI SDK LanguageModelV1 provider
│   └── openapi/               # Zod OpenAPI registry and spec generator
│
└── release-please-config.json
```

---

## Quickstart

### 1. Clone and Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in:
- `DATABASE_URL`: PostgreSQL connection string (local Postgres, Neon, or Supabase).
- `GOOGLE_GENERATIVE_AI_API_KEY`: Your Google Gemini API key.
- `BETTER_AUTH_SECRET`: A secure random string.

### 3. Initialize Database

Generate and push Drizzle migrations:

```bash
pnpm db:generate
pnpm db:push
```

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to access the chat workspace, or [http://localhost:3000/docs](http://localhost:3000/docs) for the interactive API reference.

---

## Using the API Programmatically

### 1. Via `curl` (OpenAI Format)

```bash
curl http://localhost:3000/api/v1/chat/completions \
  -H "Authorization: Bearer aldan_sk_your_key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "aldan-stateful-v1",
    "messages": [
      {"role": "user", "content": "Review this TypeScript function for performance"}
    ],
    "stream": true
  }'
```

### 2. Via Vercel AI SDK

```typescript
import { createAldan } from "@/lib/ai/provider";
import { streamText } from "ai";

const aldan = createAldan({
  apiKey: process.env.ALDAN_API_KEY,
  baseURL: "http://localhost:3000/api/v1",
});

const result = await streamText({
  model: aldan("aldan-stateful-v1"),
  prompt: "What were my saved project preferences?",
});

for await (const chunk of result.textStream) {
  process.stdout.write(chunk);
}
```

---

## Releases & Contributing

- **Conventional Commits**: Commit messages must adhere to Conventional Commits (e.g., `feat: ...`, `fix: ...`, `chore: ...`).
- **Release Please**: Versions, changelogs, and GitHub releases are managed automatically via `.github/workflows/release-please.yml`.
