import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

import { GradientBackground } from "@/components/common/gradient-background";
import { GlassCard } from "@/components/common/glass-card";

import { ParallaxHeroClient } from "@/components/landing/parallax-hero-client";
const ParallaxHero = ParallaxHeroClient;

const features = [
  { title: "Track Everything", desc: "Movies, anime, books, games, courses, projects — all in one place." },
  { title: "Immersive Analytics", desc: "Activity heatmaps, completion trends, and type-distribution radars." },
  { title: "AI-Powered", desc: "Auto-tag items, generate reviews, and get personalized recommendations." },
  { title: "3D Visualizations", desc: "Poster walls, activity globes, and scatter plots built with Three.js." },
  { title: "Import & Sync", desc: "One-click import from Letterboxd, MyAnimeList, and Goodreads." },
  { title: "Year in Review", desc: "Beautifully crafted shareable Wrapped cards powered by Claude AI." },
];

export default async function Home() {
  const { userId } = await auth();

  return (
    <main className="relative min-h-screen overflow-hidden">
      <GradientBackground />

      {/* Hero — parallax on client, static fallback on server */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <ParallaxHero />
        <div className="relative z-10 max-w-3xl space-y-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-200">
            <Sparkles className="h-3.5 w-3.5" /> Premium Personal OS
          </p>
          <h1 className="text-5xl font-bold leading-tight tracking-tight text-balance md:text-7xl">
            Chronicle{" "}
            <span className="bg-gradient-to-r from-violet-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
              everything
            </span>{" "}
            you consume.
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            Track movies, anime, books, coding projects, games, and courses with smooth timeline updates and immersive analytics.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {!userId ? (
              <>
                <SignUpButton>
                  <button className="rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:scale-105 hover:shadow-violet-500/40">
                    Start for free
                  </button>
                </SignUpButton>
                <SignInButton>
                  <button className="rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-medium backdrop-blur transition hover:bg-white/15">
                    Sign in
                  </button>
                </SignInButton>
              </>
            ) : (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:scale-105"
              >
                Go to dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce text-muted-foreground/60">
          <ArrowRight className="h-5 w-5 rotate-90" />
        </div>
      </section>

      {/* Feature cards */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 py-24">
        <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">Everything you need to track your life</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <GlassCard key={f.title} className="group transition hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-500/10">
              <h3 className="mb-2 font-semibold text-lg group-hover:text-cyan-300 transition-colors">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24 text-center">
        <GlassCard className="mx-auto max-w-2xl">
          <h2 className="mb-4 text-3xl font-bold">Ready to start chronicling?</h2>
          <p className="mb-6 text-muted-foreground">Join thousands tracking their media consumption with Chronicle.</p>
          {!userId ? (
            <SignUpButton>
              <button className="rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-8 py-3 font-semibold text-white shadow-lg transition hover:scale-105">
                Get started free
              </button>
            </SignUpButton>
          ) : (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-8 py-3 font-semibold text-white shadow-lg transition hover:scale-105"
            >
              Open dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </GlassCard>
      </section>
    </main>
  );
}
