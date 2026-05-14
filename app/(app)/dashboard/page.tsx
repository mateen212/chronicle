import { ItemStatus } from "@prisma/client";

import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { AnimatedSection } from "@/components/common/animated-section";
import { EmptyState } from "@/components/common/empty-state";
import { GlassCard } from "@/components/common/glass-card";
import { ItemCard } from "@/components/items/item-card";
import { requireDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma/client";

export default async function DashboardPage() {
  const user = await requireDbUser();

  const [activeItems, recentlyCompleted, activities, totalItems] = await Promise.all([
    prisma.item.findMany({
      where: { userId: user.id, status: { in: [ItemStatus.watching, ItemStatus.reading, ItemStatus.paused] } },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
    prisma.item.findMany({
      where: { userId: user.id, status: ItemStatus.completed },
      orderBy: { completedAt: "desc" },
      take: 4,
    }),
    prisma.activityLog.findMany({
      where: { userId: user.id },
      include: { item: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
      take: 7,
    }),
    prisma.item.count({ where: { userId: user.id } }),
  ]);

  return (
    <div className="space-y-6">
      <AnimatedSection className="rounded-3xl border border-white/10 bg-gradient-to-r from-violet-500/20 via-indigo-500/10 to-cyan-500/20 p-6 shadow-[0_20px_60px_rgba(10,10,40,0.45)] backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/80">Chronicle Dashboard</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Your personal tracking command center</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Manage media, books, projects, and learning goals from one premium timeline.
        </p>
      </AnimatedSection>

      <AnimatedSection delay={0.05} className="grid gap-4 md:grid-cols-3">
        <GlassCard>
          <p className="text-sm text-muted-foreground">Total items</p>
          <p className="text-3xl font-semibold">{totalItems}</p>
        </GlassCard>
        <GlassCard>
          <p className="text-sm text-muted-foreground">Active now</p>
          <p className="text-3xl font-semibold">{activeItems.length}</p>
        </GlassCard>
        <GlassCard>
          <p className="text-sm text-muted-foreground">Completed recently</p>
          <p className="text-3xl font-semibold">{recentlyCompleted.length}</p>
        </GlassCard>
      </AnimatedSection>

      <AnimatedSection delay={0.1} className="space-y-3">
        <h2 className="text-xl font-semibold">Currently active</h2>
        {activeItems.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {activeItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <EmptyState title="No active items" description="Use Search & add to bring in your next movie, series, book, or project." />
        )}
      </AnimatedSection>

      <AnimatedSection delay={0.15} className="grid gap-4 xl:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Recently completed</h2>
          <div className="space-y-3">
            {recentlyCompleted.map((item) => (
              <GlassCard key={item.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{item.type}</p>
                </div>
                <p className="text-sm text-emerald-300">Completed</p>
              </GlassCard>
            ))}
          </div>
        </div>

        <ActivityTimeline activities={activities} />
      </AnimatedSection>
    </div>
  );
}
