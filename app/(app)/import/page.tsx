"use client";

import { useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Upload, CheckCircle } from "lucide-react";

import { createItemAction } from "@/actions/items";
import { GlassCard } from "@/components/common/glass-card";
import { ProgressBar } from "@/components/common/progress-bar";

type ImportType = "letterboxd" | "myanimelist" | "goodreads";
type PreviewRow = {
  title: string;
  type: string;
  status: string;
  year?: string;
  rating?: number;
};

function parseLetterboxdCSV(text: string): PreviewRow[] {
  const lines = text.split("\n").slice(1).filter(Boolean);
  return lines.map((line) => {
    const cols = line.split(",");
    const title = cols[1]?.replace(/"/g, "").trim() ?? "";
    const year = cols[2]?.trim();
    const rating = cols[4] ? parseFloat(cols[4]) * 2 : undefined; // Letterboxd 0-5 → 0-10
    return {
      title,
      type: "movie",
      status: cols[5] ? "completed" : "planned",
      year,
      rating: rating && !isNaN(rating) ? Math.round(rating) : undefined,
    };
  }).filter((r) => r.title);
}

function parseGoodreadsCSV(text: string): PreviewRow[] {
  const lines = text.split("\n").slice(1).filter(Boolean);
  return lines.map((line) => {
    const cols = line.split(",");
    const title = cols[1]?.replace(/"/g, "").trim() ?? "";
    const rating = cols[7] ? parseInt(cols[7]) * 2 : undefined; // 1-5 star → 2-10
    const shelf = cols[18]?.toLowerCase() ?? "";
    const status = shelf.includes("read") ? "completed" : shelf.includes("reading") ? "watching" : "planned";
    return {
      title,
      type: "book",
      status,
      rating: rating && !isNaN(rating) ? Math.min(10, rating) : undefined,
    };
  }).filter((r) => r.title);
}

function parseMALXML(text: string): PreviewRow[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "text/xml");
  const animes = Array.from(doc.querySelectorAll("anime"));
  const mangas = Array.from(doc.querySelectorAll("manga"));

  const mapStatus = (s: string) => {
    if (s === "Completed" || s === "2") return "completed";
    if (s === "Watching" || s === "Reading" || s === "1") return "watching";
    if (s === "On-Hold" || s === "3") return "paused";
    if (s === "Dropped" || s === "4") return "dropped";
    return "planned";
  };

  return [
    ...animes.map((el) => ({
      title: el.querySelector("series_title")?.textContent ?? "",
      type: "anime",
      status: mapStatus(el.querySelector("my_status")?.textContent ?? ""),
      rating: parseInt(el.querySelector("my_score")?.textContent ?? "0") || undefined,
    })),
    ...mangas.map((el) => ({
      title: el.querySelector("series_title")?.textContent ?? "",
      type: "manga",
      status: mapStatus(el.querySelector("my_status")?.textContent ?? ""),
      rating: parseInt(el.querySelector("my_score")?.textContent ?? "0") || undefined,
    })),
  ].filter((r) => r.title);
}

export default function ImportPage() {
  const [importType, setImportType] = useState<ImportType>("letterboxd");
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState<{ imported: number; skipped: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    let rows: PreviewRow[] = [];
    if (importType === "letterboxd") rows = parseLetterboxdCSV(text);
    else if (importType === "goodreads") rows = parseGoodreadsCSV(text);
    else if (importType === "myanimelist") rows = parseMALXML(text);
    setPreview(rows.slice(0, 200));
    setSummary(null);
    setProgress(0);
  }

  async function handleImport() {
    if (!preview.length) return;
    setImporting(true);
    setProgress(0);

    const results = await Promise.allSettled(
      preview.map(async (row, i) => {
        const result = await createItemAction({
          title: row.title,
          type: row.type,
          status: row.status,
          rating: row.rating,
        });
        setProgress(Math.round(((i + 1) / preview.length) * 100));
        return result;
      }),
    );

    const imported = results.filter((r) => r.status === "fulfilled").length;
    const skipped = results.filter((r) => r.status === "rejected").length;
    setSummary({ imported, skipped });
    setImporting(false);
    setPreview([]);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-violet-500/20 via-indigo-500/10 to-cyan-500/20 p-6 backdrop-blur-xl">
        <p className="text-xs uppercase tracking-widest text-cyan-200/80">Import</p>
        <h1 className="mt-2 text-3xl font-bold">Import your library</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Import from Letterboxd, MyAnimeList, or Goodreads exports.
        </p>
      </div>

      <GlassCard className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          {(["letterboxd", "myanimelist", "goodreads"] as ImportType[]).map((t) => (
            <button
              key={t}
              onClick={() => { setImportType(t); setPreview([]); setSummary(null); }}
              className={`rounded-xl border px-4 py-2 text-sm capitalize transition ${
                importType === t
                  ? "border-violet-500/60 bg-violet-500/20 font-medium"
                  : "border-white/15 bg-white/5 hover:bg-white/10"
              }`}
            >
              {t === "myanimelist" ? "MyAnimeList" : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          {importType === "letterboxd" && "Export from Letterboxd → Settings → Import & Export → Export Your Data (CSV)"}
          {importType === "myanimelist" && "Export from MyAnimeList → Profile → Export → Anime/Manga list (XML)"}
          {importType === "goodreads" && "Export from Goodreads → My Books → Tools → Export Library (CSV)"}
        </p>

        <div
          className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-white/20 p-8 transition hover:border-white/30"
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Click to select file</p>
          <input
            ref={fileRef}
            type="file"
            accept={importType === "myanimelist" ? ".xml" : ".csv"}
            className="hidden"
            onChange={handleFile}
          />
        </div>
      </GlassCard>

      <AnimatePresence>
        {preview.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <GlassCard className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">{preview.length} items to import</h2>
                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium transition hover:bg-violet-700 disabled:opacity-50"
                >
                  {importing ? "Importing…" : "Confirm import"}
                </button>
              </div>

              {importing && (
                <div className="space-y-1">
                  <ProgressBar current={progress} total={100} />
                  <p className="text-xs text-muted-foreground">{progress}% complete</p>
                </div>
              )}

              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-xs text-muted-foreground">
                      <th className="py-2 pr-4">Title</th>
                      <th className="py-2 pr-4">Type</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} className="border-b border-white/5">
                        <td className="py-1 pr-4 max-w-[200px] truncate">{row.title}</td>
                        <td className="py-1 pr-4 capitalize text-muted-foreground">{row.type}</td>
                        <td className="py-1 pr-4 capitalize text-muted-foreground">{row.status}</td>
                        <td className="py-1 text-muted-foreground">{row.rating ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {summary && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <GlassCard className="flex items-center gap-4">
              <CheckCircle className="h-8 w-8 text-emerald-400" />
              <div>
                <p className="font-semibold">Import complete</p>
                <p className="text-sm text-muted-foreground">
                  {summary.imported} imported · {summary.skipped} skipped (duplicates or errors)
                </p>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
