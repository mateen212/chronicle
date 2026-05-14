"use server";

import { ItemStatus, ItemType, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import slugify from "slugify";
import { z } from "zod";

import { requireDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma/client";

const itemSchema = z.object({
  title: z.string().min(1),
  type: z.nativeEnum(ItemType),
  status: z.nativeEnum(ItemStatus).default(ItemStatus.planned),
  description: z.string().optional(),
  notes: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  progressCurrent: z.coerce.number().int().min(0).default(0),
  progressTotal: z.coerce.number().int().min(0).optional(),
  rating: z.coerce.number().int().min(1).max(10).optional(),
  externalId: z.string().optional(),
  externalSource: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

function toSlug(input: string) {
  return slugify(input, { lower: true, strict: true, trim: true });
}

export async function createItemAction(rawInput: unknown) {
  const user = await requireDbUser();
  const input = itemSchema.parse(rawInput);

  const baseSlug = toSlug(input.title);
  const count = await prisma.item.count({ where: { userId: user.id, slug: { startsWith: baseSlug } } });
  const slug = count ? `${baseSlug}-${count + 1}` : baseSlug;

  const createdItem = await prisma.item.create({
    data: {
      userId: user.id,
      title: input.title,
      slug,
      type: input.type,
      status: input.status,
      description: input.description,
      notes: input.notes,
      imageUrl: input.imageUrl || undefined,
      progressCurrent: input.progressCurrent,
      progressTotal: input.progressTotal,
      rating: input.rating,
      externalId: input.externalId,
      externalSource: input.externalSource,
      metadata: input.metadata ? { create: { data: input.metadata as Prisma.InputJsonValue } } : undefined,
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: user.id,
      itemId: createdItem.id,
      action: "item_created",
      details: {
        type: createdItem.type,
        title: createdItem.title,
      },
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/items");
  return createdItem;
}

export async function updateItemAction(itemId: string, rawInput: unknown) {
  const user = await requireDbUser();
  const input = itemSchema.partial().parse(rawInput);

  const item = await prisma.item.findFirst({ where: { id: itemId, userId: user.id } });
  if (!item) throw new Error("Item not found");

  const updated = await prisma.item.update({
    where: { id: itemId },
    data: {
      title: input.title,
      type: input.type,
      status: input.status,
      description: input.description,
      notes: input.notes,
      imageUrl: input.imageUrl || undefined,
      progressCurrent: input.progressCurrent,
      progressTotal: input.progressTotal,
      rating: input.rating,
    },
  });

  if (typeof input.status !== "undefined" && input.status !== item.status) {
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        itemId,
        action: "status_changed",
        details: {
          from: item.status,
          to: input.status,
        },
      },
    });
  }

  if (typeof input.progressCurrent !== "undefined" && input.progressCurrent !== item.progressCurrent) {
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        itemId,
        action: "progress_updated",
        details: {
          from: item.progressCurrent,
          to: input.progressCurrent,
          total: input.progressTotal ?? item.progressTotal,
        },
      },
    });
  }

  if (typeof input.rating !== "undefined" && input.rating !== item.rating) {
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        itemId,
        action: "rating_changed",
        details: {
          from: item.rating,
          to: input.rating,
        },
      },
    });
  }

  if (updated.status === "completed" && item.status !== "completed") {
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        itemId,
        action: "item_completed",
        details: {
          title: updated.title,
        },
      },
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/items");
  revalidatePath(`/items/${itemId}`);
  return updated;
}

export async function deleteItemAction(itemId: string) {
  const user = await requireDbUser();

  const item = await prisma.item.findFirst({ where: { id: itemId, userId: user.id } });
  if (!item) throw new Error("Item not found");

  await prisma.item.delete({ where: { id: itemId } });

  revalidatePath("/dashboard");
  revalidatePath("/items");
}
