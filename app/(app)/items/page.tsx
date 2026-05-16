import Link from "next/link";
import { Prisma } from "@prisma/client";

import { TagPill } from "@/components/common/tag-pill";
import { ItemsViewToggle } from "@/components/items/items-view-toggle";
import { requireDbUser } from "@/lib/auth";
import { ITEM_TYPES } from "@/lib/constants";
import { prisma } from "@/lib/prisma/client";

type ItemsPageProps = {
  searchParams: Promise<{ q?: string; type?: string; status?: string; tag?: string }>;
};

export default async function ItemsPage({ searchParams }: ItemsPageProps) {
  const user = await requireDbUser();
  const filters = await searchParams;

  // Fetch user tags for filter bar
  const userTags = await prisma.tag.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } });

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
    ...(filters.tag ? { tags: { some: { tag: { name: filters.tag } } } } : {}),
  };

  const items = await prisma.item.findMany({ where, orderBy: { updatedAt: "desc" }, take: 48 });

  return (
    <div className="space-y-4">
      <div className="sticky top-4 z-10 space-y-2 rounded-2xl border border-white/10 bg-slate-950/70 p-3 backdrop-blur-xl">
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
          <button type="submit" className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm transition hover:bg-white/15">Apply filters</button>
        </form>

        {/* Tag filter pills */}
        {userTags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {filters.tag && (
              <Link href="/items" className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-xs text-muted-foreground hover:bg-white/10">
                ✕ Clear tag
              </Link>
            )}
            {userTags.map((tag) => (
              <Link key={tag.id} href={`/items?tag=${encodeURIComponent(tag.name)}${filters.type ? `&type=${filters.type}` : ""}${filters.status ? `&status=${filters.status}` : ""}`}>
                <TagPill label={tag.name} color={tag.color} active={filters.tag === tag.name} />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Items grid/calendar */}
      <ItemsViewToggle items={items} />
    </div>
  );
}
