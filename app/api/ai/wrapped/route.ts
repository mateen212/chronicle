import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { anthropic, AI_MODEL } from "@/lib/ai/client";
import { prisma } from "@/lib/prisma/client";
import { requireDbUser } from "@/lib/auth";

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!anthropic) return NextResponse.json({ error: "AI not configured" }, { status: 503 });

  const dbUser = await requireDbUser();
  const thisYear = new Date().getFullYear();
  const startOfYear = new Date(`${thisYear}-01-01`);

  const [items, activities] = await Promise.all([
    prisma.item.findMany({
      where: { userId: dbUser.id, createdAt: { gte: startOfYear } },
      select: { title: true, type: true, status: true, rating: true },
    }),
    prisma.activityLog.count({ where: { userId: dbUser.id, createdAt: { gte: startOfYear } } }),
  ]);

  const summary = {
    year: thisYear,
    totalItems: items.length,
    completed: items.filter((i) => i.status === "completed").length,
    activities,
    topRated: items.filter((i) => (i.rating ?? 0) >= 8).slice(0, 5),
    breakdown: Object.fromEntries(
      Object.entries(
        items.reduce((acc: Record<string, number>, i) => {
          acc[i.type] = (acc[i.type] ?? 0) + 1;
          return acc;
        }, {}),
      ),
    ),
  };

  const stream = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 600,
    stream: true,
    system:
      "You create engaging, personal year-in-review narratives for a media tracking app. Be warm, specific, and fun.",
    messages: [
      {
        role: "user",
        content: `Generate a 300-word year-in-review narrative for ${thisYear}. Data: ${JSON.stringify(summary)}`,
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

  return new NextResponse(readable, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
