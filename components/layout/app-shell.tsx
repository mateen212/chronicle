"use client"
import { useState } from "react"
import { Sidebar } from "./sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserButton } from "@clerk/nextjs"
import { Menu } from "lucide-react"
import { SearchModal } from "@/components/items/search-modal"

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar desktop */}
      <div className="hidden lg:flex"><Sidebar /></div>
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />}
      <div className={`fixed inset-y-0 left-0 z-50 lg:hidden transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <Sidebar onNav={() => setOpen(false)} />
      </div>
      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b flex items-center justify-between px-4 flex-shrink-0">
          <button onClick={() => setOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-accent">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 text-sm text-muted-foreground border rounded-lg px-3 py-1.5 hover:bg-accent transition-colors"
            >
              🔍 Search &amp; add...
            </button>
            <ThemeToggle />
            <UserButton />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
    </div>
  )
}
