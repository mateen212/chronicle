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
            className={`rounded-xl p-2 transition ${view === "grid" ? "bg-primary/10 border border-primary/20 text-primary" : "bg-popover/6 text-muted-foreground hover:bg-popover/8 border border-border"}`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView("calendar")}
            className={`rounded-xl p-2 transition ${view === "calendar" ? "bg-primary/10 border border-primary/20 text-primary" : "bg-popover/6 text-muted-foreground hover:bg-popover/8 border border-border"}`}
          >
            <Calendar className="h-4 w-4" />
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState title="No items found" description="Try changing filters or adding new entries using Search & add." />
      ) : view === "calendar" ? (
        <div className="rounded-2xl p-4 bg-card border-border">
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
