"use client"
import { useState } from "react"
import { Sidebar } from "./sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserButton } from "@clerk/nextjs"
import { Menu, Search } from "lucide-react"
import { SearchModal } from "@/components/items/search-modal"
import { motion, AnimatePresence } from "framer-motion"

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <div className="flex h-screen" style={{ background: "oklch(0.097 0.015 252)" }}>
      {/* Sidebar desktop */}
      <div className="hidden lg:flex flex-shrink-0"><Sidebar /></div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <motion.div
        className="fixed inset-y-0 left-0 z-50 lg:hidden"
        initial={false}
        animate={{ x: open ? 0 : "-100%" }}
        transition={{ type: "tween", duration: 0.22 }}
      >
        <Sidebar onNav={() => setOpen(false)} />
      </motion.div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header
          className="h-14 flex items-center justify-between px-4 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "oklch(0.12 0.018 255 / 80%)", backdropFilter: "blur(12px)" }}
        >
          <button
            onClick={() => setOpen(true)}
            className="lg:hidden p-2 rounded-xl hover:bg-white/8 text-muted-foreground transition-colors"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2.5 text-sm text-muted-foreground rounded-xl px-3.5 py-2 transition-all hover:text-foreground group"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <Search size={14} className="group-hover:text-[#F5C518] transition-colors" />
              <span className="hidden sm:inline">Search &amp; add</span>
              <kbd className="hidden sm:inline text-xs text-muted-foreground/50 font-mono">⌘K</kbd>
            </button>
            <ThemeToggle />
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                },
              }}
            />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      <AnimatePresence>
        {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
      </AnimatePresence>
    </div>
  )
}
