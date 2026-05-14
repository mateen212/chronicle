import { auth, currentUser } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma/client";

export async function requireDbUser() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const clerkUser = await currentUser();

  const email = clerkUser?.emailAddresses?.[0]?.emailAddress;
  if (!email) {
    throw new Error("No email found for authenticated user");
  }

  return prisma.user.upsert({
    where: { id: userId },
    update: {
      email,
      name: clerkUser?.fullName ?? undefined,
      image: clerkUser?.imageUrl,
    },
    create: {
      id: userId,
      email,
      name: clerkUser?.fullName ?? undefined,
      image: clerkUser?.imageUrl,
    },
  });
}
