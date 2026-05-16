import { auth, currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma/client"

export async function syncUser() {
  const { userId } = await auth()
  if (!userId) return null
  const clerkUser = await currentUser()
  if (!clerkUser) return null
  for (let i = 0; i < 3; i++) {
    try {
      return await prisma.user.upsert({
        where: { externalId: userId },
        update: {
          email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
          name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim(),
          image: clerkUser.imageUrl,
        },
        create: {
          externalId: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
          name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim(),
          image: clerkUser.imageUrl,
        },
      })
    } catch {
      if (i === 2) throw new Error("User sync failed after 3 attempts")
      await new Promise(r => setTimeout(r, 500 * (i + 1)))
    }
  }
}
