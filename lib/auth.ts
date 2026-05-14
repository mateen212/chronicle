import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma/client";

export async function getAuthUser() {
  const { userId } = await auth();
  if (!userId) return null;
  const clerkUser = await currentUser();

  const email = clerkUser?.emailAddresses?.[0]?.emailAddress;
  return {
    authId: userId,
    email: email ?? undefined,
    name: clerkUser?.fullName ?? undefined,
    image: clerkUser?.imageUrl ?? undefined,
  };
}

export async function getDbUserByAuthId(authId: string | undefined) {
  if (!authId) return null;
  return prisma.user.findUnique({ where: { externalId: authId } });
}

export async function getDbUserByEmail(email: string | undefined) {
  if (!email) return null;
  return prisma.user.findUnique({ where: { email } });
}

export async function requireDbUser() {
  const authUser = await getAuthUser();
  if (!authUser) throw new Error("Unauthorized");

  const dbUser = await getDbUserByAuthId(authUser.authId) ?? (authUser.email ? await getDbUserByEmail(authUser.email) : null);
  if (!dbUser) {
    throw new Error("User not synced. Call /api/sync once after sign-in to create user record.");
  }

  return dbUser;
}
