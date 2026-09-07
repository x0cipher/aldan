import { OpenApiGeneratorV31 } from "@asteasolutions/zod-to-openapi";
import { registry } from "./registry";

export function getOpenApiDocumentation() {
  const generator = new OpenApiGeneratorV31(registry.definitions);

  return generator.generateDocument({
    openapi: "3.1.0",
    info: {
      version: "1.0.0",
      title: "Aldan Stateful & Adaptive AI Platform API",
      description: `
The **Aldan API** provides an OpenAI-compatible inference surface powered by Google Gemini and augmented with a stateful context compiler, persistent memory injection, and adaptive reflection.

### Features
- **OpenAI Compatibility**: Drop-in compatible with Cursor, OpenAI Python/Node SDKs, and curl.
- **Stateful Memory**: Automatically pulls in user preferences, project conventions, and long-term memories.
- **Adaptive Reflection**: Learns from conversational turns and updates user profiles in the background.
- **Vercel AI SDK**: Can be consumed directly via \`@aldan/provider\` or standard Vercel AI SDK client tools.
      `.trim(),
      contact: {
        name: "Aldan Engineering",
        url: "https://github.com/x0cipher/aldan",
      },
    },
    servers: [
      {
        url: "/",
        description: "Current Host",
      },
    ],
  });
}
