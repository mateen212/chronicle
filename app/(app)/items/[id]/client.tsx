"use client"
import Image from "next/image"
import { useState } from "react"
import { Plus, Minus, Trash2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  updateItemProgress,
  updateItemStatus,
  updateItemRating,
  updateItemNotes,
  deleteItem,
} from "@/actions/items"
import { STATUS_LABELS, ITEM_STATUSES } from "@/lib/constants"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ItemDetailClient({ item }: { item: any }) {
  const router = useRouter()
  const [progress, setProgress] = useState<number>(item.progressCurrent)
  const [notes, setNotes] = useState<string>(item.notes ?? "")

  async function handleProgress(delta: number) {
    const next = Math.max(0, progress + delta)
    setProgress(next)
    await updateItemProgress(item.id, next, item.progressTotal ?? undefined)
  }

  async function handleDelete() {
    if (!confirm("Delete this item?")) return
    await deleteItem(item.id)
    router.push("/items")
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Link href="/items" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft size={16} /> Back to items
      </Link>

      <div className="flex gap-6">
        {item.imageUrl && (
          <div className="flex-shrink-0 w-32 h-48 rounded-lg overflow-hidden relative">
            <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{item.title}</h1>
          <p className="text-muted-foreground mt-1 text-sm capitalize">{item.type}</p>
          {item.description && <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{item.description}</p>}

          {/* Status selector */}
          <select
            defaultValue={item.status}
            onChange={e => updateItemStatus(item.id, e.target.value)}
            className="mt-3 text-sm border rounded-lg px-3 py-1.5 bg-background"
          >
            {ITEM_STATUSES.map(s => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Progress controls */}
      <div className="mt-6 bg-card border rounded-xl p-4">
        <h2 className="text-sm font-medium mb-3">Progress</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleProgress(-1)}
            className="w-9 h-9 rounded-full border flex items-center justify-center hover:bg-accent"
          >
            <Minus size={16} />
          </button>
          <span className="text-2xl font-semibold">{progress}</span>
          {item.progressTotal && <span className="text-muted-foreground">/ {item.progressTotal}</span>}
          <button
            onClick={() => handleProgress(1)}
            className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90"
          >
            <Plus size={16} />
          </button>
        </div>
        {item.progressTotal && (
          <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${Math.min(100, (progress / item.progressTotal) * 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="mt-4 bg-card border rounded-xl p-4">
        <h2 className="text-sm font-medium mb-3">Rating</h2>
        <div className="flex gap-1 flex-wrap">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
            <button
              key={n}
              onClick={() => updateItemRating(item.id, n)}
              className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                item.rating && n <= item.rating
                  ? "bg-yellow-400 text-yellow-900"
                  : "bg-muted hover:bg-yellow-100"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="mt-4 bg-card border rounded-xl p-4">
        <h2 className="text-sm font-medium mb-3">Notes</h2>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          onBlur={() => updateItemNotes(item.id, notes)}
          placeholder="What did you think? Where did you leave off?"
          className="w-full text-sm bg-background border rounded-lg p-3 min-h-24 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Activity log */}
      {item.activities?.length > 0 && (
        <div className="mt-4 bg-card border rounded-xl p-4">
          <h2 className="text-sm font-medium mb-3">History</h2>
          <div className="space-y-2">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {item.activities.map((a: any) => (
              <div key={a.id} className="flex justify-between text-xs text-muted-foreground">
                <span>{a.action.replace(/_/g, " ")}</span>
                <span>{new Date(a.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleDelete}
        className="mt-6 flex items-center gap-2 text-sm text-destructive hover:underline"
      >
        <Trash2 size={14} /> Delete item
      </button>
    </div>
  )
}
