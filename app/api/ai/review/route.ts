import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { geminiApiKey, streamGeminiText } from "@/lib/ai/client";

const bodySchema = z.object({
  title: z.string(),
  type: z.string(),
  rating: z.number().optional(),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!geminiApiKey) {
    return NextResponse.json({ error: "AI features not configured" }, { status: 503 });
  }

  const body = bodySchema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const { title, type, rating, notes } = body.data;

  const readable = streamGeminiText({
    maxOutputTokens: 300,
    systemInstruction:
      "You are a thoughtful critic. Write a personal 150-word review in first person. Be honest, reflective, and specific.",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Write a review for: "${title}" (${type}). My rating: ${rating ?? "unrated"}/10. My notes: ${notes ?? "none"}.`,
          },
        ],
      },
    ],
  });

  return new NextResponse(readable, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
