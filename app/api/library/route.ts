import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findFirst({ where: { externalId: userId } });
  if (!dbUser) return NextResponse.json({ items: [] });

  const items = await prisma.item.findMany({
    where: { userId: dbUser.id },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ items });
}
