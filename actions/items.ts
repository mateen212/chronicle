"use server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma/client"
import { requireDbUser } from "@/lib/auth"

function makeSlug(title: string, id: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + id.slice(-6)
}

export async function createItem(data: {
  type: string
  title: string
  description?: string
  imageUrl?: string
  externalId?: string
  externalSource?: string
  metadata?: Record<string, unknown>
  progressTotal?: number
  progressCurrent?: number
  status?: string
  rating?: number
}) {
  const user = await requireDbUser()
  const id = crypto.randomUUID()
  const item = await prisma.item.create({
    data: {
      id,
      userId: user.id,
      type: data.type as Parameters<typeof prisma.item.create>[0]["data"]["type"],
      title: data.title,
      slug: makeSlug(data.title, id),
      description: data.description,
      imageUrl: data.imageUrl,
      externalId: data.externalId,
      externalSource: data.externalSource,
      progressTotal: data.progressTotal,
      ...(data.progressCurrent !== undefined ? { progressCurrent: data.progressCurrent } : {}),
      rating: data.rating,
      ...(data.status ? { status: data.status as Parameters<typeof prisma.item.create>[0]["data"]["status"] } : {}),
      ...(data.status === "watching" || data.status === "reading" ? { startedAt: new Date() } : {}),
      ...(data.status === "completed" ? { completedAt: new Date() } : {}),
      metadata: data.metadata ? { create: { data: data.metadata as import("@prisma/client").Prisma.InputJsonValue } } : undefined,
    },
  })
  await prisma.activityLog.create({
    data: {
      userId: user.id,
      itemId: item.id,
      action: "item_created",
      details: { title: data.title, type: data.type },
    },
  })
  revalidatePath("/dashboard")
  revalidatePath("/items")
  return item
}

export async function updateItemProgress(itemId: string, current: number, total?: number) {
  const user = await requireDbUser()
  const item = await prisma.item.findFirst({ where: { id: itemId, userId: user.id } })
  if (!item) throw new Error("Item not found")
  const completed = total ? current >= total : false
  const updated = await prisma.item.update({
    where: { id: itemId },
    data: {
      progressCurrent: current,
      ...(total !== undefined ? { progressTotal: total } : {}),
      ...(completed ? { status: "completed", completedAt: new Date() } : {}),
    },
  })
  await prisma.activityLog.create({
    data: {
      userId: user.id,
      itemId,
      action: completed ? "item_completed" : "progress_updated",
      details: { previous: item.progressCurrent, current, total },
    },
  })
  revalidatePath("/dashboard")
  revalidatePath(`/items/${itemId}`)
  return updated
}

export async function updateItemStatus(itemId: string, status: string) {
  const user = await requireDbUser()
  const updated = await prisma.item.update({
    where: { id: itemId, userId: user.id },
    data: {
      status: status as Parameters<typeof prisma.item.update>[0]["data"]["status"],
      ...(status === "watching" || status === "reading" ? { startedAt: new Date() } : {}),
      ...(status === "completed" ? { completedAt: new Date() } : {}),
    },
  })
  await prisma.activityLog.create({
    data: {
      userId: user.id,
      itemId,
      action: status === "completed" ? "item_completed" : "status_changed",
      details: { status },
    },
  })
  revalidatePath("/dashboard")
  revalidatePath(`/items/${itemId}`)
  return updated
}

export async function updateItemRating(itemId: string, rating: number) {
  const user = await requireDbUser()
  const updated = await prisma.item.update({ where: { id: itemId, userId: user.id }, data: { rating } })
  await prisma.activityLog.create({
    data: { userId: user.id, itemId, action: "rating_changed", details: { rating } },
  })
  revalidatePath(`/items/${itemId}`)
  return updated
}

export async function updateItemNotes(itemId: string, notes: string) {
  const user = await requireDbUser()
  return prisma.item.update({ where: { id: itemId, userId: user.id }, data: { notes } })
}

export async function deleteItem(itemId: string) {
  const user = await requireDbUser()
  await prisma.item.delete({ where: { id: itemId, userId: user.id } })
  revalidatePath("/items")
  revalidatePath("/dashboard")
}

// Backward-compat alias
export const createItemAction = createItem
