import { createCollectionAction } from "@/actions/collections";
import { AnimatedSection } from "@/components/common/animated-section";
import { EmptyState } from "@/components/common/empty-state";
import { GlassCard } from "@/components/common/glass-card";
import { requireDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma/client";
import Link from "next/link";
import Image from "next/image";

export default async function CollectionsPage() {
  const user = await requireDbUser();
  const collections = await prisma.collection.findMany({
    where: { userId: user.id },
    include: {
      items: {
        include: { item: { select: { id: true, title: true, imageUrl: true } } },
        take: 4,
      },
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <AnimatedSection className="rounded-3xl p-6 bg-card border-border">
        <h1 className="text-2xl font-semibold text-foreground">Collections</h1>
        <p className="mt-1 text-sm text-muted-foreground">Group your items into custom lists.</p>

        <form
          action={async (formData) => {
            "use server";
            const name = String(formData.get("name") ?? "").trim();
            if (name) {
              await createCollectionAction({
                name,
                description: String(formData.get("description") ?? "").trim() || undefined,
              });
            }
          }}
          className="mt-4 grid gap-2 sm:grid-cols-[1fr_1fr_auto]"
        >
          <input
            name="name"
            required
            placeholder="Collection name"
            className="rounded-xl px-3 py-2 text-sm bg-input border border-border focus:outline-none focus:border-primary"
          />
          <input
            name="description"
            placeholder="Description (optional)"
            className="rounded-xl px-3 py-2 text-sm bg-input border border-border focus:outline-none focus:border-primary"
          />
          <button className="rounded-xl px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition">
            Create
          </button>
        </form>
      </AnimatedSection>

      {collections.length === 0 ? (
        <EmptyState
          title="No collections yet"
          description="Create a collection to group your items together."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {collections.map((collection) => (
            <Link key={collection.id} href={`/collections/${collection.id}`}>
              <GlassCard className="group cursor-pointer transition hover:shadow-lg">
                {/* Cover mosaic */}
                <div className="mb-3 grid h-28 grid-cols-2 gap-1 overflow-hidden rounded-xl bg-popover/6">
                  {collection.items.length === 0 && (
                    <div className="col-span-2 flex items-center justify-center bg-popover/6 text-xs text-muted-foreground">
                      No items
                    </div>
                  )}
                  {collection.items.slice(0, 4).map((entry) =>
                    entry.item.imageUrl ? (
                      <div key={entry.item.id} className="relative overflow-hidden bg-muted">
                        <Image
                          src={entry.item.imageUrl}
                          alt={entry.item.title}
                          fill
                          className="object-cover"
                          sizes="120px"
                        />
                      </div>
                    ) : (
                      <div key={entry.item.id} className="bg-popover/6" />
                    ),
                  )}
                  {/* Fill remaining slots */}
                  {Array.from({ length: Math.max(0, 4 - collection.items.length) }).map((_, i) => (
                    <div key={i} className="bg-popover/6" />
                  ))}
                </div>

                <h2 className="font-semibold group-hover:text-primary transition-colors text-foreground">
                  {collection.name}
                </h2>
                {collection.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {collection.description}
                  </p>
                )}
                <p className="mt-2 text-xs text-muted-foreground">{collection._count.items} items</p>
              </GlassCard>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
