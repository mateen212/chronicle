"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Library, List, FolderOpen, User, BookOpen, BarChart2, Compass, Upload } from "lucide-react"
import { cn } from "@/lib/utils"

const nav = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Library", icon: Library, href: "/library" },
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
    <aside className="w-64 h-full flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="h-16 flex items-center px-5 flex-shrink-0 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <BookOpen size={16} className="text-primary-foreground" />
          </div>
          <div>
            <div className="text-sm font-semibold">Chronicle</div>
            <div className="text-[11px] text-sidebar-foreground/70">Media Tracker</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-2 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {nav.map(({ label, icon: Icon, href }) => {
            const active = path === href || path.startsWith(href + "/")
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onNav}
                  className={cn(
                    "flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-colors",
                    active
                      ? "bg-sidebar-primary/10 text-sidebar-primary-foreground font-medium ring-1 ring-sidebar-ring"
                      : "text-sidebar-foreground hover:bg-popover/6 hover:text-foreground"
                  )}
                >
                  <span className="flex items-center justify-center w-9 h-9 rounded-lg text-lg">
                    <Icon size={18} className={active ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/90"} />
                  </span>
                  <span className="text-sm">{label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 flex-shrink-0 border-t border-sidebar-border">
        <div className="flex items-center justify-between">
          <p className="text-xs text-sidebar-foreground/70">Chronicle v1.0</p>
        </div>
      </div>
    </aside>
  )
}
