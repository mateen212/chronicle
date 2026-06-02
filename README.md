# 📚 Chronicle

> A premium, cinematic media tracking platform for movies, TV shows, anime, manga, books, games, and coding projects. Track everything you love with beautiful dashboards, AI-powered insights, and seamless integrations.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)

---

## 🌟 Overview

Chronicle is a next-generation media tracking application that consolidates your entertainment and learning journey across multiple platforms. Whether you're watching movies, reading manga, playing games, or tracking coding projects, Chronicle provides a unified, beautifully designed space with intelligent features powered by AI.

With integrations to TMDB, MyAnimeList, Google Books, RAWG, and GitHub, Chronicle automatically enriches your library with metadata. Create custom collections, organize with intelligent tagging, and discover beautiful insights about your viewing and reading habits.

---

## ✨ Key Features

### 📊 Multi-Type Media Tracking
- **Movies & TV Series** - Track viewing progress with season and episode-level granularity
- **Anime & Manga** - Seamless integration with MyAnimeList for updated metadata
- **Books** - Search Google Books library with automatic metadata enrichment
- **Games** - Browse RAWG database for comprehensive game information
- **Coding Projects & Courses** - Track personal projects and learning progress
- **Custom Status Flows** - Planned, Watching, Reading, Completed, Paused, Dropped

### 🤖 AI-Powered Intelligence
- **Auto-Tagging** - Intelligent categorization of your media using Claude AI
- **Review Generation** - AI-assisted review writing with custom prompts
- **Year-in-Review** - Automatic storytelling and insights about your year
- **Personalized Recommendations** - Smart suggestions based on your library

### 🔗 External Integrations
- **TMDB API** - Comprehensive movie and TV show metadata
- **MyAnimeList API** - Anime and manga database integration
- **Google Books API** - Book discovery and metadata
- **RAWG API** - Video game library and information
- **GitHub API** - Track coding projects and contributions
- **Anthropic Claude AI** - Advanced AI features and analysis

### 🎨 Beautiful User Experience
- **Cinematic Dashboards** - Visually stunning statistics and insights
- **3D Visualizations** - Interactive 3D scatter plots and poster walls
- **Smooth Animations** - Elegant transitions powered by Framer Motion
- **Dark Mode** - Full dark mode support with system preference detection
- **Responsive Design** - Mobile-first, fully responsive interface
- **Public Profiles** - Share your media journey with beautiful public profiles

### 📦 Collections & Organization
- **Custom Collections** - Create themed collections for your media
- **Intelligent Tagging** - Color-coded tags for flexible organization
- **Advanced Search** - Full-text search across your entire library
- **Activity Timeline** - Track when you added, updated, or completed items

### 📱 Progressive Web App
- **Installable** - Add Chronicle to your home screen
- **Service Worker** - Offline support and fast loading
- **Web Manifest** - Native app-like experience
- **App Icons** - Custom app icons for all devices

### 📈 Analytics & Insights
- **Activity Heatmap** - Visualize your tracking patterns over time
- **Completion Trends** - Track progress toward your media goals
- **Type Distribution** - See what you're consuming most
- **Average Ratings** - Analyze your rating patterns
- **Activity Globe** - Global visualization of your activities

---

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript development
- **React 19** - Latest React features and hooks
- **Tailwind CSS v4** - Modern utility-first CSS framework
- **Framer Motion** - Advanced animation library

### Backend & Database
- **Node.js** - Server runtime
- **Prisma ORM** - Type-safe database access
- **PostgreSQL** - Relational database
- **Clerk** - Authentication and user management

### AI & APIs
- **Anthropic Claude AI** - Advanced LLM for intelligent features
- **TMDB API** - Movie and TV metadata
- **MyAnimeList API** - Anime and manga data
- **Google Books API** - Book information
- **RAWG API** - Video game database
- **GitHub API** - Project tracking

### UI & Visualization
- **React Three Fiber** - 3D graphics with Three.js
- **Recharts** - Data visualization charts
- **Lucide React** - Beautiful icon library
- **Canvas Confetti** - Celebration animations
- **TsParticles** - Particle effects

