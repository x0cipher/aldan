import type {
  LanguageModelV1,
  LanguageModelV1CallOptions,
  LanguageModelV1StreamPart,
  LanguageModelV1FinishReason,
} from "@ai-sdk/provider";

export interface AldanModelSettings {
  apiKey?: string;
  baseURL?: string;
  headers?: Record<string, string>;
  userId?: string;
  conversationId?: string;
}

export class AldanLanguageModel implements LanguageModelV1 {
  readonly specificationVersion = "v1" as const;
  readonly provider = "aldan";
  readonly modelId: string;
  readonly defaultObjectGenerationMode = "json" as const;

  private readonly apiKey?: string;
  private readonly baseURL: string;
  private readonly customHeaders: Record<string, string>;
  private readonly userId?: string;
  private readonly conversationId?: string;

  constructor(modelId: string, settings: AldanModelSettings = {}) {
    this.modelId = modelId;
    this.apiKey = settings.apiKey || process.env.ALDAN_API_KEY;
    this.baseURL = settings.baseURL || process.env.ALDAN_BASE_URL || "http://localhost:3000/api/v1";
    this.customHeaders = settings.headers || {};
    this.userId = settings.userId;
    this.conversationId = settings.conversationId;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...this.customHeaders,
    };
    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
    }
    return headers;
  }

  async doGenerate(options: LanguageModelV1CallOptions) {
    const messages = options.prompt.map((msg) => {
      let content = "";
      if (typeof msg.content === "string") {
        content = msg.content;
      } else if (Array.isArray(msg.content)) {
        content = msg.content
          .map((part) => ("text" in part ? part.text : ""))
          .join("\n");
      }
      return {
        role: msg.role,
        content,
      };
    });

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        model: this.modelId,
        messages,
        temperature: options.temperature,
        max_tokens: options.maxTokens,
        stream: false,
        user_id: this.userId,
        conversation_id: this.conversationId,
      }),
      signal: options.abortSignal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Aldan API call failed (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0];
    const text = choice?.message?.content || "";
    const finishReason: LanguageModelV1FinishReason =
      choice?.finish_reason === "stop"
        ? "stop"
        : choice?.finish_reason === "length"
        ? "length"
        : "other";

    return {
      text,
      finishReason,
      usage: {
        promptTokens: data.usage?.prompt_tokens ?? 0,
        completionTokens: data.usage?.completion_tokens ?? 0,
      },
      rawCall: {
        rawPrompt: options.prompt,
        rawSettings: {
          model: this.modelId,
          temperature: options.temperature,
        },
      },
      response: {
        id: data.id,
        modelId: this.modelId,
        timestamp: new Date(),
      },
    };
  }

  async doStream(options: LanguageModelV1CallOptions) {
    const messages = options.prompt.map((msg) => {
      let content = "";
      if (typeof msg.content === "string") {
        content = msg.content;
      } else if (Array.isArray(msg.content)) {
        content = msg.content
          .map((part) => ("text" in part ? part.text : ""))
          .join("\n");
      }
      return {
        role: msg.role,
        content,
      };
    });

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        model: this.modelId,
        messages,
        temperature: options.temperature,
        max_tokens: options.maxTokens,
        stream: true,
        user_id: this.userId,
        conversation_id: this.conversationId,
      }),
      signal: options.abortSignal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Aldan Stream failed (${response.status}): ${errorText}`);
    }

    if (!response.body) {
      throw new Error("No response body received from Aldan stream.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    const stream = new ReadableStream<LanguageModelV1StreamPart>({
      async start(controller) {
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith("data: ")) continue;

              const payload = trimmed.slice(6).trim();
              if (payload === "[DONE]") {
                controller.enqueue({
                  type: "finish",
                  finishReason: "stop",
                  usage: { promptTokens: 0, completionTokens: 0 },
                });
                continue;
              }

              try {
                const parsed = JSON.parse(payload);
                const delta = parsed.choices?.[0]?.delta?.content;
                if (delta) {
                  controller.enqueue({
                    type: "text-delta",
                    textDelta: delta,
                  });
                }
              } catch {
                // Ignore parse errors on partial chunks
              }
            }
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return {
      stream,
      rawCall: {
        rawPrompt: options.prompt,
        rawSettings: {
          model: this.modelId,
          temperature: options.temperature,
        },
      },
    };
  }
}
