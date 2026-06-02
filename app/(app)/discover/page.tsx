import { requireDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma/client";
import { AnimatedSection } from "@/components/common/animated-section";
import { EmptyState } from "@/components/common/empty-state";
import Image from "next/image";
import { createItemAction } from "@/actions/items";

async function fetchTmdbRecommendations(externalId: string, type: "movie" | "series") {
  const key = process.env.TMDB_API_KEY;
  if (!key) return [];
  const endpoint = type === "movie" ? `movie/${externalId}/recommendations` : `tv/${externalId}/recommendations`;
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/${endpoint}?api_key=${key}&language=en-US&page=1`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return [];
    const data = (await res.json()) as {
      results: Array<{
        id: number;
        title?: string;
        name?: string;
        poster_path?: string;
        overview?: string;
      }>;
    };
    return data.results.slice(0, 6).map((r) => ({
      externalId: String(r.id),
      externalSource: "tmdb",
      title: r.title ?? r.name ?? "Untitled",
      description: r.overview,
      imageUrl: r.poster_path ? `https://image.tmdb.org/t/p/w500${r.poster_path}` : undefined,
      type,
    }));
  } catch {
    return [];
  }
}

export default async function DiscoverPage() {
  const user = await requireDbUser();

  const topRated = await prisma.item.findMany({
    where: {
      userId: user.id,
      status: "completed",
      rating: { gte: 8 },
      externalId: { not: null },
      externalSource: "tmdb",
    },
    orderBy: { rating: "desc" },
    take: 5,
  });

  const existingExternalIds = new Set(
    (await prisma.item.findMany({ where: { userId: user.id }, select: { externalId: true } }))
      .map((i) => i.externalId)
      .filter(Boolean),
  );

  type Rec = {
    externalId: string;
    externalSource: string;
    title: string;
    description?: string;
    imageUrl?: string;
    type: string;
  };

  const grouped: Array<{ sourceTitle: string; sourceType: string; recs: Rec[] }> = [];

  for (const item of topRated.slice(0, 3)) {
    const recs = await fetchTmdbRecommendations(
      item.externalId!,
      item.type === "movie" ? "movie" : "series",
    );
    const filtered = recs.filter((r) => !existingExternalIds.has(r.externalId));
    if (filtered.length > 0) {
      grouped.push({ sourceTitle: item.title, sourceType: item.type, recs: filtered });
    }
  }

  return (
    <div className="space-y-6">
      <AnimatedSection className="rounded-3xl p-6 bg-card border-border">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Discover</p>
        <h1 className="mt-2 text-3xl font-semibold text-foreground">Recommendations for you</h1>
        <p className="mt-1 text-sm text-muted-foreground">Based on your top-rated completed items.</p>
      </AnimatedSection>

      {grouped.length === 0 ? (
        <EmptyState
          title="Nothing to discover yet"
          description="Complete and rate more items to get personalized recommendations."
        />
      ) : (
        grouped.map((group) => (
          <AnimatedSection key={group.sourceTitle} delay={0.05}>
            <div className="rounded-2xl p-4 bg-card border-border">
              <p className="mb-4 text-sm font-medium text-muted-foreground">
                Because you loved <span className="font-semibold text-foreground">{group.sourceTitle}</span>…
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.recs.map((rec) => (
                  <article
                    key={`${rec.externalId}-${rec.externalSource}`}
                    className="flex gap-3 rounded-lg p-3 bg-popover/6 border border-border items-center"
                  >
                    {rec.imageUrl && (
                      <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded-md bg-muted">
                        <Image src={rec.imageUrl} alt={rec.title} fill className="object-cover" sizes="44px" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{rec.title}</p>
                      {rec.description && (
                        <p className="line-clamp-2 text-xs text-muted-foreground mt-1">{rec.description}</p>
                      )}
                      <form
                        action={async () => {
                          "use server";
                          await createItemAction({
                            title: rec.title,
                            type: rec.type,
                            status: "planned",
                            description: rec.description,
                            imageUrl: rec.imageUrl,
                            externalId: rec.externalId,
                            externalSource: rec.externalSource,
                          });
                        }}
                        className="mt-3"
                      >
                        <button
                          type="submit"
                          className="rounded-md px-3 py-1 text-xs bg-primary text-primary-foreground hover:bg-primary/90 transition"
                        >
                          + Add to planned
                        </button>
                      </form>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </AnimatedSection>
        ))
      )}
    </div>
  );
}
