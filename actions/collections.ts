"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma/client";

const collectionSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export async function createCollectionAction(rawInput: unknown) {
  const user = await requireDbUser();
  const input = collectionSchema.parse(rawInput);

  const collection = await prisma.collection.create({
    data: {
      userId: user.id,
      name: input.name,
      description: input.description,
    },
  });

  revalidatePath("/collections");
  return collection;
}

export async function addItemToCollectionAction(collectionId: string, itemId: string) {
  const user = await requireDbUser();

  const collection = await prisma.collection.findFirst({ where: { id: collectionId, userId: user.id } });
  if (!collection) {
    throw new Error("Collection not found");
  }

  await prisma.collectionItem.create({
    data: {
      collectionId,
      itemId,
    },
  });

  revalidatePath("/collections");
}

export async function removeItemFromCollectionAction(collectionId: string, itemId: string) {
  const user = await requireDbUser();

  const collection = await prisma.collection.findFirst({ where: { id: collectionId, userId: user.id } });
  if (!collection) {
    throw new Error("Collection not found");
  }

  await prisma.collectionItem.delete({
    where: {
      collectionId_itemId: {
        collectionId,
        itemId,
      },
    },
  });

  revalidatePath("/collections");
}
