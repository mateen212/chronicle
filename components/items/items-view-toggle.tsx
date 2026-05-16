"use client";

import { useState } from "react";
import { LayoutGrid, Calendar } from "lucide-react";
import { type Item } from "@prisma/client";

import { AnimatedSection } from "@/components/common/animated-section";
import { ItemCard } from "@/components/items/item-card";
import { CalendarView } from "@/components/items/calendar-view";
import { EmptyState } from "@/components/common/empty-state";

interface ItemsViewToggleProps {
  items: Item[];
}

export function ItemsViewToggle({ items }: ItemsViewToggleProps) {
  const [view, setView] = useState<"grid" | "calendar">("grid");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{items.length} items</p>
        <div className="flex gap-2">
          <button
            onClick={() => setView("grid")}
            className={`rounded-xl border p-2 transition ${view === "grid" ? "border-violet-400/50 bg-violet-500/20 text-violet-300" : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10"}`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView("calendar")}
            className={`rounded-xl border p-2 transition ${view === "calendar" ? "border-cyan-400/50 bg-cyan-500/20 text-cyan-300" : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10"}`}
          >
            <Calendar className="h-4 w-4" />
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState title="No items found" description="Try changing filters or adding new entries using Search & add." />
      ) : view === "calendar" ? (
        <div className="rounded-2xl border border-white/10 bg-white/3 p-4">
          <CalendarView items={items} />
        </div>
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
