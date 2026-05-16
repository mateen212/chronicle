import { requireDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma/client";
import { AnimatedSection } from "@/components/common/animated-section";
import { GlassCard } from "@/components/common/glass-card";
import { ActivityHeatmap } from "@/components/analytics/activity-heatmap";
import { CompletionTrendChart } from "@/components/analytics/completion-trend";
import { TypeDistributionChart } from "@/components/analytics/type-distribution";
import { AvgRatingChart } from "@/components/analytics/avg-rating-chart";
import { Stats3DScatterClient as Stats3DScatter } from "@/components/analytics/stats-3d-scatter-client";
import { eachDayOfInterval, subDays, format, startOfMonth, endOfMonth, subMonths } from "date-fns";

export default async function AnalyticsPage() {
  const user = await requireDbUser();

  const now = new Date();
  const oneYearAgo = subDays(now, 364);

  const [activities, itemsByType, ratingsByType, recentActivity, scatterItems] = await Promise.all([
    prisma.activityLog.findMany({
      where: { userId: user.id, createdAt: { gte: oneYearAgo } },
      select: { createdAt: true },
    }),
    prisma.item.groupBy({
      by: ["type"],
      where: { userId: user.id },
      _count: { type: true },
    }),
    prisma.item.groupBy({
      by: ["type"],
      where: { userId: user.id, rating: { not: null } },
      _avg: { rating: true },
    }),
    prisma.activityLog.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: subMonths(now, 6) },
        action: "item_completed",
      },
      select: { createdAt: true },
    }),
    prisma.item.findMany({
      where: { userId: user.id, rating: { not: null } },
      select: { type: true, title: true, rating: true, progressCurrent: true, progressTotal: true },
      take: 200,
    }),
  ]);

  // Build heatmap data
  const days = eachDayOfInterval({ start: oneYearAgo, end: now });
  const activityByDay: Record<string, number> = {};
  activities.forEach((a) => {
    const day = format(a.createdAt, "yyyy-MM-dd");
    activityByDay[day] = (activityByDay[day] ?? 0) + 1;
  });
  const heatmapData = days.map((d) => ({
    date: format(d, "yyyy-MM-dd"),
    count: activityByDay[format(d, "yyyy-MM-dd")] ?? 0,
  }));

  // Monthly completion trend (last 6 months)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const month = subMonths(now, 5 - i);
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const count = recentActivity.filter(
      (a) => a.createdAt >= start && a.createdAt <= end,
    ).length;
    return { month: format(month, "MMM"), count };
  });

  // Streak calculation
  let longestStreak = 0;
  let currentStreak = 0;
  for (const d of heatmapData) {
    if (d.count > 0) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return (
    <div className="space-y-6">
      <AnimatedSection className="rounded-3xl border border-white/10 bg-gradient-to-r from-violet-500/20 via-indigo-500/10 to-cyan-500/20 p-6 backdrop-blur-xl">
        <p className="text-xs uppercase tracking-widest text-cyan-200/80">Analytics</p>
        <h1 className="mt-2 text-3xl font-bold">Your tracking overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Longest streak: <span className="font-semibold text-cyan-300">{longestStreak} days</span>
        </p>
      </AnimatedSection>

      <AnimatedSection delay={0.05}>
        <GlassCard>
          <h2 className="mb-4 text-lg font-semibold">Activity heatmap</h2>
          <ActivityHeatmap data={heatmapData} />
        </GlassCard>
      </AnimatedSection>

      <div className="grid gap-6 lg:grid-cols-2">
        <AnimatedSection delay={0.1}>
          <GlassCard>
            <h2 className="mb-4 text-lg font-semibold">Monthly completions</h2>
            <CompletionTrendChart data={monthlyData} />
          </GlassCard>
        </AnimatedSection>

        <AnimatedSection delay={0.15}>
          <GlassCard>
            <h2 className="mb-4 text-lg font-semibold">Library by type</h2>
            <TypeDistributionChart
              data={itemsByType.map((g) => ({ type: g.type, count: g._count.type }))}
            />
          </GlassCard>
        </AnimatedSection>
      </div>

      <AnimatedSection delay={0.2}>
        <GlassCard>
          <h2 className="mb-4 text-lg font-semibold">Average rating by type</h2>
          <AvgRatingChart
            data={ratingsByType
              .filter((g) => g._avg.rating !== null)
              .map((g) => ({ type: g.type, avg: Math.round((g._avg.rating ?? 0) * 10) / 10 }))}
          />
        </GlassCard>
      </AnimatedSection>

      <AnimatedSection delay={0.25}>
        <GlassCard>
          <h2 className="mb-2 text-lg font-semibold">3D stats explorer</h2>
          <p className="mb-4 text-sm text-muted-foreground">X = rating · Y = progress % · Z = item type · Drag to rotate</p>
          <Stats3DScatter items={scatterItems.map((i) => ({ ...i, rating: i.rating ?? undefined }))} />
        </GlassCard>
      </AnimatedSection>
    </div>
  );
}
