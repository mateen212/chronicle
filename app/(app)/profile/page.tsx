import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";

import { GlassCard } from "@/components/common/glass-card";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function ProfilePage() {
  const user = await currentUser();

  return (
    <div className="space-y-4">
      <GlassCard className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/50 to-cyan-500/50 p-[2px]">
            <div className="h-full w-full rounded-full bg-slate-950" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user?.fullName ?? "Profile"}</h1>
            <p className="text-sm text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserButton showName />
        </div>
      </GlassCard>

      <GlassCard>
        <h2 className="text-lg font-semibold">Account settings</h2>
        <p className="mt-2 text-sm text-muted-foreground">Manage profile details from the Clerk user menu.</p>
      </GlassCard>
    </div>
  );
}
