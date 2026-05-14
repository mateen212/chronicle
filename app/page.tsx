import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

import { GradientBackground } from "@/components/common/gradient-background";
import { GlassCard } from "@/components/common/glass-card";

export default async function Home() {
  const { userId } = await auth();

  return (
    <main className="relative min-h-screen overflow-hidden p-4 md:p-8">
      <GradientBackground />
      <div className="mx-auto grid min-h-[90vh] max-w-6xl items-center gap-6 lg:grid-cols-2">
        <section className="space-y-5">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-200">
            <Sparkles className="h-3.5 w-3.5" /> Premium Personal OS
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-balance md:text-6xl">
            Chronicle your media, learning, and projects in one premium dashboard.
          </h1>
          <p className="max-w-xl text-base text-muted-foreground md:text-lg">
            Track movies, anime, books, coding projects, games, and courses with smooth timeline updates and immersive analytics.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            {!userId ? (
              <>
              <SignUpButton>
                <button className="rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white">
                  Start free
                </button>
              </SignUpButton>
              <SignInButton>
                <button className="rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-medium">Sign in</button>
              </SignInButton>
              </>
            ) : (
              <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white">
                Go to dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </section>

        <GlassCard className="relative overflow-hidden p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.2),transparent_50%)]" />
          <div className="relative space-y-4">
            <h2 className="text-xl font-semibold">Live Snapshot</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Watching", "3 series"],
                ["Reading", "2 books"],
                ["Projects", "4 active repos"],
                ["Completed", "12 this month"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
                  <p className="mt-1 text-lg font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>
    </main>
  );
}
