"use client"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Plus, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { STATUS_COLORS, TYPE_COLORS } from "@/lib/constants"
import { updateItemProgress } from "@/actions/items"

interface Item {
  id: string
  title: string
  type: string
  status: string
  imageUrl?: string | null
  progressCurrent: number
  progressTotal?: number | null
  rating?: number | null
  description?: string | null
}

export function ItemCard({ item }: { item: Item }) {
  const [progress, setProgress] = useState(item.progressCurrent)
  const [loading, setLoading] = useState(false)
  const progressPct = item.progressTotal ? Math.round((progress / item.progressTotal) * 100) : 0
  const isActive = item.status === "watching" || item.status === "reading"
  const unit = item.type === "book" || item.type === "manga" ? "ch"
    : item.type === "game" ? "hr"
    : "ep"

  async function increment() {
    if (loading) return
    setLoading(true)
    const next = progress + 1
    setProgress(next)
    try {
      await updateItemProgress(item.id, next, item.progressTotal ?? undefined)
    } catch {
      setProgress(progress)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="group relative bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200">
      <Link href={`/items/${item.id}`}>
        <div className="aspect-[2/3] relative bg-muted">
          {item.imageUrl ? (
            <Image src={item.imageUrl} alt={item.title} fill className="object-cover" sizes="(max-width:768px) 50vw, 200px" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-4xl"
              style={{ background: (TYPE_COLORS[item.type] ?? "#6366f1") + "33" }}>
              {item.type === "movie" || item.type === "series" ? "🎬"
                : item.type === "anime" ? "⛩️"
                : item.type === "manga" ? "📖"
                : item.type === "game" ? "🎮"
                : item.type === "book" ? "📚"
                : "💻"}
            </div>
          )}
          {/* Status badge */}
          <span className={cn("absolute top-2 left-2 text-xs font-medium px-2 py-0.5 rounded-full", STATUS_COLORS[item.status] ?? "")}>
            {item.status}
          </span>
          {/* Rating */}
          {item.rating && (
            <span className="absolute top-2 right-2 text-xs font-medium px-2 py-0.5 rounded-full bg-black/60 text-yellow-400 flex items-center gap-0.5">
              <Star size={10} fill="currentColor" />{item.rating}
            </span>
          )}
        </div>
      </Link>

      <div className="p-3">
        <Link href={`/items/${item.id}`}>
          <p className="text-sm font-medium line-clamp-1 hover:underline">{item.title}</p>
        </Link>

        {/* Progress row */}
        <div className="flex items-center justify-between mt-2 gap-2">
          <div className="flex-1 min-w-0">
            {item.progressTotal ? (
              <>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>{progress}/{item.progressTotal} {unit}</span>
                  <span>{progressPct}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressPct}%`, background: TYPE_COLORS[item.type] ?? "#6366f1" }} />
                </div>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">{progress} {unit}</p>
            )}
          </div>

          {/* +1 button — the core UX */}
          {isActive && (
            <button
              onClick={increment}
              disabled={loading}
              className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:scale-110 active:scale-95 transition-transform disabled:opacity-50"
              title={`Mark next ${unit}`}
            >
              <Plus size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
