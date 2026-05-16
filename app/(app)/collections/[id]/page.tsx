import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { removeItemFromCollectionAction } from "@/actions/collections";
import { AnimatedSection } from "@/components/common/animated-section";
import { GlassCard } from "@/components/common/glass-card";
import { StatusBadge } from "@/components/common/status-badge";
import { requireDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma/client";

type Props = { params: Promise<{ id: string }> };

export default async function CollectionDetailPage({ params }: Props) {
  const user = await requireDbUser();
  const { id } = await params;

  const collection = await prisma.collection.findFirst({
    where: { id, userId: user.id },
    include: {
      items: {
        include: { item: true },
        orderBy: { item: { updatedAt: "desc" } },
      },
    },
  });

  if (!collection) notFound();

  return (
    <div className="space-y-6">
      <AnimatedSection className="rounded-3xl border border-white/10 bg-gradient-to-r from-violet-500/20 via-indigo-500/10 to-cyan-500/20 p-6 backdrop-blur-xl">
        <Link href="/collections" className="text-xs text-cyan-300 hover:underline">
          ← Collections
        </Link>
        <h1 className="mt-2 text-2xl font-bold">{collection.name}</h1>
        {collection.description && (
          <p className="mt-1 text-sm text-muted-foreground">{collection.description}</p>
        )}
        <p className="mt-2 text-xs text-cyan-200/80">{collection.items.length} items</p>
      </AnimatedSection>

      {collection.items.length === 0 ? (
        <GlassCard className="text-center text-sm text-muted-foreground">
          This collection has no items yet. Add items from their detail page.
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {collection.items.map(({ item }) => (
            <GlassCard key={item.id} className="flex items-center gap-4">
              {item.imageUrl && (
                <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg">
                  <Image src={item.imageUrl} alt={item.title} fill className="object-cover" sizes="48px" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <Link href={`/items/${item.id}`} className="font-medium hover:underline">
                  {item.title}
                </Link>
                <p className="text-xs text-muted-foreground capitalize">{item.type}</p>
              </div>
              <StatusBadge status={item.status} />
              <form
                action={async () => {
                  "use server";
                  await removeItemFromCollectionAction(collection.id, item.id);
                }}
              >
                <button
                  type="submit"
                  className="rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-1 text-xs text-red-400 hover:bg-red-500/20"
                >
                  Remove
                </button>
              </form>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
