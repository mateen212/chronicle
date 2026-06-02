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
    <div
      className="w-60 h-full flex flex-col"
      style={{
        background: "oklch(0.12 0.018 255)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-5 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#F5C518] flex items-center justify-center flex-shrink-0">
            <BookOpen size={14} className="text-black" />
          </div>
          <span className="text-base font-bold tracking-tight">Chronicle</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {nav.map(({ label, icon: Icon, href }) => {
          const active = path === href || path.startsWith(href + "/")
          return (
            <Link
              key={href}
              href={href}
              onClick={onNav}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150",
                active
                  ? "bg-[#F5C518]/12 text-[#F5C518] font-medium"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
              )}
            >
              <Icon size={17} className={active ? "text-[#F5C518]" : ""} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom accent */}
      <div className="p-4 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <p className="text-xs text-muted-foreground/50 text-center">Chronicle v1.0</p>
      </div>
    </div>
  )
}
