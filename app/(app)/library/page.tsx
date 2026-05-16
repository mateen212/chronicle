"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { LayoutGrid, Box } from "lucide-react";
import { type Item } from "@prisma/client";

import { AnimatedSection } from "@/components/common/animated-section";
import { EmptyState } from "@/components/common/empty-state";
import { ItemCard } from "@/components/items/item-card";

const PosterWall3D = dynamic(
  () => import("@/components/library/poster-wall-3d").then((m) => m.PosterWall3D),
  { ssr: false, loading: () => <div className="h-[600px] w-full animate-pulse rounded-2xl bg-white/5" /> },
);

export default function LibraryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [view, setView] = useState<"grid" | "3d">("grid");

  useEffect(() => {
    void fetch("/api/library").then((r) => r.json()).then((data) => setItems(data.items ?? []));
  }, []);

  return (
    <div className="space-y-6">
      <AnimatedSection className="flex items-start justify-between rounded-3xl border border-white/10 bg-gradient-to-r from-violet-500/20 via-indigo-500/10 to-cyan-500/20 p-6 backdrop-blur-xl">
        <div>
          <p className="text-xs uppercase tracking-widest text-cyan-200/80">Library</p>
          <h1 className="mt-2 text-3xl font-bold">Your complete library</h1>
          <p className="mt-1 text-sm text-muted-foreground">{items.length} items tracked</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView("grid")}
            className={`rounded-xl border p-2 transition ${view === "grid" ? "border-violet-400/50 bg-violet-500/20 text-violet-300" : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10"}`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView("3d")}
            className={`rounded-xl border p-2 transition ${view === "3d" ? "border-cyan-400/50 bg-cyan-500/20 text-cyan-300" : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10"}`}
          >
            <Box className="h-4 w-4" />
          </button>
        </div>
      </AnimatedSection>

      {items.length === 0 ? (
        <EmptyState title="Library is empty" description="Use Search & add to start building your library." />
      ) : view === "3d" ? (
        <PosterWall3D items={items} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item, i) => (
            <AnimatedSection key={item.id} delay={i * 0.02}>
              <ItemCard item={item} />
            </AnimatedSection>
          ))}
        </div>
      )}
    </div>
  );
}
