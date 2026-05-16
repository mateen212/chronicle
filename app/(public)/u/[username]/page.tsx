import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma/client";
import { GlassCard } from "@/components/common/glass-card";
import { StatusBadge } from "@/components/common/status-badge";

type Props = { params: Promise<{ username: string }> };

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;

  const settings = await prisma.userSettings.findFirst({
    where: { username, publicProfile: true },
    include: { user: true },
  });

  if (!settings) notFound();

  const user = settings.user;

  const [totalItems, currentlyWatching, recentlyCompleted, topRated] = await Promise.all([
    prisma.item.count({ where: { userId: user.id } }),
    prisma.item.findMany({
      where: { userId: user.id, status: { in: ["watching", "reading"] } },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
    prisma.item.findMany({
      where: { userId: user.id, status: "completed" },
      orderBy: { completedAt: "desc" },
      take: 6,
    }),
    prisma.item.findMany({
      where: { userId: user.id, rating: { gte: 8 } },
      orderBy: { rating: "desc" },
      take: 6,
    }),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/30 to-slate-950 p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <GlassCard className="flex items-center gap-4">
          {user.image && (
            <Image src={user.image} alt={user.name ?? "Avatar"} width={64} height={64} className="rounded-full" />
          )}
          <div>
            <h1 className="text-2xl font-bold">{user.name ?? username}</h1>
            <p className="text-sm text-muted-foreground">@{username} · {totalItems} items tracked</p>
          </div>
        </GlassCard>

        {currentlyWatching.length > 0 && (
          <GlassCard>
            <h2 className="mb-3 font-semibold">Currently watching / reading</h2>
            <div className="space-y-2">
              {currentlyWatching.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  {item.imageUrl && (
                    <Image src={item.imageUrl} alt={item.title} width={36} height={48} className="rounded-lg object-cover" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.title}</p>
                    <p className="capitalize text-xs text-muted-foreground">{item.type}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {recentlyCompleted.length > 0 && (
          <GlassCard>
            <h2 className="mb-3 font-semibold">Recently completed</h2>
            <div className="space-y-2">
              {recentlyCompleted.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  {item.imageUrl && (
                    <Image src={item.imageUrl} alt={item.title} width={36} height={48} className="rounded-lg object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{item.title}</p>
                  </div>
                  {item.rating && (
                    <span className="text-sm text-yellow-400">★ {item.rating}/10</span>
                  )}
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {topRated.length > 0 && (
          <GlassCard>
            <h2 className="mb-3 font-semibold">Top rated</h2>
            <div className="space-y-2">
              {topRated.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3">
                  <p className="truncate font-medium">{item.title}</p>
                  <span className="text-sm text-yellow-400">★ {item.rating}/10</span>
                </div>
              ))}
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
