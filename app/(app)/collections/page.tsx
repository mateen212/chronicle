import { createCollectionAction } from "@/actions/collections";
import { GlassCard } from "@/components/common/glass-card";
import { requireDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma/client";

export default async function CollectionsPage() {
  const user = await requireDbUser();
  const collections = await prisma.collection.findMany({
    where: { userId: user.id },
    include: { items: { include: { item: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <GlassCard>
        <h1 className="text-2xl font-bold">Collections</h1>
        <p className="text-sm text-muted-foreground">Group your items into custom lists.</p>
        <form
          action={async (formData) => {
            "use server";
            await createCollectionAction({
              name: String(formData.get("name") ?? "").trim(),
              description: String(formData.get("description") ?? "").trim(),
            });
          }}
          className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]"
        >
          <input name="name" placeholder="Collection name" className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm" />
          <input name="description" placeholder="Description" className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm" />
          <button className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm">Create</button>
        </form>
      </GlassCard>

      <div className="grid gap-4 md:grid-cols-2">
        {collections.map((collection) => (
          <GlassCard key={collection.id}>
            <h2 className="text-lg font-semibold">{collection.name}</h2>
            {collection.description && <p className="text-sm text-muted-foreground">{collection.description}</p>}
            <p className="mt-2 text-xs text-cyan-200">{collection.items.length} items</p>
            <div className="mt-3 space-y-1 text-sm text-muted-foreground">
              {collection.items.slice(0, 5).map((entry) => (
                <p key={entry.itemId}>• {entry.item.title}</p>
              ))}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
