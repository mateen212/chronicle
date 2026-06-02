"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from "date-fns";
import { type Item } from "@prisma/client";
import Link from "next/link";

interface CalendarViewProps {
  items: Item[];
}

const STATUS_COLORS: Record<string, string> = {
  completed: "#10b981",
  watching: "#3b82f6",
  reading: "#8b5cf6",
  planned: "#f59e0b",
  paused: "#6b7280",
  dropped: "#ef4444",
};

export function CalendarView({ items }: CalendarViewProps) {
  const [month, setMonth] = useState(new Date());

  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const days = eachDayOfInterval({ start, end });

  // Pad the start with empty cells (Mon-based)
  const startDow = (start.getDay() + 6) % 7; // 0=Mon
  const padded = Array(startDow).fill(null).concat(days);

  // Map items by completed/updated date
  function itemsOnDay(day: Date) {
    return items.filter((item) => {
      const d = item.completedAt ?? item.updatedAt;
      return isSameDay(d, day);
    });
  }

  return (
    <div className="space-y-3">
      {/* Month nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setMonth((m) => subMonths(m, 1))}
          className="rounded-xl border border-border p-1.5 hover:bg-popover/8 transition"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold">{format(month, "MMMM yyyy")}</span>
        <button
          onClick={() => setMonth((m) => addMonths(m, 1))}
          className="rounded-xl border border-border p-1.5 hover:bg-popover/8 transition"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 text-center text-xs uppercase tracking-wider text-muted-foreground">
        {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <AnimatePresence mode="wait">
        <motion.div
          key={format(month, "yyyy-MM")}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-7 gap-1"
        >
          {padded.map((day, i) => {
            if (!day) return <div key={`pad-${i}`} />;
            const dayItems = itemsOnDay(day);
            const isToday = isSameDay(day, new Date());
            return (
              <div
                key={day.toISOString()}
                className={`min-h-[3.5rem] rounded-xl border p-1 ${
                  isToday ? "border-primary/50 bg-primary/10" : "border-border bg-popover/6"
                }`}
              >
                <p className={`text-xs font-medium ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                  {format(day, "d")}
                </p>
                <div className="mt-0.5 flex flex-wrap gap-0.5">
                  {dayItems.slice(0, 3).map((item) => (
                    <Link key={item.id} href={`/items/${item.id}`} title={item.title}>
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ backgroundColor: STATUS_COLORS[item.status] ?? "#7c3aed" }}
                      />
                    </Link>
                  ))}
                  {dayItems.length > 3 && (
                    <span className="text-[10px] text-muted-foreground">+{dayItems.length - 3}</span>
                  )}
                </div>
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 pt-1">
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <span key={status} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground capitalize">
            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
            {status}
          </span>
        ))}
      </div>
    </div>
  );
}
