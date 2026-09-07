import { NextResponse } from "next/server";
import { SUPPORTED_MODELS } from "@/lib/ai/gemini";

export const dynamic = "force-dynamic";

export async function GET() {
  const models = [
    {
      id: "aldan-stateful-v1",
      object: "model",
      created: 1740000000,
      owned_by: "aldan",
      context_window: 1048576,
      description:
        "Aldan default stateful model with adaptive context compilation, memory injection, and background reflection.",
    },
    ...SUPPORTED_MODELS.map((m) => ({
      id: m.id,
      object: "model",
      created: 1740000000,
      owned_by: "google",
      context_window: m.contextWindow,
      description: m.description,
    })),
  ];

  return NextResponse.json({
    object: "list",
    data: models,
  });
}
