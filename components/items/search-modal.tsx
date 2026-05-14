"use client";

import { ChronicleItemType, SearchResult } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Sparkles } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

import { createItemAction } from "@/actions/items";
import { ITEM_TYPES } from "@/lib/constants";
import { useDebounce } from "@/hooks/use-debounce";

export function SearchModal() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<ChronicleItemType>("movie");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const debouncedQuery = useDebounce(query, 350);

  async function addFromSearch(result: SearchResult) {
    startTransition(async () => {
      await createItemAction({
        title: result.title,
        type,
        status: "planned",
        description: result.description,
        imageUrl: result.imageUrl,
        externalId: result.externalId,
        externalSource: result.externalSource,
        metadata: result.metadata,
      });
      setOpen(false);
    });
  }

  useEffect(() => {
    const runSearch = async () => {
      if (debouncedQuery.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}&type=${type}`);
      const data = (await response.json()) as { results: SearchResult[] };
      setResults(data.results ?? []);
      setLoading(false);
    };

    void runSearch();
  }, [debouncedQuery, type]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-sm"
      >
        <Search className="h-4 w-4" />
        Search & add
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="w-full max-w-2xl space-y-4 rounded-2xl border border-white/10 bg-slate-950/90 p-5 backdrop-blur-2xl"
              initial={{ y: 40, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.98 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-cyan-300" />
                <h3 className="text-lg font-semibold">Add new item</h3>
              </div>

              <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
                <select
                  value={type}
                  onChange={(event) => setType(event.target.value as ChronicleItemType)}
                  className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm capitalize"
                >
                  {ITEM_TYPES.map((itemType) => (
                    <option key={itemType} value={itemType} className="bg-slate-900">
                      {itemType}
                    </option>
                  ))}
                </select>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search title, repository, or keyword"
                  className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm"
                />
              </div>

              <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
                {(loading || isPending) && <p className="text-sm text-muted-foreground">Searching…</p>}
                {!loading && results.length === 0 && <p className="text-sm text-muted-foreground">No results yet.</p>}
                {results.map((result) => (
                  <button
                    key={`${result.externalSource}-${result.externalId}`}
                    type="button"
                    onClick={() => void addFromSearch(result)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-left transition hover:bg-white/10"
                  >
                    <p className="font-medium">{result.title}</p>
                    {result.description && <p className="line-clamp-2 text-xs text-muted-foreground">{result.description}</p>}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
