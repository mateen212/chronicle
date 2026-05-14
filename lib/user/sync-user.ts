import { prisma } from "@/lib/prisma/client";

export async function syncUser(user: { externalId?: string; email: string; name?: string | null; image?: string | null; }) {
  if (!user?.email) throw new Error("Missing email");

  const existingByExternal = user.externalId ? await prisma.user.findUnique({ where: { externalId: user.externalId } }) : null;
  if (existingByExternal) return existingByExternal;

  const existing = await prisma.user.findUnique({ where: { email: user.email } });
  if (existing) {
    // If user exists but doesn't have externalId, try to set it safely
    if (user.externalId && !existing.externalId) {
      try {
        return await prisma.user.update({ where: { email: user.email }, data: { externalId: user.externalId, name: user.name ?? existing.name, image: user.image ?? existing.image } });
      } catch (e) {
        return existing;
      }
    }
    return existing;
  }

  try {
    const created = await prisma.user.create({
      data: {
        externalId: user.externalId,
        email: user.email,
        name: user.name ?? null,
        image: user.image ?? null,
      },
    });

    return created;
  } catch (e) {
    // Race or unique constraint — fallback to returning the existing record
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await prisma.user.findUnique({ where: { email: user.email } });
  }
}
