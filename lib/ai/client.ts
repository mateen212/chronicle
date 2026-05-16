import Anthropic from "@anthropic-ai/sdk";

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.warn("ANTHROPIC_API_KEY is missing — AI features disabled");
}

export const anthropic = apiKey ? new Anthropic({ apiKey }) : null;

export const AI_MODEL = "claude-sonnet-4-20250514" as const;
