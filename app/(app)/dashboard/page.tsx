import { requireDbUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma/client"
import { ItemCard } from "@/components/items/item-card"
import { ActivityTimeline } from "@/components/dashboard/activity-timeline"
import { Film, Tv, BookOpen, TrendingUp, CheckCircle, Clock } from "lucide-react"

export default async function DashboardPage() {
  const user = await requireDbUser()

  const [items, activities] = await Promise.all([
    prisma.item.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      include: { metadata: true },
    }),
    prisma.activityLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { item: true },
    }),
  ])

  const active = items.filter((i) => i.status === "watching" || i.status === "reading")
  const recentlyCompleted = items
    .filter((i) => i.status === "completed")
    .sort((a, b) => (b.completedAt?.getTime() ?? 0) - (a.completedAt?.getTime() ?? 0))
    .slice(0, 6)
  const planned = items.filter((i) => i.status === "planned").slice(0, 6)

  const stats = {
    total: items.length,
    active: active.length,
    completed: items.filter((i) => i.status === "completed").length,
    paused: items.filter((i) => i.status === "paused").length,
    movies: items.filter((i) => i.type === "movie").length,
    shows: items.filter((i) => i.type === "series" || i.type === "anime").length,
    books: items.filter((i) => i.type === "book" || i.type === "manga").length,
    totalEpisodes: items.reduce((acc, i) => acc + i.progressCurrent, 0),
  }

  const isEmpty = items.length === 0

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">

      {/* Hero stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Tracked", value: stats.total, icon: TrendingUp, color: "#F5C518" },
          { label: "Active", value: stats.active, icon: Clock, color: "#3b82f6" },
          { label: "Completed", value: stats.completed, icon: CheckCircle, color: "#10b981" },
          { label: "Movies", value: stats.movies, icon: Film, color: "#ec4899" },
          { label: "Shows", value: stats.shows, icon: Tv, color: "#8b5cf6" },
          { label: "Books", value: stats.books, icon: BookOpen, color: "#f59e0b" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-4 flex flex-col gap-2"
            style={{ background: "oklch(0.14 0.018 255 / 90%)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
              <s.icon size={14} style={{ color: s.color }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {isEmpty && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#F5C518]/10 border border-[#F5C518]/20 flex items-center justify-center mb-4">
            <BookOpen size={24} className="text-[#F5C518]" />
          </div>
          <h2 className="text-xl font-bold mb-2">Your library is empty</h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            Use the Search &amp; add button in the header to start tracking movies, shows, books, and more.
          </p>
        </div>
      )}

      {/* Continue watching */}
      {active.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-foreground">Continue Watching</h2>
            <span className="text-xs text-muted-foreground">{active.length} active</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {active.map((item) => <ItemCard key={item.id} item={item} />)}
          </div>
        </section>
      )}

      {/* Up next */}
      {planned.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-foreground">Up Next</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {planned.map((item) => <ItemCard key={item.id} item={item} />)}
          </div>
        </section>
      )}

      {/* Recently completed */}
      {recentlyCompleted.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-foreground">Recently Completed</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {recentlyCompleted.map((item) => (
              <div key={item.id} className="relative">
                <ItemCard item={item} />
                {/* Episode count badge */}
                {(item.type === "series" || item.type === "anime") && item.progressCurrent > 0 && (
                  <div className="absolute -bottom-2 left-3 right-3 flex items-center justify-center">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-900/90 text-emerald-300 border border-emerald-700/40">
                      {item.progressCurrent} ep
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Activity */}
      {activities.length > 0 && (
        <section>
          <h2 className="text-base font-bold text-foreground mb-4">Recent Activity</h2>
          <ActivityTimeline activities={activities} />
        </section>
      )}
    </div>
  )
}
