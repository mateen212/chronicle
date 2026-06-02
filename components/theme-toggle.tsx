"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <motion.button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex items-center gap-3 rounded-full border px-3 py-2 text-sm"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      aria-pressed={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      type="button"
      style={{
        background: "var(--card)",
        color: "var(--foreground)",
        borderColor: "var(--border)",
      }}
    >
      <span className="flex items-center gap-2">
        {isDark ? <Sun className="h-4 w-4 text-[#F5C518]" /> : <Moon className="h-4 w-4 text-[#F5C518]" />}
        <span className="text-sm font-medium">{isDark ? "🌙 Dark Mode" : "☀️ Light Mode"}</span>
      </span>
    </motion.button>
  );
}
