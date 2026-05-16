import { currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";

import { AnimatedSection } from "@/components/common/animated-section";
import { GlassCard } from "@/components/common/glass-card";
import { requireDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma/client";
import { ProfileStats } from "@/components/profile/profile-stats";

export default async function ProfilePage() {
  const [clerkUser, dbUser] = await Promise.all([currentUser(), requireDbUser()]);

  const [itemsByType, totalItems, completedItems, ratingStats] = await Promise.all([
    prisma.item.groupBy({
      by: ["type"],
      where: { userId: dbUser.id },
      _count: { type: true },
    }),
    prisma.item.count({ where: { userId: dbUser.id } }),
    prisma.item.count({ where: { userId: dbUser.id, status: "completed" } }),
    prisma.item.aggregate({
      where: { userId: dbUser.id, rating: { not: null } },
      _avg: { rating: true },
      _count: { rating: true },
    }),
  ]);

  const completionRate = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const avgRating = ratingStats._avg.rating
    ? Math.round(ratingStats._avg.rating * 10) / 10
    : null;

  return (
    <div className="space-y-6">
      <AnimatedSection className="rounded-3xl border border-white/10 bg-gradient-to-r from-violet-500/20 via-indigo-500/10 to-cyan-500/20 p-6 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-white/20">
              {clerkUser?.imageUrl ? (
                <img src={clerkUser.imageUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500/50 to-cyan-500/50 text-2xl font-bold">
                  {clerkUser?.firstName?.[0] ?? "?"}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{clerkUser?.fullName ?? "Profile"}</h1>
              <p className="text-sm text-muted-foreground">
                {clerkUser?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>
          <UserButton showName />
        </div>
      </AnimatedSection>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GlassCard>
          <p className="text-sm text-muted-foreground">Total items</p>
          <p className="text-3xl font-bold">{totalItems}</p>
        </GlassCard>
        <GlassCard>
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="text-3xl font-bold">{completedItems}</p>
        </GlassCard>
        <GlassCard>
          <p className="text-sm text-muted-foreground">Completion rate</p>
          <p className="text-3xl font-bold">{completionRate}%</p>
        </GlassCard>
        <GlassCard>
          <p className="text-sm text-muted-foreground">Avg rating</p>
          <p className="text-3xl font-bold">{avgRating ?? "—"}</p>
        </GlassCard>
      </div>

      <AnimatedSection delay={0.1}>
        <GlassCard>
          <h2 className="mb-4 text-lg font-semibold">Library by type</h2>
          <ProfileStats data={itemsByType.map((g) => ({ type: g.type, count: g._count.type }))} />
        </GlassCard>
      </AnimatedSection>
    </div>
  );
}
