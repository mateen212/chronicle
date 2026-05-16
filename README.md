# Chronicle

**Chronicle** is a full-stack personal tracking application built with Next.js 15. It lets you track everything you consume or work on — movies, TV series, anime, manga, books, GitHub projects, online courses, and games — all from a single premium dashboard with a timeline-based activity feed.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [External API Integrations](#external-api-integrations)
- [Pages & Routes](#pages--routes)
- [Components](#components)
- [Server Actions](#server-actions)
- [API Routes](#api-routes)
- [Authentication](#authentication)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)

---

## Overview

Chronicle is your personal tracking command center. You can search for any movie, series, anime, manga, book, GitHub repo, or online course via their respective third-party APIs, add them to your library, and then track their status and progress over time. Every change you make is recorded in an activity log that surfaces on the dashboard as an interactive timeline.

---

## Features

- **Multi-type item tracking** — 8 content types: `movie`, `series`, `anime`, `manga`, `book`, `project`, `course`, `game`
- **6 status states** — `planned`, `watching`, `reading`, `completed`, `paused`, `dropped`
- **Progress tracking** — current / total progress (e.g. episodes watched, pages read)
- **Rating system** — 1–10 rating per item
- **Activity log / timeline** — every create, progress update, status change, rating change, and completion is stored and shown on the dashboard
- **Collections** — group items into named collections with descriptions
- **Search & Add modal** — unified search modal that hits the correct third-party API based on the selected item type
- **Dashboard** — stats summary (total, active, recently completed), currently active items grid, recently completed list, activity timeline
- **Item detail page** — full item view with notes, metadata, progress controls, and activity history
- **Dark / light theme** — system-aware theme with a manual toggle using `next-themes`
- **Animated UI** — scroll-triggered section animations powered by Framer Motion
- **Authentication** — Clerk-powered sign-in / sign-up with automatic user sync to the database
- **Responsive layout** — collapsible sidebar shell that works on all screen sizes

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui + Base UI + Lucide React |
| Animations | Framer Motion |
| Authentication | Clerk (`@clerk/nextjs` v7) |
| Database ORM | Prisma v6 |
| Database | PostgreSQL |
| Validation | Zod v4 |
| Date Utilities | date-fns v4 |
| Theming | next-themes |
| Class Utilities | clsx + tailwind-merge + class-variance-authority |
| Slug Generation | slugify |

---

## Project Structure

```
chronicle/
├── actions/                  # Next.js Server Actions
│   ├── collections.ts        # CRUD for collections
│   └── items.ts              # CRUD + progress/status updates for items
│
├── app/                      # Next.js App Router
│   ├── globals.css           # Global Tailwind base styles
│   ├── layout.tsx            # Root layout (fonts, providers)
│   ├── page.tsx              # Landing / marketing page
│   │
│   ├── (app)/                # Authenticated app route group
│   │   ├── layout.tsx        # App shell layout (sidebar + header)
│   │   ├── dashboard/        # Dashboard overview page
│   │   ├── items/            # Items list page + [id] detail page
│   │   ├── collections/      # Collections list page
│   │   └── profile/          # User profile page
│   │
│   ├── (auth)/               # Authentication route group
│   │   ├── sign-in/          # Clerk sign-in page
│   │   └── sign-up/          # Clerk sign-up page
│   │
│   └── api/
│       ├── search/route.ts   # Unified search API route
│       └── sync/route.ts     # Clerk webhook → DB user sync
│
├── components/
│   ├── providers.tsx         # ThemeProvider wrapper
│   ├── theme-toggle.tsx      # Dark/light mode button
│   ├── auth/
│   │   └── sync-once.tsx     # Runs user sync on first authenticated render
│   ├── common/               # Shared utility components
│   │   ├── animated-section.tsx   # Framer Motion scroll-in wrapper
│   │   ├── empty-state.tsx        # Empty list placeholder
│   │   ├── glass-card.tsx         # Glassmorphism card container
│   │   ├── gradient-background.tsx # Animated gradient background
│   │   ├── progress-bar.tsx       # Progress percentage bar
│   │   └── status-badge.tsx       # Coloured status pill
│   ├── dashboard/
│   │   └── activity-timeline.tsx  # Activity log timeline component
│   ├── items/
│   │   ├── item-card.tsx          # Card shown in grids/lists
│   │   └── search-modal.tsx       # Search & add new item modal
│   ├── layout/
│   │   ├── app-shell.tsx          # Top-level authenticated layout
│   │   └── sidebar.tsx            # Navigation sidebar
│   └── ui/
│       └── button.tsx             # Base button component (CVA variants)
│
├── hooks/
│   └── use-debounce.ts       # Generic debounce hook for search inputs
│
├── lib/
│   ├── auth.ts               # requireDbUser() — auth guard helper
│   ├── constants.ts          # Shared constants (item types, statuses, labels)
│   ├── utils.ts              # cn() utility and misc helpers
│   ├── api/
│   │   ├── github.ts         # GitHub Repositories search
│   │   ├── google-books.ts   # Google Books search
│   │   ├── jikan.ts          # Jikan (MyAnimeList) anime/manga search
│   │   └── tmdb.ts           # TMDB movie/series search
│   ├── prisma/
│   │   └── client.ts         # Prisma singleton client
│   └── user/
│       └── sync-user.ts      # Upsert Clerk user into the DB
│
├── prisma/
│   └── schema.prisma         # Full database schema
│
├── types/
│   └── index.ts              # Shared TypeScript types
│
├── middleware.ts             # Clerk auth middleware (route protection)
├── next.config.ts            # Next.js configuration
├── tailwind.config           # Tailwind CSS configuration (via postcss)
├── tsconfig.json             # TypeScript configuration
└── components.json           # shadcn/ui configuration
```

---

## Database Schema

Managed by Prisma with a PostgreSQL backend.

### Enums

| Enum | Values |
|---|---|
| `ItemType` | `movie`, `series`, `anime`, `manga`, `book`, `project`, `course`, `game` |
| `ItemStatus` | `planned`, `watching`, `reading`, `completed`, `paused`, `dropped` |
| `ActivityAction` | `item_created`, `progress_updated`, `status_changed`, `rating_changed`, `item_completed` |

### Models

**`User`**
- `id` (cuid), `externalId` (Clerk user ID), `email`, `name`, `image`
- Relations: `items[]`, `activities[]`, `collections[]`

**`Item`**
- `id`, `userId`, `type` (ItemType), `title`, `slug` (unique per user), `description`, `notes`, `imageUrl`
- `status` (ItemStatus, default `planned`)
- `progressCurrent` / `progressTotal` — numeric progress tracking
- `rating` (1–10)
- `externalId` / `externalSource` — links to the originating API record
- `startedAt`, `completedAt`, `createdAt`, `updatedAt`
- Relations: `user`, `metadata` (1-to-1), `activities[]`, `collectionItems[]`
- Indexes on `userId`, `status`, `createdAt`

**`ItemMetadata`**
- `id`, `itemId`, `data` (JSON) — stores raw API metadata (genres, page count, star count, etc.)

**`ActivityLog`**
- `id`, `userId`, `itemId` (nullable), `action` (ActivityAction), `details` (JSON), `createdAt`
- Indexes on `userId`, `createdAt`

**`Collection`**
- `id`, `userId`, `name`, `description`, `createdAt`
- Relation: `items[]` (via `CollectionItem` join table)

**`CollectionItem`** (join table)
- Composite PK: `(collectionId, itemId)`

---

## External API Integrations

All integrations live in `lib/api/` and return a unified `SearchResult` type.

### TMDB (`lib/api/tmdb.ts`)
- **Endpoint:** `https://api.themoviedb.org/3`
- **Used for:** `movie` and `series` item types
- **Auth:** `TMDB_API_KEY` env variable
- **Cache:** 1 hour (`revalidate: 3600`)
- Returns: title, overview, poster image, language, genre IDs, release date

### Jikan — MyAnimeList (`lib/api/jikan.ts`)
- **Endpoint:** `https://api.jikan.moe/v4`
- **Used for:** `anime` and `manga` item types
- **Auth:** None (public API)
- **Cache:** 30 minutes (`revalidate: 1800`)
- Returns: title, synopsis, cover image, episode/chapter count, MAL score, genres

### Google Books (`lib/api/google-books.ts`)
- **Endpoint:** `https://www.googleapis.com/books/v1/volumes`
- **Used for:** `book` item type
- **Auth:** `GOOGLE_BOOKS_API_KEY` env variable
- **Cache:** 1 hour (`revalidate: 3600`)
- Returns: title, description, thumbnail, page count, authors, categories

### GitHub (`lib/api/github.ts`)
- **Endpoint:** `https://api.github.com/search/repositories`
- **Used for:** `project` item type
- **Auth:** Optional `GITHUB_TOKEN` env variable (increases rate limit)
- **Cache:** 15 minutes (`revalidate: 900`)
- Returns: full repo name, description, owner avatar, star count, language, URL

---

## Pages & Routes

| Route | Description |
|---|---|
| `/` | Public landing page |
| `/sign-in` | Clerk sign-in (catch-all) |
| `/sign-up` | Clerk sign-up (catch-all) |
| `/dashboard` | Stats overview, active items, recently completed, activity timeline |
| `/items` | Full list of all tracked items |
| `/items/[id]` | Detailed item view — progress controls, notes, metadata, activity |
| `/collections` | List of all user collections |
| `/profile` | User profile and account settings |

---

## Components

### Layout
- **`AppShell`** — authenticated wrapper with sidebar, top bar, and main content area
- **`Sidebar`** — navigation links (Dashboard, Items, Collections, Profile) with active state highlighting

### Common / Shared
- **`AnimatedSection`** — wraps any content with a Framer Motion fade-in-up animation; accepts a `delay` prop for staggered sequences
- **`GlassCard`** — glassmorphism-styled card (`backdrop-blur`, semi-transparent border, shadow)
- **`GradientBackground`** — animated radial gradient mesh background for the overall app shell
- **`ProgressBar`** — renders a coloured percentage bar given `current` and `total` values
- **`StatusBadge`** — pill-shaped badge with colour-coded status (green = completed, yellow = watching/reading, etc.)
- **`EmptyState`** — placeholder UI with icon, title, and description shown when a list is empty

### Dashboard
- **`ActivityTimeline`** — renders the last N activity log entries as a vertical timeline with icons per action type

### Items
- **`ItemCard`** — card component showing poster/image, title, type badge, status badge, progress bar, and rating
- **`SearchModal`** — modal with a type selector dropdown, debounced search input, result grid with "Add" buttons; calls the `/api/search` route

### Auth
- **`SyncOnce`** — client component that calls `/api/sync` once per session to ensure the Clerk user exists in the database

---

## Server Actions

All server actions use `"use server"` and are validated with Zod. They call `requireDbUser()` to ensure the request is authenticated.

### `actions/items.ts`

| Action | Description |
|---|---|
| `createItem` | Creates a new item; auto-generates a unique slug; logs `item_created`; stores raw API metadata in `ItemMetadata` |
| `updateItemProgress` | Updates `progressCurrent` and optionally `progressTotal`; logs `progress_updated`; auto-triggers completion if progress reaches total |
| `updateItemStatus` | Changes the item's status; sets `startedAt` / `completedAt` timestamps appropriately; logs `status_changed` or `item_completed` |
| `updateItemRating` | Sets the 1–10 rating; logs `rating_changed` |
| `deleteItem` | Hard-deletes an item (cascades to metadata, activity logs, collection links) |

### `actions/collections.ts`

| Action | Description |
|---|---|
| `createCollection` | Creates a new named collection for the authenticated user |
| `addItemToCollection` | Adds an item to a collection via the `CollectionItem` join table |
| `removeItemFromCollection` | Removes an item from a collection |
| `deleteCollection` | Deletes a collection and all its join records |

---

## API Routes

### `GET /api/search?q=<query>&type=<ItemType>`
Unified search endpoint. Routes to the correct third-party API based on `type`:

| Type | API Used |
|---|---|
| `movie` | TMDB `/search/movie` |
| `series` | TMDB `/search/tv` |
| `anime` | Jikan `/anime` |
| `manga` | Jikan `/manga` |
| `book` | Google Books `/volumes` |
| `project` | GitHub `/search/repositories` |

Returns a JSON array of `SearchResult` objects.

### `POST /api/sync`
Called by `SyncOnce` on the client after Clerk authentication. Reads the current Clerk session server-side and upserts the user record into the database via `lib/user/sync-user.ts`. Returns `{ ok: true }` on success.

---

## Authentication

Authentication is handled entirely by **Clerk** (`@clerk/nextjs`).

- `middleware.ts` uses Clerk's `clerkMiddleware` to protect all `/dashboard`, `/items`, `/collections`, and `/profile` routes. Public routes (landing, sign-in, sign-up, API) are explicitly allowed.
- Sign-in and sign-up use Clerk's hosted components rendered inside catch-all route segments (`[[...sign-in]]`, `[[...sign-up]]`).
- After sign-in, `SyncOnce` fires a request to `/api/sync` which calls `syncUser()` to upsert the Clerk user into the PostgreSQL `User` table.
- All server actions and protected pages call `requireDbUser()` from `lib/auth.ts`, which reads the Clerk session and returns the corresponding DB user or redirects to sign-in.

---

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# External APIs
TMDB_API_KEY=your_tmdb_api_key
GOOGLE_BOOKS_API_KEY=your_google_books_api_key
GITHUB_TOKEN=your_github_personal_access_token   # optional — increases GitHub rate limit
```

> Jikan (MyAnimeList) is a public API and does not require a key.

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (local or hosted — Neon, Supabase, Railway, etc.)
- Clerk account → [clerk.com](https://clerk.com)
- TMDB API key → [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)
- Google Books API key → [console.cloud.google.com](https://console.cloud.google.com)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/chronicle.git
cd chronicle

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local and fill in all required values

# 4. Push the database schema to your PostgreSQL database
npm run db:push

# 5. Generate the Prisma client
npm run db:generate

# 6. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the development server with Turbopack |
| `npm run build` | Build for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint across the project |
| `npm run db:push` | Push Prisma schema changes to the database (no migration files) |
| `npm run db:generate` | Regenerate the Prisma client after schema changes |
| `npm run db:studio` | Open Prisma Studio — a visual browser for your database |
