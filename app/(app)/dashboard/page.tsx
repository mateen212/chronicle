import { requireDbUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma/client"
import { ItemCard } from "@/components/items/item-card"
import { ActivityTimeline } from "@/components/dashboard/activity-timeline"

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

  const active = items.filter(i => i.status === "watching" || i.status === "reading")
  const recentlyCompleted = items.filter(i => i.status === "completed").slice(0, 5)
  const planned = items.filter(i => i.status === "planned").slice(0, 5)

  const stats = {
    total: items.length,
    active: active.length,
    completed: items.filter(i => i.status === "completed").length,
    paused: items.filter(i => i.status === "paused").length,
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total tracked", value: stats.total },
          { label: "Active", value: stats.active },
          { label: "Completed", value: stats.completed },
          { label: "Paused", value: stats.paused },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-xl border p-4">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="text-3xl font-semibold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Resume watching — the core feature */}
      {active.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">Continue watching / reading</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {active.map(item => <ItemCard key={item.id} item={item} />)}
          </div>
        </section>
      )}

      {/* Up next from planned */}
      {planned.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">Up next</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {planned.map(item => <ItemCard key={item.id} item={item} />)}
          </div>
        </section>
      )}

      {/* Recently completed */}
      {recentlyCompleted.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">Recently completed</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {recentlyCompleted.map(item => <ItemCard key={item.id} item={item} />)}
          </div>
        </section>
      )}

      {/* Activity */}
      {active.length === 0 && planned.length === 0 && recentlyCompleted.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-5xl mb-4">📖</p>
          <p className="text-lg font-medium">Your library is empty</p>
          <p className="text-sm mt-2">Use the search button in the header to add movies, series, anime, books and more.</p>
        </div>
      )}

      <section>
        <h2 className="text-lg font-semibold mb-4">Recent activity</h2>
        <ActivityTimeline activities={activities} />
      </section>
    </div>
  )
}
