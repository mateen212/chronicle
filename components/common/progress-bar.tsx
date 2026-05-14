"use client";

import { motion } from "framer-motion";

type ProgressBarProps = {
  current: number;
  total?: number | null;
};

export function ProgressBar({ current, total }: ProgressBarProps) {
  const safeTotal = total && total > 0 ? total : undefined;
  const percentage = safeTotal ? Math.min(100, Math.round((current / safeTotal) * 100)) : 0;

  return (
    <div className="space-y-2">
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-violet-400 to-cyan-400"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
      <p className="text-xs text-muted-foreground">{safeTotal ? `${current} / ${safeTotal}` : `${current}`}</p>
    </div>
  );
}
