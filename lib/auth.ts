import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma/client"
import { redirect } from "next/navigation"

export async function requireDbUser() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")
  const user = await prisma.user.findUnique({ where: { externalId: userId } })
  if (!user) redirect("/sign-in")
  return user
}
