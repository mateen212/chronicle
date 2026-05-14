"use client";

import { BookOpen, Clapperboard, FolderKanban, LayoutDashboard, UserCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/items", label: "Items", icon: Clapperboard },
  { href: "/collections", label: "Collections", icon: FolderKanban },
  { href: "/profile", label: "Profile", icon: UserCircle2 },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 84 : 260 }}
      transition={{ duration: 0.3 }}
      className="sticky top-4 hidden h-[calc(100vh-2rem)] flex-col rounded-3xl border border-white/10 bg-black/25 p-4 backdrop-blur-xl lg:flex"
    >
      <button
        className="mb-6 rounded-full border border-white/20 px-3 py-2 text-left text-sm font-medium"
        onClick={() => setCollapsed((prev) => !prev)}
      >
        {collapsed ? "→" : "Collapse"}
      </button>
      <div className="mb-8 flex items-center gap-2 px-2">
        <BookOpen className="h-5 w-5 text-cyan-300" />
        {!collapsed && <span className="text-lg font-semibold tracking-tight">Chronicle</span>}
      </div>
      <nav className="space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition hover:bg-white/10",
                active && "bg-gradient-to-r from-violet-500/35 to-cyan-500/25",
              )}
            >
              <Icon className="h-4 w-4" />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </nav>
    </motion.aside>
  );
}
