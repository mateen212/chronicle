"use client"
import Image from "next/image"
import { useState } from "react"
import { Plus, Minus, Trash2, ArrowLeft, Star, Tv, Film } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  updateItemProgress,
  updateItemStatus,
  updateItemRating,
  updateItemNotes,
  deleteItem,
} from "@/actions/items"
import { STATUS_LABELS, ITEM_STATUSES } from "@/lib/constants"

const STATUS_STYLES: Record<string, string> = {
  planned:   "bg-slate-800 text-slate-300 border-slate-700",
  watching:  "bg-blue-900/60 text-blue-300 border-blue-700/40",
  reading:   "bg-purple-900/60 text-purple-300 border-purple-700/40",
  completed: "bg-emerald-900/60 text-emerald-300 border-emerald-700/40",
  paused:    "bg-yellow-900/60 text-yellow-300 border-yellow-700/40",
  dropped:   "bg-red-900/60 text-red-300 border-red-700/40",
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ItemDetailClient({ item }: { item: any }) {
  const router = useRouter()
  const [progress, setProgress] = useState<number>(item.progressCurrent)
  const [rating, setRating] = useState<number>(item.rating ?? 0)
  const [notes, setNotes] = useState<string>(item.notes ?? "")
  const [hoverRating, setHoverRating] = useState(0)
  const [savingNotes, setSavingNotes] = useState(false)

  const isTV = item.type === "series" || item.type === "anime"
  const isMovie = item.type === "movie"
  const pct = item.progressTotal ? Math.min(100, Math.round((progress / item.progressTotal) * 100)) : 0
  const remaining = item.progressTotal ? Math.max(0, item.progressTotal - progress) : null

  async function handleProgress(delta: number) {
    const next = Math.max(0, progress + delta)
    setProgress(next)
    await updateItemProgress(item.id, next, item.progressTotal ?? undefined)
  }

  async function handleRating(n: number) {
    const newRating = n === rating ? 0 : n
    setRating(newRating)
    await updateItemRating(item.id, newRating)
  }

  async function handleSaveNotes() {
    setSavingNotes(true)
    await updateItemNotes(item.id, notes)
    setSavingNotes(false)
  }

  async function handleDelete() {
    if (!confirm("Delete this item from your library?")) return
    await deleteItem(item.id)
    router.push("/items")
  }

  // Cast from metadata
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const meta = item.metadata?.data as Record<string, any> | undefined

  return (
    <div className="min-h-screen">
      {/* Backdrop */}
      {item.imageUrl && (
        <div className="relative h-56 sm:h-72 overflow-hidden">
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            className="object-cover object-top"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-popover/50 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/60 to-transparent" />
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Back */}
        <div className={item.imageUrl ? "-mt-8 relative z-10" : "pt-6"}>
          <Link href="/items" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft size={14} /> Back to library
          </Link>
        </div>

        {/* Hero */}
        <div className="flex gap-5 mb-8">
          {item.imageUrl && (
            <div className="flex-shrink-0 w-28 sm:w-36 rounded-xl overflow-hidden relative shadow-2xl" style={{ aspectRatio: "2/3" }}>
              <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
            </div>
          )}
          <div className="flex-1 pt-2">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-medium capitalize text-muted-foreground flex items-center gap-1.5">
                {isMovie ? <Film size={12} /> : isTV ? <Tv size={12} /> : null}
                {item.type}
              </span>
              {meta?.releasedAt && (
                <span className="text-xs text-muted-foreground">
                  {new Date(meta.releasedAt as string).getFullYear()}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold leading-tight mb-3">{item.title}</h1>

            {/* Status badge + selector */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <select
                defaultValue={item.status}
                onChange={(e) => updateItemStatus(item.id, e.target.value)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors cursor-pointer bg-transparent focus:outline-none ${STATUS_STYLES[item.status] ?? STATUS_STYLES.planned}`}
              >
                {ITEM_STATUSES.map((s) => (
                  <option key={s} value={s} className="bg-popover/6">{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>

            {/* Rating stars (inline) */}
            <div className="flex items-center gap-1">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onMouseEnter={() => setHoverRating(n)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => handleRating(n)}
                >
                  <Star
                    size={16}
                    className={`transition-colors ${n <= (hoverRating || rating) ? "fill-primary text-primary" : "text-muted-foreground/30"}`}
                  />
                </button>
              ))}
              {rating > 0 && <span className="text-sm font-semibold text-primary ml-1">{rating}/10</span>}
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 pb-10">

          {/* Progress */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-5"
            className="rounded-2xl p-5 bg-card border-border"
          >
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
              {isTV ? "Episode Progress" : "Progress"}
            </h2>

            {/* Season/episode display */}
            {isTV && item.currentSeason && (
              <p className="text-xs text-muted-foreground mb-3">
                Currently at: Season {item.currentSeason}{item.currentEpisode ? ` · Episode ${item.currentEpisode}` : ""}
              </p>
            )}

            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => handleProgress(-1)}
                className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-popover/6 transition-colors"
              >
                <Minus size={16} />
              </button>
              <div className="text-center">
                <span className="text-3xl font-bold">{progress}</span>
                {item.progressTotal && (
                  <span className="text-muted-foreground text-lg"> / {item.progressTotal}</span>
                )}
              </div>
              <button
                onClick={() => handleProgress(1)}
                className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>

            {item.progressTotal && (
              <>
                <div className="h-2 rounded-full overflow-hidden mb-2 bg-popover/20">
                  <div
                    className="h-full rounded-full transition-all duration-500 bg-primary"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{pct}% complete</span>
                  {remaining !== null && remaining > 0 && (
                    <span>{remaining} remaining</span>
                  )}
                </div>
              </>
            )}
          </motion.div>

          {/* Notes */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl p-5 bg-card border-border"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold">Notes & Review</h2>
              {savingNotes && <span className="text-xs text-muted-foreground">Saving…</span>}
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleSaveNotes}
              placeholder="What did you think? Any thoughts…"
              className="w-full text-sm bg-input border border-border rounded-xl p-3 min-h-32 resize-none focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/40"
            />
          </motion.div>

          {/* Description */}
          {item.description && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="rounded-2xl p-5 sm:col-span-2 bg-card border-border"
            >
              <h2 className="text-sm font-bold mb-3">About</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </motion.div>
          )}

          {/* Activity log */}
          {item.activities?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl p-5 sm:col-span-2"
              style={{ background: "oklch(0.14 0.018 255 / 90%)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <h2 className="text-sm font-bold mb-3">Activity History</h2>
              <div className="space-y-2">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {item.activities.map((a: any) => (
                  <div key={a.id} className="flex justify-between text-xs">
                    <span className="text-muted-foreground capitalize">{a.action.replace(/_/g, " ")}</span>
                    <span className="text-muted-foreground/60">{new Date(a.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        <button
          onClick={handleDelete}
          className="mb-10 flex items-center gap-1.5 text-xs text-muted-foreground/50 hover:text-destructive transition-colors"
        >
          <Trash2 size={12} /> Remove from library
        </button>
      </div>
    </div>
  )
}
