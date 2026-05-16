import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { anthropic, AI_MODEL } from "@/lib/ai/client";
import { requireDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma/client";

const bodySchema = z.object({
  message: z.string().min(1).max(2000),
  history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })).optional().default([]),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!anthropic) {
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

  const stream = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 1024,
    stream: true,
    system: `You are a helpful media recommendation assistant for Chronicle, a personal tracking app. The user's library: ${JSON.stringify(library)}. Recommend items based on their mood/preferences and what they've already tracked.`,
    messages: [
      ...body.data.history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      { role: "user" as const, content: body.data.message },
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
