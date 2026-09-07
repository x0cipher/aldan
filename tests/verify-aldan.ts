import { getOpenApiDocumentation } from "../lib/openapi/spec";
import { compileStatefulContext } from "../lib/ai/context-compiler";
import { createAldan } from "../lib/ai/provider";

async function runVerification() {
  console.log("🧪 Running Aldan Subsystem Verification Tests...\n");

  // 1. Verify OpenAPI Spec Generation
  console.log("1. Testing OpenAPI 3.1 Document Generation...");
  const spec = getOpenApiDocumentation();
  if (spec.openapi !== "3.1.0") {
    throw new Error(`Expected OpenAPI 3.1.0, got ${spec.openapi}`);
  }
  const paths = Object.keys(spec.paths || {});
  console.log(`   ✓ Found ${paths.length} registered API paths:`, paths);
  if (!paths.includes("/api/v1/chat/completions") || !paths.includes("/api/v1/models")) {
    throw new Error("Missing required v1 API paths in OpenAPI spec!");
  }
  console.log("   ✓ OpenAPI 3.1 Document valid!\n");

  // 2. Testing Context Compiler
  console.log("2. Testing Stateful Context Compiler...");
  const compiled = await compileStatefulContext({
    userId: "test_user_001",
    customSystemPrompt: "Prioritize strict typing.",
    incomingMessages: [{ role: "user", content: "Hello Aldan" }],
  });
  if (!compiled.systemPrompt.includes("Aldan")) {
    throw new Error("System prompt missing Aldan identity!");
  }
  if (!compiled.systemPrompt.includes("Prioritize strict typing.")) {
    throw new Error("System prompt missing custom instruction!");
  }
  console.log("   ✓ Compiled prompt length:", compiled.systemPrompt.length, "characters");
  console.log("   ✓ Context Compiler verified!\n");

  // 3. Testing Provider V1 Interface
  console.log("3. Testing Vercel AI SDK LanguageModelV1 Provider...");
  const aldan = createAldan({ apiKey: "aldan_sk_test" });
  const model = aldan("aldan-stateful-v1");
  if (model.specificationVersion !== "v1") {
    throw new Error("Model does not implement specificationVersion v1");
  }
  if (model.provider !== "aldan") {
    throw new Error(`Expected provider 'aldan', got '${model.provider}'`);
  }
  if (typeof model.doGenerate !== "function" || typeof model.doStream !== "function") {
    throw new Error("Model missing required doGenerate or doStream methods");
  }
  console.log("   ✓ Provider created successfully with modelId:", model.modelId);
  console.log("   ✓ Provider adheres strictly to LanguageModelV1 spec!\n");

  console.log("🎉 All automated verification tests passed!");
}

runVerification().catch((err) => {
  console.error("❌ Verification failed:", err);
  process.exit(1);
});
