import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { SyncUserOnce } from "@/components/auth/sync-once"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  return (
    <>
      <SyncUserOnce />
      <AppShell>{children}</AppShell>
    </>
  )
}
