"use client"
import { useState, useEffect } from "react"
import { X, Download } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
  prompt(): Promise<void>
}

export function PWAInstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Don't show if already installed or previously dismissed in this session
    if (dismissed) return
    if (typeof window === "undefined") return

    // Check if already installed (standalone mode)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true

    if (isStandalone) return

    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch(() => {}) // silently ignore errors in dev
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
      // Show the custom prompt after a short delay
      setTimeout(() => setVisible(true), 3000)
    }

    const installedHandler = () => {
      setVisible(false)
      setPrompt(null)
      setDismissed(true)
    }

    window.addEventListener("beforeinstallprompt", handler)
    window.addEventListener("appinstalled", installedHandler)
    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
      window.removeEventListener("appinstalled", installedHandler)
    }
  }, [dismissed])

  async function handleInstall() {
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === "accepted") {
      setVisible(false)
      setPrompt(null)
    }
  }

  function handleDismiss() {
    setVisible(false)
    setDismissed(true)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 80, scale: 0.95 }}
          transition={{ type: "spring", damping: 20, stiffness: 260 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100vw-2rem)] max-w-sm"
          style={{
            background: "#141A22",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "1rem",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          }}
        >
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F5C518] flex items-center justify-center flex-shrink-0">
                <span className="text-black font-bold text-lg">C</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">Install Chronicle</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Add to your home screen for a faster, native-like experience.
                </p>
              </div>
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 p-1 rounded-lg hover:bg-white/8 text-muted-foreground transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleDismiss}
                className="flex-1 py-2 px-3 rounded-xl text-xs text-muted-foreground border border-white/10 hover:bg-white/5 transition-colors"
              >
                Not now
              </button>
              <button
                onClick={handleInstall}
                className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-[#F5C518] text-black hover:bg-[#F5C518]/90 transition-colors flex items-center justify-center gap-1.5"
              >
                <Download size={12} /> Install
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
