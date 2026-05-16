import { notFound } from "next/navigation"
import { requireDbUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma/client"
import { ItemDetailClient } from "./client"

export default async function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await requireDbUser()
  const item = await prisma.item.findFirst({
    where: { id, userId: user.id },
    include: {
      metadata: true,
      activities: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  })
  if (!item) notFound()
  return <ItemDetailClient item={item} />
}
