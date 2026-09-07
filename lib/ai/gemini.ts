import { createGoogleGenerativeAI } from "@ai-sdk/google";

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;

export const google = createGoogleGenerativeAI({
  apiKey: apiKey || "dummy-key-for-build-or-mock",
});

export const DEFAULT_MODEL = "gemini-2.0-flash";

export const SUPPORTED_MODELS = [
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    description: "Next-gen multimodal model with ultra-fast speed and strong reasoning.",
    contextWindow: 1048576,
    recommended: true,
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    description: "Mid-size multimodal model optimized for complex reasoning and large context tasks.",
    contextWindow: 2097152,
    recommended: false,
  },
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    description: "Fast, lightweight multimodal model optimized for efficiency.",
    contextWindow: 1048576,
    recommended: false,
  },
];

export function getGeminiModel(modelId = DEFAULT_MODEL) {
  const matched = SUPPORTED_MODELS.find((m) => m.id === modelId);
  const targetId = matched ? matched.id : DEFAULT_MODEL;
  return google(targetId);
}
