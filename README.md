# Chronicle

A premium, cinematic media tracking platform built with **Next.js 15**, **TypeScript**, **Prisma**, and **Tailwind CSS v4**. Track movies, TV shows, anime, manga, books, games, and coding projects — all in one beautifully designed space.

---

## Features

# Chronicle

A premium, cinematic media tracking platform built with Next.js 15, TypeScript, Prisma, and Tailwind CSS v4. Chronicle tracks movies, TV shows, anime, manga, books, games, and projects in one polished app.

## Features

- Detailed watch-status flows for movies and TV series, including season and episode progress
- AI-powered auto-tagging, review generation, and year-in-review storytelling powered by Gemini
- TMDB, Jikan, Google Books, RAWG, and GitHub-backed search and metadata
- Cinematic dashboards, detail pages, and public profiles
- PWA support with install prompt, manifest, service worker, and app icons

## Stack

- Next.js 15 App Router
- TypeScript
- Prisma + PostgreSQL
- Clerk authentication
- Tailwind CSS v4
- Framer Motion
- Gemini AI

## Setup

```bash
npm install
npm run dev
```

Create a `.env` file from `.env.example` and configure the required services.

## Environment

- `DATABASE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `TMDB_API_KEY`
- `GEMINI_API_KEY`
- `GEMINI_MODEL` (optional)

## AI Features

Chronicle uses Gemini for AI-assisted features in the app. If `GEMINI_API_KEY` is missing, AI endpoints return safe fallback responses.

## Database

```bash
npm run db:generate
npm run db:push
```

## Build

```bash
npm run build
```
- Import from Letterboxd / MyAnimeList / Goodreads
- Activity timeline with icons and relative timestamps
- Public profile pages (`/u/[username]`)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Database | PostgreSQL (Neon) via Prisma ORM |
| Auth | Clerk (JWT, webhooks) |
| Styling | Tailwind CSS v4 + OKLCH color system |
| Animations | Framer Motion |
| 3D | Three.js + React Three Fiber + Drei |
| Charts | Recharts |
| AI | Anthropic Claude SDK |
| Email | Resend |
| Icons | Lucide React |

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (or Neon free tier)
- Accounts for: Clerk, TMDB, RAWG, Anthropic (optional), Resend (optional)

### Setup

```bash
git clone https://github.com/your-username/chronicle.git
cd chronicle
npm install
```

### Environment Variables

Create `.env` (never commit this):

```env
# Database
DATABASE_URL="postgresql://..."

# Clerk auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"
CLERK_WEBHOOK_SECRET="whsec_..."

# External APIs
TMDB_API_KEY="..."
RAWG_API_KEY="..."

# AI (optional)
ANTHROPIC_API_KEY="sk-ant-..."

# Email (optional)
RESEND_API_KEY="re_..."
```

### Database

```bash
npx prisma db push        # push schema to DB
npx prisma studio         # open Prisma Studio
```

### Development

```bash
npm run dev            # starts with Turbopack
```

### Production

```bash
npm run build
npm start
```

---

## Project Structure

```
app/
  (app)/          ← Authenticated routes (dashboard, items, analytics, etc.)
  (auth)/         ← Clerk sign-in/sign-up pages
  (public)/       ← Public profile pages
  api/            ← API routes (search, TMDB details, AI, sync, etc.)
actions/          ← Server Actions (createItem, updateItemProgress, etc.)
components/
  items/          ← ItemCard, SearchModal (multi-step wizard), CalendarView
  layout/         ← AppShell, Sidebar
  analytics/      ← Charts and visualizations
  pwa/            ← PWA install prompt
  common/         ← GlassCard, AnimatedSection, EmptyState, etc.
lib/
  api/            ← TMDB, Jikan, Google Books, RAWG, GitHub clients
  prisma/         ← Prisma client
  auth.ts         ← requireDbUser helper
prisma/
  schema.prisma   ← Data model
public/
  manifest.json   ← PWA manifest
  sw.js           ← Service worker
  icons/          ← PWA icons
```

---

## Key Design Decisions

### Episode Tracking Math
When a user selects "Completed Up to Season N", the system:
1. Fetches full season data from TMDB (`/api/tmdb/[id]`)
2. Sums episode counts for all seasons 1 through N
3. Stores result in `progressCurrent` (total cumulative episodes)
4. Stores `currentSeason` and `currentEpisode` for display

This ensures "Recently Completed" always shows the correct episode count, not `0`.

### Status Mapping
| UI label | DB status |
|---|---|
| Want to Watch | `planned` |
| Currently Watching | `watching` |
| Completed (any variant) | `completed` |
| On Hold | `paused` |
| Dropped | `dropped` |

### PWA
The service worker uses **network-first** strategy for navigation requests, falling back to cached content if offline. Static assets (manifest, icons) are pre-cached on install.

---

## License

MIT
