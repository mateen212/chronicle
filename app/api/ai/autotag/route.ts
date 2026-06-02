import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { geminiApiKey, generateGeminiText } from "@/lib/ai/client";
import { prisma } from "@/lib/prisma/client";
import { requireDbUser } from "@/lib/auth";

const bodySchema = z.object({ itemId: z.string() });

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!geminiApiKey) return NextResponse.json({ tags: [] });

  const body = bodySchema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const dbUser = await requireDbUser();
  const item = await prisma.item.findFirst({
    where: { id: body.data.itemId, userId: dbUser.id },
    include: { metadata: true },
  });
  if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

  try {
    const text = await generateGeminiText({
      maxOutputTokens: 100,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Return a JSON array of 3-5 mood/theme tags for: "${item.title}" (${item.type}). Description: ${item.description ?? "none"}. Return ONLY the JSON array, e.g. ["action","dark","thriller"]`,
            },
          ],
        },
      ],
    });

    const match = text.match(/\[[\s\S]*\]/);
    const tags: string[] = match ? (JSON.parse(match[0]) as string[]) : [];

    for (const tagName of tags) {
      const tag = await prisma.tag.upsert({
        where: { userId_name: { userId: dbUser.id, name: tagName.toLowerCase().trim() } },
        create: { userId: dbUser.id, name: tagName.toLowerCase().trim(), color: "#6366f1" },
        update: {},
      });
      await prisma.itemTag.upsert({
        where: { itemId_tagId: { itemId: item.id, tagId: tag.id } },
        create: { itemId: item.id, tagId: tag.id },
        update: {},
      });
    }

    return NextResponse.json({ tags });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
