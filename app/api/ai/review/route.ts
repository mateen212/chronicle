import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { anthropic, AI_MODEL } from "@/lib/ai/client";

const bodySchema = z.object({
  title: z.string(),
  type: z.string(),
  rating: z.number().optional(),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!anthropic) {
    return NextResponse.json({ error: "AI features not configured" }, { status: 503 });
  }

  const body = bodySchema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const { title, type, rating, notes } = body.data;

  const stream = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 300,
    stream: true,
    system:
      "You are a thoughtful critic. Write a personal 150-word review in first person. Be honest, reflective, and specific.",
    messages: [
      {
        role: "user",
        content: `Write a review for: "${title}" (${type}). My rating: ${rating ?? "unrated"}/10. My notes: ${notes ?? "none"}.`,
      },
    ],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
          controller.enqueue(encoder.encode(event.delta.text));
        }
      }
      controller.close();
    },
  });

  return new NextResponse(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
