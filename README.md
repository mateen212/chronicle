# Chronicle

Chronicle is a modern full-stack SaaS for personal tracking across media and productivity categories:

- Movies, TV Series, Anime, Manga, Books
- Coding Projects, Courses, Games
- Activity history timeline and collection management

## Stack

- Next.js 15 App Router + TypeScript
- Tailwind CSS + shadcn/ui + Framer Motion
- Clerk Authentication
- Prisma ORM + Neon PostgreSQL
- Vercel-compatible serverless architecture

## Quick Start

1. Install dependencies

```bash
npm install
```

2. Configure environment

```bash
cp .env.example .env
```

3. Push Prisma schema to Neon

```bash
npm run db:generate
npm run db:push
```

4. Run development server

```bash
npm run dev
```

## Required Environment Variables

- `DATABASE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `TMDB_API_KEY`
- `GOOGLE_BOOKS_API_KEY`
- `GITHUB_TOKEN`
- `NEXT_PUBLIC_APP_URL`

## Project Structure

- `app/` App Router pages, route handlers, and layouts
- `components/` reusable UI and Chronicle modules
- `actions/` server actions for mutations
- `lib/api/` external API integrations and normalization
- `lib/prisma/` Prisma client
- `prisma/` database schema
- `types/` app-level TypeScript types
- `hooks/` reusable client hooks

## Deployment (Vercel + Neon)

1. Create a Neon project and copy pooled `DATABASE_URL`.
2. Create a Clerk app (enable Email/Password + Google OAuth).
3. Add all environment variables in Vercel project settings.
4. Run first production migration via `npm run db:push`.
5. Deploy from main branch to Vercel.

## Notes

- External search keys are server-side only through route handlers (`app/api/search/route.ts`).
- Protected routes are enforced via Clerk middleware.
- UI is optimized for dark/light gradient SaaS aesthetics with minimal client JS where possible.