### Development Tools
- **ESLint** - Code quality and linting
- **Turbopack** - Next-generation bundler for faster builds
- **Sonner** - Toast notifications
- **SWR** - React data fetching

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- PostgreSQL database
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chronicle
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure your environment** (see [Environment Variables](#-environment-variables) section)

5. **Set up the database**
   ```bash
   npm run db:push
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open in browser**
   ```
   http://localhost:3000
   ```

---

## 🔐 Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/chronicle

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# External APIs
TMDB_API_KEY=your_tmdb_api_key
JIKAN_API_KEY=your_jikan_api_key (optional)
GOOGLE_BOOKS_API_KEY=your_google_books_api_key
RAWG_API_KEY=your_rawg_api_key
GITHUB_TOKEN=your_github_token

# AI
ANTHROPIC_API_KEY=your_anthropic_api_key
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022

# Email
RESEND_API_KEY=your_resend_api_key (optional)

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Getting API Keys

- **Clerk** - https://clerk.com
- **TMDB** - https://www.themoviedb.org/settings/api
- **MyAnimeList** - https://myanimelist.net/apiconfig/references/api/v2
- **Google Books** - https://console.cloud.google.com/apis/library/books.googleapis.com
- **RAWG** - https://rawg.io/apidocs
- **GitHub** - https://github.com/settings/tokens
- **Anthropic** - https://console.anthropic.com
- **Resend** - https://resend.com (optional, for email features)

---

## 📋 Available Scripts

```bash
# Development
npm run dev              # Start dev server with Turbopack

# Build & Production
npm run build            # Build for production
npm start                # Start production server

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:studio        # Open Prisma Studio

# Code Quality
npm run lint             # Run ESLint
```

---

## 📁 Project Structure

```
chronicle/
├── app/                    # Next.js App Router
│   ├── (app)/             # Main app routes
│   │   ├── dashboard/     # Dashboard with analytics
│   │   ├── items/         # Media items management
│   │   ├── collections/   # Collections view
│   │   ├── analytics/     # Advanced analytics
│   │   ├── library/       # Media library
│   │   ├── profile/       # User profile
│   │   ├── discover/      # Discovery features
│   │   └── wrapped/       # Year in review
│   ├── (auth)/            # Authentication routes
│   ├── (public)/          # Public routes
│   ├── api/               # API routes
│   │   ├── search/        # Search endpoints
│   │   ├── sync/          # Data sync endpoints
│   │   ├── ai/            # AI-powered endpoints
│   │   ├── tmdb/          # TMDB integration
│   │   ├── library/       # Library operations
│   │   └── cron/          # Scheduled tasks
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable React components
│   ├── analytics/         # Analytics components
│   ├── items/             # Item-related components
│   ├── dashboard/         # Dashboard components
│   ├── layout/            # Layout components
│   ├── common/            # Common/shared components
│   └── ui/                # UI primitives
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
│   ├── api/               # API client functions
│   ├── ai/                # AI integration
│   ├── auth.ts            # Authentication utilities
│   └── utils.ts           # General utilities
├── prisma/                # Database schema
│   └── schema.prisma      # Prisma data model
├── types/                 # TypeScript type definitions
├── actions/               # Server actions
├── public/                # Static assets
├── prisma/                # Prisma configuration
└── middleware.ts          # Next.js middleware
```

---

## 🎯 Core Features Breakdown

### Media Management
- Create, read, update, and delete media items
- Track detailed progress (episodes watched, pages read, etc.)
- Rate items on custom scales
- Add personal notes and reviews
- Organize by status: Planned, Watching, Reading, Completed, Paused, Dropped

### Search & Metadata
- Search across multiple external databases
- Auto-populate metadata from TMDB, MyAnimeList, Google Books, RAWG
- Support for custom metadata with JSON storage
- Image handling from multiple sources

### Collections
- Create thematic collections
- Add items to multiple collections
- Organize and browse by collection
- Perfect for custom lists (favorites, to-watch, recommendations)

### Tagging System
- Create custom tags with color coding
- Tag items for flexible organization
- Search and filter by tags
- User-specific tag management

### Analytics Dashboard
- Activity heatmap showing tracking patterns
- Completion trends over time
- Media type distribution charts
- Average rating analysis
- 3D scatter plots for advanced visualization
- Interactive activity timeline

### AI Features
- Automatic tag suggestions
- Intelligent review generation
- Year-in-review storytelling
- Personalized insights and recommendations
- Review refinement and expansion

### Public Profiles
- Share your media journey publicly
- Beautiful profile pages
- View-only access for public users
- Profile statistics and recent activity

---

## 🔌 API Routes

### Search
- `GET /api/search/movies` - Search movies on TMDB
- `GET /api/search/series` - Search TV series on TMDB
- `GET /api/search/anime` - Search anime on MyAnimeList
- `GET /api/search/books` - Search books on Google Books
- `GET /api/search/games` - Search games on RAWG
- `GET /api/search/projects` - Search GitHub projects

### Items & Collections
- `POST /api/library/item` - Create item
- `PUT /api/library/item/[id]` - Update item
- `DELETE /api/library/item/[id]` - Delete item
- `GET /api/library/items` - Get user's items
- `POST /api/library/collection` - Create collection
- `PUT /api/library/collection/[id]` - Update collection

### AI Features
- `POST /api/ai/analyze` - Analyze media with AI
- `POST /api/ai/generate-review` - Generate AI review
- `POST /api/ai/auto-tag` - Get AI tag suggestions
- `POST /api/ai/year-in-review` - Generate year summary

### Sync
- `POST /api/sync/user` - Sync user data
- `POST /api/sync/metadata` - Update item metadata

---

## 🎨 UI Components

### Common Components
- `glass-card` - Glassmorphism card component
- `empty-state` - Empty state with icon and message
- `error-boundary` - Error boundary for error handling
- `animated-section` - Animated section wrapper
- `progress-bar` - Custom progress indicator
- `status-badge` - Item status display
- `tag-pill` - Tag display component

### Analytics Components
- `activity-heatmap` - Heat map of activities
- `completion-trend` - Trend chart for completions
- `avg-rating-chart` - Rating distribution chart
- `stats-3d-scatter` - 3D scatter plot
- `type-distribution` - Chart showing type breakdown
- `activity-globe` - 3D globe of activities

### Media Components
- `item-card` - Item card with image and details
- `calendar-view` - Calendar view of items
- `search-modal` - Search interface
- `poster-wall-3d` - 3D poster wall visualization

---

## 🔒 Authentication

Chronicle uses **Clerk** for secure authentication and user management:

- Sign up with email, Google, or GitHub
- Social authentication
- MFA support
- User sessions management
- Automatic user syncing to database

---

## 📦 Database Schema

Key models:
- **User** - User accounts and settings
- **Item** - Media items (movies, books, games, etc.)
- **ItemMetadata** - Extended metadata for items
- **Collection** - User-created collections
- **Tag** - Custom tags for organization
- **ActivityLog** - User activity tracking

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect to Vercel
3. Configure environment variables
4. Deploy automatically

```bash
npm run build
npm start
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure code quality with:
```bash
npm run lint
```

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙋 Support

For issues, questions, or suggestions:

- **GitHub Issues** - Report bugs and request features
- **Discussions** - Ask questions and share ideas
- **Email** - Contact the maintainers

---

## 🎉 Acknowledgments

- [Next.js](https://nextjs.org) - The React framework
- [Prisma](https://www.prisma.io) - ORM and data management
- [Tailwind CSS](https://tailwindcss.com) - Styling framework
- [Clerk](https://clerk.com) - Authentication solution
- [The Movie Database](https://www.themoviedb.org) - Movie and TV data
- [MyAnimeList](https://myanimelist.net) - Anime and manga data
- [Google Books](https://books.google.com) - Book information
- [RAWG](https://rawg.io) - Video game database
- All other open-source libraries and contributors

---

## 📈 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced recommendation engine
- [ ] Social features (following, sharing)
- [ ] Collaborative collections
- [ ] Custom webhooks
- [ ] API for third-party integrations
- [ ] Analytics export
- [ ] Multi-language support
- [ ] Browser extension
- [ ] Integration with more platforms

---

**Made with ❤️ by the Chronicle team**

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
