"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma/client";

const tagSchema = z.object({
  name: z.string().min(1).max(30),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .default("#6366f1"),
});

export async function createTag(rawInput: unknown) {
  const user = await requireDbUser();
  const input = tagSchema.parse(rawInput);

  try {
    const tag = await prisma.tag.upsert({
      where: { userId_name: { userId: user.id, name: input.name } },
      create: { userId: user.id, name: input.name, color: input.color },
      update: { color: input.color },
    });
    return { success: true, tag };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to create tag" };
  }
}

export async function addTagToItem(itemId: string, tagId: string) {
  const user = await requireDbUser();

  const item = await prisma.item.findFirst({ where: { id: itemId, userId: user.id } });
  if (!item) return { success: false, error: "Item not found" };

  const tag = await prisma.tag.findFirst({ where: { id: tagId, userId: user.id } });
  if (!tag) return { success: false, error: "Tag not found" };

  try {
    await prisma.itemTag.upsert({
      where: { itemId_tagId: { itemId, tagId } },
      create: { itemId, tagId },
      update: {},
    });
    revalidatePath(`/items/${itemId}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to add tag" };
  }
}

export async function removeTagFromItem(itemId: string, tagId: string) {
  const user = await requireDbUser();

  const item = await prisma.item.findFirst({ where: { id: itemId, userId: user.id } });
  if (!item) return { success: false, error: "Item not found" };

  await prisma.itemTag.delete({ where: { itemId_tagId: { itemId, tagId } } }).catch(() => {});
  revalidatePath(`/items/${itemId}`);
  return { success: true };
}

export async function deleteTag(tagId: string) {
  const user = await requireDbUser();

  const tag = await prisma.tag.findFirst({ where: { id: tagId, userId: user.id } });
  if (!tag) return { success: false, error: "Tag not found" };

  await prisma.tag.delete({ where: { id: tagId } });
  revalidatePath("/items");
  return { success: true };
}

export async function getUserTags() {
  const user = await requireDbUser();
  return prisma.tag.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } });
}
