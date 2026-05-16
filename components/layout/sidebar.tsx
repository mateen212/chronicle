"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, List, FolderOpen, User, BookOpen, BarChart2, Compass, Upload } from "lucide-react"
import { cn } from "@/lib/utils"

const nav = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Library", icon: BookOpen, href: "/library" },
  { label: "Items", icon: List, href: "/items" },
  { label: "Discover", icon: Compass, href: "/discover" },
  { label: "Analytics", icon: BarChart2, href: "/analytics" },
  { label: "Collections", icon: FolderOpen, href: "/collections" },
  { label: "Import", icon: Upload, href: "/import" },
  { label: "Profile", icon: User, href: "/profile" },
]

export function Sidebar({ onNav }: { onNav?: () => void }) {
  const path = usePathname()
  return (
    <div className="w-60 h-full bg-card border-r flex flex-col">
      <div className="h-14 flex items-center px-5 border-b">
        <span className="text-lg font-bold">📖 Chronicle</span>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {nav.map(({ label, icon: Icon, href }) => (
          <Link key={href} href={href} onClick={onNav}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              path === href || path.startsWith(href + "/")
                ? "bg-primary text-primary-foreground font-medium"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}>
            <Icon size={18} />{label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
