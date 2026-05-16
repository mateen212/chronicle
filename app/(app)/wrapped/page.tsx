"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Download } from "lucide-react";
import { AnimatedSection } from "@/components/common/animated-section";
import { GlassCard } from "@/components/common/glass-card";

export default function WrappedPage() {
  const [narrative, setNarrative] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    setNarrative("");
    try {
      const res = await fetch("/api/ai/wrapped", { method: "POST" });
      if (!res.ok || !res.body) throw new Error("Failed");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setNarrative((prev) => prev + decoder.decode(value));
      }
    } catch {
      setNarrative("Could not generate year-in-review. Make sure your Anthropic API key is configured.");
    } finally {
      setLoading(false);
    }
  }

  const year = new Date().getFullYear();

  return (
    <div className="space-y-6">
      <AnimatedSection className="rounded-3xl border border-white/10 bg-gradient-to-r from-violet-500/20 via-indigo-500/10 to-cyan-500/20 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-yellow-400" />
          <div>
            <h1 className="text-3xl font-bold">{year} Wrapped</h1>
            <p className="text-sm text-muted-foreground">Your year in review, powered by AI</p>
          </div>
        </div>
      </AnimatedSection>

      {!narrative && (
        <GlassCard className="text-center space-y-4 py-12">
          <p className="text-muted-foreground">Ready to see your {year} in review?</p>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => void generate()}
            disabled={loading}
            className="rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-600 px-6 py-3 font-semibold transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Generating…" : `Generate my ${year} Wrapped`}
          </motion.button>
        </GlassCard>
      )}

      {(narrative || loading) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-auto w-full max-w-[600px]"
        >
          <div
            className="relative h-[800px] w-full overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-violet-950 to-slate-950 p-8 shadow-2xl"
            id="wrapped-card"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.3),transparent_60%)]" />
            <div className="relative z-10 flex h-full flex-col">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="h-5 w-5 text-yellow-400" />
                <span className="font-semibold text-yellow-400">Chronicle Wrapped {year}</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm leading-relaxed text-white/90 whitespace-pre-wrap">
                  {narrative}
                  {loading && <span className="animate-pulse">▋</span>}
                </p>
              </div>
              <p className="mt-4 text-xs text-white/30">chronicle.app</p>
            </div>
          </div>

          {!loading && narrative && (
            <div className="mt-4 flex justify-center gap-3">
              <button
                onClick={() => void generate()}
                className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm hover:bg-white/15"
              >
                Regenerate
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
