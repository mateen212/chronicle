"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import { X, Search, Loader2, Plus, Check } from "lucide-react"
import { createItem } from "@/actions/items"
import { ITEM_TYPES, TYPE_LABELS } from "@/lib/constants"
import type { SearchResult } from "@/types"

export function SearchModal({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState<string>("series")
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [added, setAdded] = useState<Set<string>>(new Set())
  const [adding, setAdding] = useState<string | null>(null)
  const [confirmFor, setConfirmFor] = useState<string | null>(null)
  const [confirmStatus, setConfirmStatus] = useState<string>("planned")
  const [confirmSeason, setConfirmSeason] = useState<number | undefined>(undefined)
  const [confirmEpisode, setConfirmEpisode] = useState<number | undefined>(undefined)
  const [confirmAllSeasons, setConfirmAllSeasons] = useState(false)
  const [confirmProgressTotal, setConfirmProgressTotal] = useState<number | undefined>(undefined)

  useEffect(() => {
    setResults([])
    setError("")
  }, [type])

  useEffect(() => {
    if (query.length < 2) { setResults([]); return }
    const t = setTimeout(async () => {
      setLoading(true)
      setError("")
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${type}`)
        const data: SearchResult[] | { error: string } = await res.json()
        if ("error" in data) setError(data.error)
        else setResults(data)
      } catch {
        setError("Search failed. Check your connection.")
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(t)
  }, [query, type])

  async function handleAdd(r: SearchResult) {
    // start confirmation flow
    setConfirmFor(r.externalId)
    setConfirmStatus("planned")
    setConfirmSeason(undefined)
    setConfirmEpisode(undefined)
    setConfirmAllSeasons(false)
    const estimated =
      type === "anime" ? (r.metadata.episodes as number | undefined) :
      type === "manga" ? (r.metadata.chapters as number | undefined) :
      type === "book" ? (r.metadata.pageCount as number | undefined) :
      type === "series" ? (
        (r.metadata.number_of_episodes as number | undefined) ??
        (r.metadata.totalEpisodes as number | undefined) ??
        (Array.isArray(r.metadata.seasons) ? (r.metadata.seasons as any[]).reduce((s, x) => s + (x.episode_count || 0), 0) : undefined)
      ) :
      undefined
    setConfirmProgressTotal(estimated)
  }

  async function handleConfirmAdd(r: SearchResult) {
    setAdding(r.externalId)
    try {
      const progressTotal = confirmProgressTotal ?? (
        type === "anime" ? (r.metadata.episodes as number | undefined) :
        type === "manga" ? (r.metadata.chapters as number | undefined) :
        type === "book" ? (r.metadata.pageCount as number | undefined) :
        undefined
      )

      const payload: any = {
        type,
        title: r.title,
        description: r.description,
        imageUrl: r.imageUrl,
        externalId: r.externalId,
        externalSource: r.externalSource,
        metadata: r.metadata,
        progressTotal,
      }

      // status and progress
      if (confirmStatus && confirmStatus !== "planned") {
        payload.status = confirmStatus
        if (confirmStatus === "watching") {
          payload.progressCurrent = confirmEpisode ?? 1
        }
        if (confirmStatus === "completed") {
          if (confirmAllSeasons && progressTotal !== undefined) {
            payload.progressCurrent = progressTotal
          } else if (progressTotal !== undefined) {
            // if user didn't select all seasons, try to mark episode if provided
            payload.progressCurrent = confirmEpisode ?? progressTotal
          }
        }
      }

      // record season/episode choices in metadata for future reference
      const extraMeta: any = {}
      if (confirmAllSeasons) extraMeta.allSeasonsWatched = true
      if (confirmSeason !== undefined) extraMeta.watchedSeason = confirmSeason
      if (confirmEpisode !== undefined) extraMeta.watchedEpisode = confirmEpisode
      if (Object.keys(extraMeta).length > 0) payload.metadata = { ...payload.metadata, ...extraMeta }
      if (progressTotal !== undefined) payload.progressTotal = progressTotal

      await createItem(payload)
      setAdded(prev => new Set([...prev, r.externalId]))
      setConfirmFor(null)
    } catch {
      alert("Failed to add item")
    } finally {
      setAdding(null)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-background border rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b flex items-center gap-3">
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className="text-sm border rounded-lg px-3 py-2 bg-background flex-shrink-0"
          >
            {ITEM_TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
          </select>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={`Search for a ${type}...`}
              className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-accent"><X size={18} /></button>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div>
          )}
          {error && <p className="text-sm text-destructive text-center py-8">{error}</p>}
          {!loading && !error && results.length === 0 && query.length >= 2 && (
            <p className="text-sm text-muted-foreground text-center py-8">No results for &ldquo;{query}&rdquo;</p>
          )}
          {!loading && query.length < 2 && (
            <p className="text-sm text-muted-foreground text-center py-8">Type at least 2 characters to search</p>
          )}
          <div className="space-y-2">
            {results.map(r => {
              const isAdded = added.has(r.externalId)
              const isAdding = adding === r.externalId
              return (
                <div key={r.externalId} className="flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/50 transition-colors">
                  <div className="w-10 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0 relative">
                    {r.imageUrl ? (
                      <Image src={r.imageUrl} alt={r.title} fill className="object-cover" />
                    ) : (
                      <span className="text-2xl flex items-center justify-center h-full">🎬</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{r.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{r.description}</p>
                  </div>
                  {confirmFor === r.externalId ? (
                    <div className="flex flex-col gap-2 p-2 bg-muted rounded-lg border">
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-muted-foreground">Add as</label>
                        <select value={confirmStatus} onChange={e => setConfirmStatus(e.target.value)} className="text-xs border rounded px-2 py-1 bg-background">
                          <option value="planned">Planned</option>
                          <option value="watching">Watching</option>
                          <option value="completed">Completed</option>
                        </select>
                        <div className="flex-1" />
                        <button onClick={() => handleConfirmAdd(r)} disabled={isAdding} className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded">{isAdding ? <Loader2 size={14} className="animate-spin" /> : "Add"}</button>
                        <button onClick={() => setConfirmFor(null)} className="text-xs bg-muted px-3 py-1 rounded">Cancel</button>
                      </div>
                      {(type === "series" || type === "anime") && (
                        <div className="flex items-center gap-2">
                          <input type="number" min={1} placeholder="Season" value={confirmSeason ?? ""} onChange={e => setConfirmSeason(e.target.value ? Number(e.target.value) : undefined)} className="w-20 text-xs border rounded px-2 py-1 bg-background" />
                          <input type="number" min={1} placeholder="Episode" value={confirmEpisode ?? ""} onChange={e => setConfirmEpisode(e.target.value ? Number(e.target.value) : undefined)} className="w-20 text-xs border rounded px-2 py-1 bg-background" />
                          <label className="text-xs flex items-center gap-2"><input type="checkbox" checked={confirmAllSeasons} onChange={e => setConfirmAllSeasons(e.target.checked)} />All seasons</label>
                          {confirmProgressTotal !== undefined && <span className="text-xs text-muted-foreground ml-2">Est. {confirmProgressTotal} episodes</span>}
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => !isAdded && handleAdd(r)}
                      disabled={isAdded || isAdding}
                      className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                        isAdded ? "bg-green-500 text-white" : "bg-primary text-primary-foreground hover:opacity-90"
                      } disabled:opacity-50`}
                    >
                      {isAdding ? <Loader2 size={14} className="animate-spin" /> : isAdded ? <Check size={14} /> : <Plus size={14} />}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
