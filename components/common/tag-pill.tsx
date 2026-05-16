"use client";

import { X } from "lucide-react";
import { motion } from "framer-motion";

interface TagPillProps {
  label: string;
  color?: string | null;
  onRemove?: () => void;
  onClick?: () => void;
  active?: boolean;
}

const DEFAULT_COLORS = [
  "#7c3aed", "#0891b2", "#059669", "#d97706", "#dc2626",
  "#7c3aed", "#2563eb", "#db2777",
];

function stringToColor(str: string): string {
  let hash = 0;
  for (const ch of str) hash = (hash << 5) - hash + ch.charCodeAt(0);
  return DEFAULT_COLORS[Math.abs(hash) % DEFAULT_COLORS.length]!;
}

export function TagPill({ label, color, onRemove, onClick, active }: TagPillProps) {
  const bg = color ?? stringToColor(label);

  return (
    <motion.span
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition ${
        active ? "ring-2 ring-white/40" : ""
      }`}
      style={{ backgroundColor: `${bg}30`, color: bg, border: `1px solid ${bg}50` }}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: bg }}
      />
      {label}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 rounded-full opacity-60 hover:opacity-100"
          aria-label={`Remove ${label}`}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </motion.span>
  );
}
