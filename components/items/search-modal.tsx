"use client"
import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { X, Search, Loader2, Check, ChevronRight, ChevronLeft, Tv, Film, Star, BookOpen, Gamepad2, Code } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { createItem } from "@/actions/items"
import { ITEM_TYPES, TYPE_LABELS } from "@/lib/constants"
import type { SearchResult } from "@/types"

interface TVDetails {
  totalSeasons: number
  totalEpisodes: number
  seasons: Array<{ seasonNumber: number; episodeCount: number; name: string }>
}

type ModalStep = "search" | "status" | "details" | "success"
type TVStatus = "want_to_watch" | "watching" | "completed_all" | "completed_season" | "completed_episode" | "on_hold" | "dropped"
type MovieStatus = "want_to_watch" | "watching" | "completed" | "on_hold" | "dropped"

const TV_STATUS_MAP: Record<TVStatus, string> = {
  want_to_watch: "planned", watching: "watching", completed_all: "completed",
  completed_season: "completed", completed_episode: "completed", on_hold: "paused", dropped: "dropped",
}
const MOVIE_STATUS_MAP: Record<MovieStatus, string> = {
  want_to_watch: "planned", watching: "watching", completed: "completed",
  on_hold: "paused", dropped: "dropped",
}
const TYPE_ICONS: Record<string, React.ReactNode> = {
  movie: <Film size={14} />, series: <Tv size={14} />, anime: <Tv size={14} />,
  manga: <BookOpen size={14} />, book: <BookOpen size={14} />,
  game: <Gamepad2 size={14} />, project: <Code size={14} />, course: <BookOpen size={14} />,
}

function calcWatchedEps(
  seasons: TVDetails["seasons"],
  status: TVStatus,
  selSeason: number,
  selEpisode: number,
  totalEpisodes: number,
) {
  if (status === "completed_all") return totalEpisodes
  const regular = seasons.filter((s) => s.seasonNumber > 0)
  if (status === "completed_season") {
    return regular.filter((s) => s.seasonNumber <= selSeason).reduce((a, s) => a + s.episodeCount, 0)
  }
  if (status === "completed_episode" || status === "watching") {
    const prev = regular.filter((s) => s.seasonNumber < selSeason).reduce((a, s) => a + s.episodeCount, 0)
    return prev + selEpisode
  }
  return 0
}

function StatusOption({ label, description, active, onClick }: {
  label: string; description?: string; active: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-150 ${
        active ? "border-[#F5C518] bg-[#F5C518]/10 text-foreground" : "border-border bg-card/40 hover:border-border/80 hover:bg-card/60 text-foreground/80"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        {active && <Check size={14} className="text-[#F5C518] flex-shrink-0" />}
      </div>
      {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
    </button>
  )
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
        <button key={n} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} onClick={() => onChange(n === value ? 0 : n)} className="transition-transform hover:scale-110">
          <Star size={18} className={`transition-colors ${n <= (hover || value) ? "fill-[#F5C518] text-[#F5C518]" : "text-muted-foreground/40"}`} />
        </button>
      ))}
    </div>
  )
}

