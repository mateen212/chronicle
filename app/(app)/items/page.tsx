import Link from "next/link";
import { Prisma } from "@prisma/client";
import { Film, Tv, BookOpen, Gamepad2, Code, Filter } from "lucide-react";

import { TagPill } from "@/components/common/tag-pill";
import { ItemsViewToggle } from "@/components/items/items-view-toggle";
import { requireDbUser } from "@/lib/auth";
import { ITEM_TYPES } from "@/lib/constants";
import { prisma } from "@/lib/prisma/client";

type ItemsPageProps = {
  searchParams: Promise<{ q?: string; type?: string; status?: string; tag?: string; sort?: string }>;
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  movie: <Film size={12} />,
  series: <Tv size={12} />,
  anime: <Tv size={12} />,
  manga: <BookOpen size={12} />,
  book: <BookOpen size={12} />,
  game: <Gamepad2 size={12} />,
  project: <Code size={12} />,
  course: <BookOpen size={12} />,
};

const STATUS_OPTIONS = [
  { value: "planned", label: "Want to Watch" },
  { value: "watching", label: "Watching" },
  { value: "completed", label: "Completed" },
  { value: "paused", label: "On Hold" },
  { value: "dropped", label: "Dropped" },
];

export default async function ItemsPage({ searchParams }: ItemsPageProps) {
  const user = await requireDbUser();
  const filters = await searchParams;

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

  const sortMap: Record<string, Prisma.ItemOrderByWithRelationInput> = {
    recent: { updatedAt: "desc" },
    alpha: { title: "asc" },
    rating: { rating: "desc" },
    progress: { progressCurrent: "desc" },
    added: { createdAt: "desc" },
  };
  const orderBy = sortMap[filters.sort ?? "recent"] ?? { updatedAt: "desc" };

  const items = await prisma.item.findMany({ where, orderBy, take: 96 });

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-7xl mx-auto">
      {/* Filter bar */}
      <div
        className="rounded-2xl p-4 space-y-3"
        style={{ background: "oklch(0.14 0.018 255 / 90%)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <form className="grid gap-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
          <div className="relative">
            <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              name="q"
              defaultValue={filters.q}
              placeholder="Search library…"
              className="w-full pl-8 pr-3 py-2 text-sm rounded-xl bg-black/30 border border-white/10 focus:outline-none focus:border-[#F5C518]/40 placeholder:text-muted-foreground/50"
            />
          </div>

          {/* Type filter */}
          <select name="type" defaultValue={filters.type ?? ""} className="text-sm bg-black/30 border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-[#F5C518]/40">
            <option value="">All types</option>
            {ITEM_TYPES.map((t) => (
              <option key={t} value={t} className="bg-[#141A22] capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>

          {/* Status filter */}
          <select name="status" defaultValue={filters.status ?? ""} className="text-sm bg-black/30 border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-[#F5C518]/40">
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value} className="bg-[#141A22]">{s.label}</option>
            ))}
          </select>

          {/* Sort */}
          <select name="sort" defaultValue={filters.sort ?? "recent"} className="text-sm bg-black/30 border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-[#F5C518]/40">
            <option value="recent" className="bg-[#141A22]">Recently Updated</option>
            <option value="added" className="bg-[#141A22]">Recently Added</option>
            <option value="alpha" className="bg-[#141A22]">Alphabetical</option>
            <option value="rating" className="bg-[#141A22]">Highest Rated</option>
            <option value="progress" className="bg-[#141A22]">Most Progress</option>
          </select>

          <button type="submit" className="py-2 px-4 rounded-xl text-sm font-medium bg-[#F5C518] text-black hover:bg-[#F5C518]/90 transition-colors">
            Apply
          </button>
        </form>

        {/* Type quick-filters */}
        <div className="flex flex-wrap gap-2">
          {ITEM_TYPES.map((t) => {
            const active = filters.type === t;
            return (
              <Link
                key={t}
                href={`/items?${filters.q ? `q=${filters.q}&` : ""}type=${t}${filters.status ? `&status=${filters.status}` : ""}${filters.sort ? `&sort=${filters.sort}` : ""}`}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  active
                    ? "bg-[#F5C518]/15 text-[#F5C518] border border-[#F5C518]/30"
                    : "bg-white/5 text-muted-foreground hover:bg-white/10 border border-white/8"
                }`}
              >
                {TYPE_ICONS[t]}
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Link>
            );
          })}
          {filters.type && (
            <Link
              href={`/items?${filters.q ? `q=${filters.q}&` : ""}${filters.status ? `status=${filters.status}&` : ""}${filters.sort ? `sort=${filters.sort}` : ""}`}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-muted-foreground border border-white/8 hover:bg-white/5"
            >
              ✕ Clear type
            </Link>
          )}
        </div>

        {/* Tag filters */}
        {userTags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {filters.tag && (
              <Link href="/items" className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-muted-foreground hover:bg-white/10">
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

      <ItemsViewToggle items={items} />
    </div>
  );
}
