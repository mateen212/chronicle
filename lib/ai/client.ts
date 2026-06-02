const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is missing — AI features disabled");
}

export const geminiApiKey = apiKey ?? null;
export const AI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

type GeminiContentPart = {
  text: string;
};

export type GeminiContent = {
  role: "user" | "model";
  parts: GeminiContentPart[];
};

type GeminiRequestOptions = {
  systemInstruction?: string;
  contents: GeminiContent[];
  maxOutputTokens?: number;
  temperature?: number;
};

function extractText(payload: unknown) {
  const text =
    (payload as { candidates?: Array<{ content?: { parts?: GeminiContentPart[] } }> })?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .join("") ?? "";

  return text;
}

function buildBody({ systemInstruction, contents, maxOutputTokens = 1024, temperature }: GeminiRequestOptions) {
  return {
    ...(systemInstruction ? { systemInstruction: { parts: [{ text: systemInstruction }] } } : {}),
    contents,
    generationConfig: {
      maxOutputTokens,
      ...(typeof temperature === "number" ? { temperature } : {}),
    },
  };
}

function buildUrl(action: "generateContent" | "streamGenerateContent") {
  if (!geminiApiKey) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  return `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(AI_MODEL)}:${action}?key=${geminiApiKey}`;
}

async function requestGemini(action: "generateContent" | "streamGenerateContent", options: GeminiRequestOptions) {
  const response = await fetch(buildUrl(action), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildBody(options)),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Gemini request failed with status ${response.status}`);
  }

  return response;
}

export async function generateGeminiText(options: GeminiRequestOptions) {
  const response = await requestGemini("generateContent", options);
  const payload = (await response.json()) as unknown;
  return extractText(payload);
}

export function streamGeminiText(options: GeminiRequestOptions) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const response = await requestGemini("streamGenerateContent", options);
        if (!response.body) {
          controller.close();
          return;
        }

        const reader = response.body.getReader();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split(/\r?\n/);
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data:")) continue;

            const payload = line.slice(5).trim();
            if (!payload || payload === "[DONE]") continue;

            try {
              const parsed = JSON.parse(payload) as unknown;
              const text = extractText(parsed);
              if (text) controller.enqueue(encoder.encode(text));
            } catch {
              // Skip partial/non-JSON SSE frames.
            }
          }
        }

        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}
