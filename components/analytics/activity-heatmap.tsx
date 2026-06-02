"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { addDays, format, startOfWeek, eachWeekOfInterval, subDays } from "date-fns";

type HeatmapEntry = { date: string; count: number };

const COLOR_SCALE = [
  "bg-popover/6",
  "bg-primary/20",
  "bg-primary/40",
  "bg-primary/60",
  "bg-primary",
];

function getColor(count: number): string {
  if (count === 0) return COLOR_SCALE[0];
  if (count === 1) return COLOR_SCALE[1];
  if (count <= 3) return COLOR_SCALE[2];
  if (count <= 6) return COLOR_SCALE[3];
  return COLOR_SCALE[4];
}

export function ActivityHeatmap({ data }: { data: HeatmapEntry[] }) {
  const byDate = useMemo(() => {
    const map: Record<string, number> = {};
    data.forEach((d) => (map[d.date] = d.count));
    return map;
  }, [data]);

  const now = new Date();
  const start = subDays(now, 363);
  const weeks = eachWeekOfInterval({ start: startOfWeek(start), end: now });

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1">
        {weeks.map((weekStart, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {Array.from({ length: 7 }, (_, di) => {
              const date = addDays(weekStart, di);
              const dateStr = format(date, "yyyy-MM-dd");
              const count = byDate[dateStr] ?? 0;
              return (
                <motion.div
                  key={di}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: wi * 0.002 }}
                  title={`${dateStr}: ${count} activities`}
                  className={`h-3 w-3 rounded-sm ${getColor(count)}`}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
        <span>Less</span>
        {COLOR_SCALE.map((c, i) => (
          <div key={i} className={`h-3 w-3 rounded-sm ${c}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
