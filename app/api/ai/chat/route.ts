import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { geminiApiKey, streamGeminiText } from "@/lib/ai/client";
import { requireDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma/client";

const bodySchema = z.object({
  message: z.string().min(1).max(2000),
  history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })).optional().default([]),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!geminiApiKey) {
    return NextResponse.json({ error: "AI features not configured" }, { status: 503 });
  }

  const body = bodySchema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const dbUser = await requireDbUser();
  const library = await prisma.item.findMany({
    where: { userId: dbUser.id },
    select: { title: true, type: true, status: true, rating: true },
    take: 100,
  });

  const readable = streamGeminiText({
    maxOutputTokens: 1024,
    systemInstruction: `You are a helpful media recommendation assistant for Chronicle, a personal tracking app. The user's library: ${JSON.stringify(library)}. Recommend items based on their mood/preferences and what they've already tracked.`,
    contents: [
      ...body.data.history.map((m) => ({
        role: m.role === "assistant" ? ("model" as const) : ("user" as const),
        parts: [{ text: m.content }],
      })),
      { role: "user", parts: [{ text: body.data.message }] },
    ],
  });

  return new NextResponse(readable, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
