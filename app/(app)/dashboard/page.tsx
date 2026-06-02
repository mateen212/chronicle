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

      {/* Hero stats - editorial cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: "Tracked", value: stats.total, icon: TrendingUp },
          { label: "Active", value: stats.active, icon: Clock },
          { label: "Completed", value: stats.completed, icon: CheckCircle },
          { label: "Movies", value: stats.movies, icon: Film },
          { label: "Shows", value: stats.shows, icon: Tv },
          { label: "Books", value: stats.books, icon: BookOpen },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-4 bg-card border-border shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-medium tracking-wide">{s.label}</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{s.value}</p>
              </div>
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-popover/6">
                  <s.icon size={20} className="text-primary" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isEmpty && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
            <BookOpen size={24} className="text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2 text-foreground">Your library is empty</h2>
          <p className="text-sm text-muted-foreground max-w-lg">
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
