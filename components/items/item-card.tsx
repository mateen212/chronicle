"use client"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Plus, Star, Tv, Film, BookOpen, Gamepad2, Code } from "lucide-react"
import { cn } from "@/lib/utils"

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  planned:   { bg: "bg-popover/6",   text: "text-muted-foreground",   label: "Want to Watch" },
  watching:  { bg: "bg-popover/6",   text: "text-muted-foreground",   label: "Watching" },
  reading:   { bg: "bg-popover/6",   text: "text-muted-foreground",   label: "Reading" },
  completed: { bg: "bg-popover/6",   text: "text-muted-foreground",   label: "Completed" },
  paused:    { bg: "bg-popover/6",   text: "text-muted-foreground",   label: "On Hold" },
  dropped:   { bg: "bg-popover/6",   text: "text-muted-foreground",   label: "Dropped" },
}

const TYPE_ACCENT: Record<string, string> = {}

const TYPE_ICON: Record<string, React.ReactNode> = {
  movie: <Film size={20} />, series: <Tv size={20} />, anime: <Tv size={20} />,
  manga: <BookOpen size={20} />, book: <BookOpen size={20} />,
  game: <Gamepad2 size={20} />, project: <Code size={20} />, course: <BookOpen size={20} />,
}

import { updateItemProgress } from "@/actions/items"

interface Item {
  id: string
  title: string
  type: string
  status: string
  imageUrl?: string | null
  progressCurrent: number
  progressTotal?: number | null
  currentSeason?: number | null
  currentEpisode?: number | null
  rating?: number | null
  description?: string | null
}

export function ItemCard({ item }: { item: Item }) {
  const [progress, setProgress] = useState(item.progressCurrent)
  const [loading, setLoading] = useState(false)

  const progressPct = item.progressTotal ? Math.min(100, Math.round((progress / item.progressTotal) * 100)) : 0
  const isActive = item.status === "watching" || item.status === "reading"
  const isTV = item.type === "series" || item.type === "anime"
  const statusStyle = STATUS_STYLES[item.status] ?? STATUS_STYLES.planned
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
    } catch { setProgress(progress) }
    finally { setLoading(false) }
  }

  return (
    <div className="group relative rounded-2xl overflow-hidden card-hover bg-card border-border">
      <Link href={`/items/${item.id}`}>
        {/* Poster */}
        <div className="aspect-[2/3] relative overflow-hidden">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 200px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-popover/6">
              <span className="text-primary">{TYPE_ICON[item.type]}</span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-popover/80 via-transparent to-transparent" />

          {/* Status badge */}
          <div className={cn("absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm", statusStyle.bg, statusStyle.text)}>
            {statusStyle.label}
          </div>

          {/* Rating */}
          {item.rating && (
            <div className="absolute top-2 right-2 flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-popover/60 text-primary">
              <Star size={9} fill="currentColor" />{item.rating}
            </div>
          )}

          {/* Progress pill at bottom of poster */}
          {item.progressTotal && progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0">
              <div className="h-1 w-full bg-popover/40">
                <div className="h-full transition-all duration-500 bg-primary" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-3">
        <Link href={`/items/${item.id}`}>
          <p className="text-sm font-semibold line-clamp-1 hover:text-primary transition-colors">{item.title}</p>
        </Link>

        <div className="flex items-center justify-between mt-1.5 gap-2">
          <div className="min-w-0 flex-1">
            {item.progressTotal ? (
              <p className="text-xs text-muted-foreground">
                {progress}/{item.progressTotal} {unit}
                {progressPct > 0 && <span className="ml-1 text-primary/70">{progressPct}%</span>}
              </p>
            ) : isTV && item.currentSeason ? (
              <p className="text-xs text-muted-foreground">
                S{item.currentSeason}{item.currentEpisode ? `E${item.currentEpisode}` : ""}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground capitalize">{item.type}</p>
            )}
          </div>

          {/* +1 quick action */}
          {isActive && (
            <button
              onClick={increment}
              disabled={loading}
              className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-40 bg-primary/10 border border-primary/30 text-primary"
              title={`Log next ${unit}`}
            >
              <Plus size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