export function SearchModal({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState("series")
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState<ModalStep>("search")
  const [selected, setSelected] = useState<SearchResult | null>(null)
  const [tvDetails, setTvDetails] = useState<TVDetails | null>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [tvStatus, setTvStatus] = useState<TVStatus>("want_to_watch")
  const [movieStatus, setMovieStatus] = useState<MovieStatus>("want_to_watch")
  const [selSeason, setSelSeason] = useState(1)
  const [selEpisode, setSelEpisode] = useState(1)
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState("")
  const [watchedDate, setWatchedDate] = useState("")
  const [adding, setAdding] = useState(false)
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())

  const isTV = type === "series" || type === "anime"
  const isMovie = type === "movie"

  useEffect(() => { setResults([]); setError("") }, [type])
  useEffect(() => {
    if (query.length < 2) { setResults([]); return }
    const t = setTimeout(async () => {
      setLoading(true); setError("")
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${type}`)
        const data: SearchResult[] | { error: string } = await res.json()
        if ("error" in data) setError(data.error)
        else setResults(data)
      } catch { setError("Search failed. Check your connection.") }
      finally { setLoading(false) }
    }, 300)
    return () => clearTimeout(t)
  }, [query, type])

  const handleSelect = useCallback(async (r: SearchResult) => {
    setSelected(r)
    setTvStatus("want_to_watch"); setMovieStatus("want_to_watch")
    setRating(0); setReview(""); setWatchedDate("")
    setSelSeason(1); setSelEpisode(1); setTvDetails(null)
    if (isTV && r.externalSource === "tmdb") {
      setLoadingDetails(true)
      try {
        const res = await fetch(`/api/tmdb/${r.externalId}?type=tv`)
        if (res.ok) { const d: TVDetails = await res.json(); setTvDetails(d) }
      } catch { /* ignore */ }
      finally { setLoadingDetails(false) }
    }
    setStep("status")
  }, [isTV])

  const needsDetailsStep = isMovie
    ? movieStatus === "completed"
    : ["watching", "completed_season", "completed_episode"].includes(tvStatus)

  const currentStatusLabel = isTV ? {
    want_to_watch: "Want to Watch", watching: "Currently Watching",
    completed_all: "Completed Entire Series", completed_season: "Completed Up to a Season",
    completed_episode: "Completed Up to an Episode", on_hold: "On Hold", dropped: "Dropped",
  }[tvStatus] : { want_to_watch: "Want to Watch", watching: "Watching", completed: "Completed", on_hold: "On Hold", dropped: "Dropped" }[movieStatus]

  async function handleAdd() {
    if (!selected) return
    setAdding(true)
    try {
      let prismaStatus: string
      let progressCurrent: number | undefined
      let progressTotal: number | undefined
      let currentSeasonVal: number | undefined
      let currentEpisodeVal: number | undefined

      const estimated = type === "anime" ? (selected.metadata.episodes as number | undefined)
        : type === "manga" ? (selected.metadata.chapters as number | undefined)
        : type === "book" ? (selected.metadata.pageCount as number | undefined) : undefined

      if (isTV) {
        prismaStatus = TV_STATUS_MAP[tvStatus]
        const totalEps = tvDetails?.totalEpisodes ?? (estimated ?? 0)
        progressTotal = totalEps > 0 ? totalEps : undefined
        if (tvDetails) {
          const watchedEp = calcWatchedEps(tvDetails.seasons, tvStatus, selSeason,
            tvStatus === "completed_season" ? (tvDetails.seasons.find(s => s.seasonNumber === selSeason)?.episodeCount ?? selEpisode) : selEpisode,
            tvDetails.totalEpisodes)
          progressCurrent = watchedEp
          if (tvStatus === "completed_all") {
            currentSeasonVal = tvDetails.totalSeasons
            currentEpisodeVal = tvDetails.seasons.filter(s => s.seasonNumber > 0).at(-1)?.episodeCount
          } else if (tvStatus === "watching" || tvStatus === "completed_episode") {
            currentSeasonVal = selSeason; currentEpisodeVal = selEpisode
          } else if (tvStatus === "completed_season") {
            currentSeasonVal = selSeason
            currentEpisodeVal = tvDetails.seasons.find(s => s.seasonNumber === selSeason)?.episodeCount
          }
        } else {
          if (tvStatus === "completed_all" && estimated) progressCurrent = estimated
          else if (tvStatus === "watching") { progressCurrent = 1; currentEpisodeVal = 1 }
        }
      } else if (isMovie) {
        prismaStatus = MOVIE_STATUS_MAP[movieStatus]
      } else {
        const statusMap: Record<string, string> = { want_to_watch: "planned", watching: "watching", completed: "completed", on_hold: "paused", dropped: "dropped" }
        prismaStatus = statusMap[movieStatus] ?? "planned"
        progressTotal = estimated
        if (movieStatus === "completed" && estimated) progressCurrent = estimated
      }

      await createItem({
        type, title: selected.title, description: selected.description, imageUrl: selected.imageUrl,
        externalId: selected.externalId, externalSource: selected.externalSource, metadata: selected.metadata,
        progressTotal, progressCurrent, currentSeason: currentSeasonVal, currentEpisode: currentEpisodeVal,
        status: prismaStatus, rating: rating > 0 ? rating : undefined, notes: review || undefined,
      })

      setAddedIds((prev) => new Set([...prev, selected.externalId]))
      setStep("success")
    } catch { alert("Failed to add item. Please try again.") }
    finally { setAdding(false) }
  }

  const maxEpForSeason = tvDetails?.seasons.find((s) => s.seasonNumber === selSeason)?.episodeCount ?? 99

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full sm:max-w-2xl max-h-[95dvh] sm:max-h-[85vh] flex flex-col rounded-t-3xl sm:rounded-2xl overflow-hidden"
        style={{ background: "#141A22", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-white/8 flex-shrink-0">
          {step !== "search" && (
            <button onClick={() => setStep(step === "details" ? "status" : "search")} className="p-1.5 rounded-lg hover:bg-white/8 text-muted-foreground transition-colors">
              <ChevronLeft size={18} />
            </button>
          )}
          <div className="flex-1 min-w-0">
            {step === "search" ? (
              <div className="flex gap-1 p-1 rounded-xl bg-black/30 overflow-x-auto">
                {ITEM_TYPES.map((t) => (
                  <button key={t} onClick={() => setType(t)} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex-shrink-0 ${type === t ? "bg-[#F5C518] text-black" : "text-muted-foreground hover:text-foreground"}`}>
                    {TYPE_ICONS[t]}<span className="hidden sm:inline">{TYPE_LABELS[t]}</span>
                  </button>
                ))}
              </div>
            ) : step === "success" ? (
              <p className="text-sm font-semibold text-emerald-400">Added to Chronicle!</p>
            ) : (
              <div className="flex items-center gap-2 min-w-0">
                {selected?.imageUrl && (
                  <div className="w-7 h-10 rounded overflow-hidden flex-shrink-0 relative">
                    <Image src={selected.imageUrl} alt={selected.title} fill className="object-cover" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold line-clamp-1">{selected?.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">{type}</p>
                </div>
              </div>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/8 text-muted-foreground transition-colors flex-shrink-0"><X size={18} /></button>
        </div>

        {/* Search input */}
        {step === "search" && (
          <div className="px-4 py-3 border-b border-white/8 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search for a ${TYPE_LABELS[type]?.toLowerCase() ?? type}...`}
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-black/30 border border-white/10 focus:outline-none focus:border-[#F5C518]/50 focus:ring-1 focus:ring-[#F5C518]/20 transition-all placeholder:text-muted-foreground/60" />
            </div>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">

            {step === "search" && (
              <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4">
                {loading && <div className="flex justify-center py-12"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div>}
                {error && <p className="text-sm text-destructive text-center py-8">{error}</p>}
                {!loading && !error && results.length === 0 && query.length >= 2 && (
                  <p className="text-sm text-muted-foreground text-center py-12">No results for &ldquo;{query}&rdquo;</p>
                )}
                {!loading && query.length < 2 && (
                  <div className="text-center py-12">
                    <Search size={32} className="mx-auto mb-3 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">Type to search {TYPE_LABELS[type]?.toLowerCase() ?? type}s</p>
                  </div>
                )}
                <div className="space-y-2">
                  {results.map((r) => {
                    const isAdded = addedIds.has(r.externalId)
                    return (
                      <motion.div key={r.externalId} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 p-3 rounded-xl border border-white/6 bg-black/20 hover:border-white/12 hover:bg-black/30 transition-all">
                        <div className="w-12 h-[72px] rounded-lg overflow-hidden bg-white/5 flex-shrink-0 relative">
                          {r.imageUrl ? <Image src={r.imageUrl} alt={r.title} fill className="object-cover" /> : <div className="flex items-center justify-center h-full text-xl text-muted-foreground">{TYPE_ICONS[type]}</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">{r.title}</p>
                          {(r.metadata.releasedAt as string | undefined) && (
                            <p className="text-xs text-muted-foreground mt-0.5">{new Date(r.metadata.releasedAt as string).getFullYear()}</p>
                          )}
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">{r.description}</p>
                        </div>
                        {isAdded ? (
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                            <Check size={14} className="text-emerald-400" />
                          </div>
                        ) : (
                          <button onClick={() => handleSelect(r)} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F5C518] text-black text-xs font-semibold hover:bg-[#F5C518]/90 transition-colors whitespace-nowrap">
                            Add <ChevronRight size={12} />
                          </button>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {step === "status" && (
              <motion.div key="status" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-5 space-y-2">
                {loadingDetails && <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2"><Loader2 size={12} className="animate-spin" /> Fetching show details…</div>}
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-4">
                  {isTV ? "What is your current progress?" : "What is your status?"}
                </p>
                {isTV ? (
                  <>
                    <StatusOption label="Want to Watch" active={tvStatus === "want_to_watch"} onClick={() => setTvStatus("want_to_watch")} />
                    <StatusOption label="Currently Watching" description="Track your current season & episode" active={tvStatus === "watching"} onClick={() => setTvStatus("watching")} />
                    <StatusOption label="Completed Entire Series" description="Marks all episodes as watched" active={tvStatus === "completed_all"} onClick={() => setTvStatus("completed_all")} />
                    <StatusOption label="Completed Up to a Season" description="All episodes through a specific season" active={tvStatus === "completed_season"} onClick={() => setTvStatus("completed_season")} />
                    <StatusOption label="Completed Up to an Episode" description="Specify exact season and episode" active={tvStatus === "completed_episode"} onClick={() => setTvStatus("completed_episode")} />
                    <StatusOption label="On Hold" active={tvStatus === "on_hold"} onClick={() => setTvStatus("on_hold")} />
                    <StatusOption label="Dropped" active={tvStatus === "dropped"} onClick={() => setTvStatus("dropped")} />
                  </>
                ) : isMovie ? (
                  <>
                    <StatusOption label="Want to Watch" active={movieStatus === "want_to_watch"} onClick={() => setMovieStatus("want_to_watch")} />
                    <StatusOption label="Watching" active={movieStatus === "watching"} onClick={() => setMovieStatus("watching")} />
                    <StatusOption label="Completed" description="Add optional rating & review" active={movieStatus === "completed"} onClick={() => setMovieStatus("completed")} />
                    <StatusOption label="On Hold" active={movieStatus === "on_hold"} onClick={() => setMovieStatus("on_hold")} />
                    <StatusOption label="Dropped" active={movieStatus === "dropped"} onClick={() => setMovieStatus("dropped")} />
                  </>
                ) : (
                  <>
                    <StatusOption label="Planned" active={movieStatus === "want_to_watch"} onClick={() => setMovieStatus("want_to_watch")} />
                    <StatusOption label="In Progress" active={movieStatus === "watching"} onClick={() => setMovieStatus("watching")} />
                    <StatusOption label="Completed" active={movieStatus === "completed"} onClick={() => setMovieStatus("completed")} />
                    <StatusOption label="On Hold" active={movieStatus === "on_hold"} onClick={() => setMovieStatus("on_hold")} />
                    <StatusOption label="Dropped" active={movieStatus === "dropped"} onClick={() => setMovieStatus("dropped")} />
                  </>
                )}
              </motion.div>
            )}

            {step === "details" && (
              <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-5 space-y-5">
                {isTV && (tvStatus === "watching" || tvStatus === "completed_season" || tvStatus === "completed_episode") && (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-3">
                      {tvStatus === "completed_season" ? "Completed through which season?" : "Where are you currently?"}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1.5 block">Season</label>
                        {tvDetails ? (
                          <select value={selSeason} onChange={(e) => { setSelSeason(Number(e.target.value)); setSelEpisode(1) }}
                            className="w-full text-sm bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#F5C518]/50">
                            {tvDetails.seasons.filter(s => s.seasonNumber > 0).map((s) => (
                              <option key={s.seasonNumber} value={s.seasonNumber} className="bg-[#141A22]">Season {s.seasonNumber} ({s.episodeCount} ep)</option>
                            ))}
                          </select>
                        ) : (
                          <input type="number" min={1} value={selSeason} onChange={(e) => setSelSeason(Math.max(1, Number(e.target.value)))}
                            className="w-full text-sm bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#F5C518]/50" />
                        )}
                      </div>
                      {tvStatus !== "completed_season" && (
                        <div>
                          <label className="text-xs text-muted-foreground mb-1.5 block">Episode</label>
                          <input type="number" min={1} max={maxEpForSeason} value={selEpisode}
                            onChange={(e) => setSelEpisode(Math.max(1, Math.min(maxEpForSeason, Number(e.target.value))))}
                            className="w-full text-sm bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#F5C518]/50" />
                        </div>
                      )}
                    </div>
                    {tvDetails && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {calcWatchedEps(tvDetails.seasons, tvStatus, selSeason,
                          tvStatus === "completed_season" ? (tvDetails.seasons.find(s => s.seasonNumber === selSeason)?.episodeCount ?? 0) : selEpisode,
                          tvDetails.totalEpisodes)} / {tvDetails.totalEpisodes} episodes watched
                      </p>
                    )}
                  </div>
                )}
                {isMovie && movieStatus === "completed" && (
                  <div className="space-y-4">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Optional details</p>
                    <div>
                      <label className="text-xs text-muted-foreground mb-2 block">Date watched</label>
                      <input type="date" value={watchedDate} onChange={(e) => setWatchedDate(e.target.value)}
                        className="text-sm bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#F5C518]/50 w-full" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-2 block">Rating (optional)</label>
                      <StarRating value={rating} onChange={setRating} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-2 block">Review / Notes (optional)</label>
                      <textarea value={review} onChange={(e) => setReview(e.target.value)} placeholder="What did you think?" rows={3}
                        className="w-full text-sm bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#F5C518]/50 resize-none placeholder:text-muted-foreground/50" />
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {step === "success" && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12 }}
                  className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-4">
                  <Check size={28} className="text-emerald-400" />
                </motion.div>
                <p className="text-lg font-semibold">{selected?.title}</p>
                <p className="text-sm text-muted-foreground mt-1">Added as <span className="text-foreground font-medium">{currentStatusLabel}</span></p>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => { setStep("search"); setSelected(null); setQuery("") }}
                    className="px-4 py-2 rounded-xl border border-white/10 text-sm hover:bg-white/5 transition-colors">Add another</button>
                  <button onClick={onClose} className="px-4 py-2 rounded-xl bg-[#F5C518] text-black text-sm font-semibold hover:bg-[#F5C518]/90 transition-colors">Done</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer CTA */}
        {(step === "status" || step === "details") && (
          <div className="px-4 py-4 border-t border-white/8 flex-shrink-0">
            {step === "status" && needsDetailsStep ? (
              <button onClick={() => setStep("details")} className="w-full py-3 rounded-xl bg-[#F5C518] text-black text-sm font-semibold hover:bg-[#F5C518]/90 transition-colors flex items-center justify-center gap-2">
                Continue <ChevronRight size={16} />
              </button>
            ) : (
              <button onClick={handleAdd} disabled={adding}
                className="w-full py-3 rounded-xl bg-[#F5C518] text-black text-sm font-semibold hover:bg-[#F5C518]/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {adding && <Loader2 size={16} className="animate-spin" />}
                Add to Chronicle
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}
