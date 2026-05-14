import { Prisma } from "@prisma/client";

import { EmptyState } from "@/components/common/empty-state";
import { ItemCard } from "@/components/items/item-card";
import { requireDbUser } from "@/lib/auth";
import { ITEM_TYPES } from "@/lib/constants";
import { prisma } from "@/lib/prisma/client";

type ItemsPageProps = {
  searchParams: Promise<{ q?: string; type?: string; status?: string }>;
};

export default async function ItemsPage({ searchParams }: ItemsPageProps) {
  const user = await requireDbUser();
  const filters = await searchParams;

  const where: Prisma.ItemWhereInput = {
    userId: user.id,
    ...(filters.q
      ? {
          OR: [
            { title: { contains: filters.q, mode: "insensitive" } },
            { description: { contains: filters.q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(filters.type && ITEM_TYPES.includes(filters.type as (typeof ITEM_TYPES)[number])
      ? { type: filters.type as Prisma.ItemWhereInput["type"] }
      : {}),
    ...(filters.status ? { status: filters.status as Prisma.ItemWhereInput["status"] } : {}),
  };

  const items = await prisma.item.findMany({ where, orderBy: { updatedAt: "desc" }, take: 48 });

  return (
    <div className="space-y-4">
      <div className="sticky top-4 z-10 rounded-2xl border border-white/10 bg-slate-950/70 p-3 backdrop-blur-xl">
        <form className="grid gap-2 sm:grid-cols-4">
          <input
            name="q"
            defaultValue={filters.q}
            placeholder="Search items"
            className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm"
          />
          <select name="type" defaultValue={filters.type} className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm capitalize">
            <option value="">All types</option>
            {ITEM_TYPES.map((type) => (
              <option key={type} value={type} className="bg-slate-900">
                {type}
              </option>
            ))}
          </select>
          <select name="status" defaultValue={filters.status} className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm capitalize">
            <option value="">All statuses</option>
            <option value="planned" className="bg-slate-900">planned</option>
            <option value="watching" className="bg-slate-900">watching</option>
            <option value="reading" className="bg-slate-900">reading</option>
            <option value="completed" className="bg-slate-900">completed</option>
            <option value="paused" className="bg-slate-900">paused</option>
            <option value="dropped" className="bg-slate-900">dropped</option>
          </select>
          <button className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm">Apply filters</button>
        </form>
      </div>

      {items.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <EmptyState title="No items found" description="Try changing filters or adding new entries using Search & add." />
      )}
    </div>
  );
}
