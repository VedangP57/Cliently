# Cliently — Freelance Business OS

> The all-in-one business operating system for freelancers. Manage clients, projects, proposals, contracts, time tracking, expenses, invoices, and more — from one clean dashboard.

**Live URL:** [https://cliently-phi.vercel.app](https://cliently-phi.vercel.app)

**Demo Credentials:**

| Role | Email | Password |
|------|-------|----------|
| Regular User | `demo@cliently.com` | `Demo@1234` |
| Admin | `admin@cliently.com` | `Admin@1234` |

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [Docker Setup](#docker-setup)
- [Screenshots](#screenshots)
- [Bonus Features](#bonus-features)
- [Architecture Decisions](#architecture-decisions)
- [Folder Structure](#folder-structure)

---

## Features

Cliently includes **13 fully functional modules** across a public marketing website, authenticated dashboard, and admin panel.

### Public Website
- Responsive landing page with hero, features, pricing, testimonials, and FAQ
- SEO optimized with dynamic sitemap, robots.txt, and Open Graph metadata
- Dark mode support throughout

### Dashboard (Authenticated — 12 Modules)

| # | Module | Description |
|---|--------|-------------|
| 1 | **Overview** | KPI stats cards, quick actions, recent activity |
| 2 | **Clients** | Full CRUD with status tracking, contact details, lifetime revenue |
| 3 | **Projects** | Project management with budgets, deadlines, status, client association |
| 4 | **Tasks** | Task board with priorities, statuses, due dates |
| 5 | **Proposals** | Rich text editor (Tiptap), shareable public links, status workflow |
| 6 | **Contracts** | Contract drafting with digital signature capture, shareable links |
| 7 | **Time Tracking** | Built-in timer widget + manual logging, per-project billable hours |
| 8 | **Expenses** | Expense tracking by category with receipt uploads, billable flagging |
| 9 | **Invoices** | Invoice builder with line items, tax/discounts, PDF export, AI-powered description generator, shareable links |
| 10 | **Calendar** | Monthly view of deadlines, due dates, and scheduled work |
| 11 | **Reports** | Interactive ECharts dashboards — revenue, hours, expenses, profit & loss |
| 12 | **Settings** | Profile, business details, invoice defaults, password change |

Plus: **Onboarding Checklist** — guided 5-step floating checklist for first-time users with auto-progress tracking.

### Admin Panel (Role-Protected)

| Module | Description |
|--------|-------------|
| **Dashboard** | 6 platform-wide stat cards + ECharts (user growth, invoice status, recent signups, platform summary) |
| **User Management** | View all users, change roles (admin/user), enable/disable accounts via Ant Design table |
| **Analytics** | Deep analytics with date range filtering — revenue over time, module usage, invoice breakdown, top users by revenue |
| **Settings** | Admin profile and business settings |

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript (strict) |
| **Database & Auth** | Supabase (PostgreSQL + Row Level Security + Auth) |
| **UI Components** | shadcn/ui (Radix UI primitives) + Ant Design (data tables) |
| **Styling** | Tailwind CSS v4 |
| **Charts** | Apache ECharts (via echarts-for-react) |
| **Rich Text** | Tiptap editor |
| **PDF Generation** | @react-pdf/renderer |
| **Forms & Validation** | React Hook Form + Zod |
| **AI** | Google Gemini 2.0 Flash (invoice description generator) |
| **Analytics** | PostHog (event tracking) |
| **Testing** | Vitest + Testing Library |
| **Package Manager** | Bun |
| **Deployment** | Vercel |
| **Containerization** | Docker + Docker Compose |
| **Date Handling** | dayjs |
| **Icons** | lucide-react |

---

## Local Setup

### Prerequisites

- [Bun](https://bun.sh/) v1.0+ (package manager and runtime)
- A [Supabase](https://supabase.com/) project (free tier works)
- A [Google AI Studio](https://aistudio.google.com/apikey) API key (free, for AI feature)

### Step-by-Step

**1. Clone the repository**

```bash
git clone https://github.com/VedangP57/cliently.git
cd cliently
```

**2. Install dependencies**

```bash
bun install
```

**3. Configure environment variables**

```bash
cp .env.example .env.local
```

Fill in your credentials — see the [Environment Variables](#environment-variables) table below.

**4. Set up the Supabase database**

In your Supabase project's SQL Editor, run the schema SQL to create the following tables with RLS policies:

- `profiles` (auto-created via `handle_new_user()` trigger)
- `clients`, `projects`, `tasks`
- `proposals`, `contracts`
- `time_logs`, `expenses`
- `invoices`, `invoice_items`
- `onboarding_progress` (auto-created via trigger)

Also create storage buckets: `avatars` and `logos`.

**5. Seed an admin user (optional)**

```bash
bun run seed:admin
```

Creates: `admin@cliently.com` / `Admin@1234`

**6. Start the dev server**

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000)

**7. Run tests**

```bash
bun test
```

**8. Type check**

```bash
bunx tsc --noEmit
```

---

## Environment Variables

Create a `.env.local` file with the following variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL (from Project Settings > API) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Supabase anon/public key (safe to expose client-side) |
| `SUPABASE_SECRET_KEY` | Yes | Supabase service_role key (server-side only, never exposed to client) |
| `SUPABASE_URL` | No | Optional server-side override for Supabase URL (falls back to `NEXT_PUBLIC_SUPABASE_URL`) |
| `GEMINI_API_KEY` | Yes | Google Gemini API key for the AI invoice description generator |
| `NEXT_PUBLIC_POSTHOG_KEY` | No | PostHog project API key for analytics tracking |
| `NEXT_PUBLIC_POSTHOG_HOST` | No | PostHog instance host URL (defaults to PostHog cloud) |
| `NEXT_PUBLIC_APP_URL` | No | Public app URL used for sitemap, robots.txt, and OG metadata (defaults to `http://localhost:3000`) |

> **Security note:** Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. `SUPABASE_SECRET_KEY` and `GEMINI_API_KEY` are server-only and never sent to the client.

---

## Docker Setup

### Using Docker Compose (recommended)

```bash
docker compose up --build
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Manual Docker Build

```bash
docker build -t cliently .
docker run -p 3000:3000 --env-file .env.local cliently
```

### How It Works

- **Multi-stage Dockerfile** with `node:20-alpine` base and Bun runtime
- Stage 1: Install dependencies (`bun install`)
- Stage 2: Build the Next.js production bundle (`bun run build`)
- Stage 3: Minimal production image with standalone output
- **docker-compose.yml** reads environment variables from `.env.local`

---

## Screenshots

> Replace these placeholders with actual screenshots of the deployed application.

| Page | Screenshot |
|------|-----------|
| Landing Page (Dark Mode) | `screenshots/landing-dark.png` |
| Landing Page (Light Mode) | `screenshots/landing-light.png` |
| Login Page | `screenshots/login.png` |
| Dashboard Overview | `screenshots/dashboard.png` |
| Client Management | `screenshots/clients.png` |
| Invoice Builder + AI Assist | `screenshots/invoice-builder.png` |
| Reports & Charts | `screenshots/reports.png` |
| Admin Dashboard | `screenshots/admin-dashboard.png` |
| Admin Analytics | `screenshots/admin-analytics.png` |
| Mobile Responsive | `screenshots/mobile.png` |
| Onboarding Checklist | `screenshots/onboarding.png` |

---

## Bonus Features

### 1. Analytics & Tracking — PostHog

PostHog is integrated across the public website for event tracking. CTA button clicks are tracked via a `TrackedCtaLink` component that fires `cta_clicked` events with the destination URL. This provides funnel analytics for signup conversion.

**Files:** `components/shared/PostHogProvider.tsx`, `components/shared/TrackedCtaLink.tsx`

### 2. AI Integration — Google Gemini 2.0 Flash

The Invoice Builder includes an **AI Assist** button (sparkles icon) next to each line item description. Users type a rough note (e.g., "designed homepage for 3 days") and Gemini generates a clean, professional invoice description.

- The API route (`app/api/ai/generate-description/route.ts`) verifies Supabase authentication before calling the AI
- Project and client context is passed to improve generation quality
- Uses Gemini 2.0 Flash — fast and cost-effective

**Files:** `app/api/ai/generate-description/route.ts`, `components/invoices/InvoiceBuilder.tsx`

### 3. Role-Based Access Control

Two roles: `user` and `admin`. Protection is enforced at **three levels**:

1. **Middleware** (`proxy.ts`) — redirects non-admin users away from `/admin` routes
2. **Layout** (`app/(admin)/layout.tsx`) — server-side role check with redirect
3. **Server Actions** (`lib/actions/admin.ts`) — `assertAdmin()` gate on every mutation

Admins can manage all platform users, change roles, and disable accounts.

### 4. Docker Support

Multi-stage Dockerfile optimized for production with Bun. Docker Compose configuration for one-command local setup with environment variable passthrough.

**Files:** `Dockerfile`, `docker-compose.yml`

### 5. Tests — Vitest + Testing Library

Unit tests covering utility functions, Zod validation schemas, auth validation logic, and UI components.

```bash
bun test
```

**Files:** `lib/__tests__/`, `components/__tests__/`, `vitest.config.ts`

### 6. SEO Best Practices

- Dynamic `sitemap.ts` generating XML sitemap for all public routes
- `robots.ts` with crawl rules and sitemap reference
- Page-level `metadata` exports with Open Graph tags, titles, and descriptions
- Semantic HTML structure with proper heading hierarchy
- `metadataBase` configured for absolute URL resolution

**Files:** `app/sitemap.ts`, `app/robots.ts`, `app/layout.tsx`, `app/(public)/page.tsx`

---

## Architecture Decisions

### Why Supabase?

Supabase provides PostgreSQL with built-in auth, real-time capabilities, file storage, and Row Level Security — all in one service. This eliminates the need for separate auth providers (Auth0, Clerk), file storage (S3), and ORMs (Prisma). The `service_role` key enables server-side admin operations that bypass RLS, which is essential for the admin panel and onboarding tracking.

### Why Next.js App Router?

The App Router enables React Server Components by default, reducing client-side JavaScript and improving performance. Route groups — `(public)`, `(dashboard)`, `(admin)` — provide clean layout separation with different authentication requirements and UI shells. Server Actions colocate data mutations with the UI components that trigger them, simplifying the data flow.

### Why shadcn/ui + Ant Design?

**shadcn/ui** (built on Radix UI) provides accessible, unstyled primitives that integrate seamlessly with Tailwind CSS — perfect for forms, dialogs, popovers, and custom UI. **Ant Design's Table** component is used for data-heavy views (clients, invoices, users) because of its built-in pagination, sorting, row selection, and horizontal scroll — features that would take significant effort to build from scratch with shadcn alone.

### Why ECharts?

ECharts provides rich, interactive chart types (line, bar, pie, donut, horizontal bar) with built-in dark mode theming, tooltips, animations, and responsive resizing. It's more feature-complete than lightweight alternatives and handles both the user-facing Reports page and admin Analytics with minimal configuration.

### Why Bun?

Bun is significantly faster than npm/yarn for dependency installation and script execution. It serves as both the package manager (`bun install`) and runtime for seed scripts (`bun run seed:admin`). The `bun.lock` lockfile ensures deterministic installs on CI and Docker.

### Why Zod + React Hook Form?

Every form in the application uses **Zod** for schema validation and **React Hook Form** for state management. Zod schemas are shared between client-side form validation and server-side action validation, ensuring a single source of truth for data shapes. This prevents invalid data from reaching the database while providing instant client-side feedback.

---

## Folder Structure

```
cliently/
├── app/
│   ├── (public)/                # Public pages (landing, login, signup, pricing)
│   │   ├── page.tsx             # Landing page with hero, features, pricing, FAQ
│   │   ├── login/               # Login page
│   │   ├── signup/              # Signup page
│   │   └── pricing/             # Pricing page
│   ├── (dashboard)/             # Authenticated dashboard (12 modules)
│   │   └── dashboard/
│   │       ├── clients/         # Client list + detail pages
│   │       ├── projects/        # Project list + detail pages
│   │       ├── tasks/           # Task management
│   │       ├── proposals/       # Proposal editor + list
│   │       ├── contracts/       # Contract editor + list
│   │       ├── time/            # Time tracking + logs
│   │       ├── expenses/        # Expense tracking
│   │       ├── invoices/        # Invoice list + builder
│   │       ├── calendar/        # Calendar view
│   │       ├── reports/         # Analytics charts
│   │       └── settings/        # User settings
│   ├── (admin)/                 # Admin panel (role-protected)
│   │   └── admin/
│   │       ├── users/           # User management
│   │       ├── analytics/       # Platform analytics
│   │       └── settings/        # Admin settings
│   ├── api/                     # API route handlers
│   │   └── ai/                  # AI-powered endpoints
│   └── share/                   # Public shareable links (invoices, proposals, contracts)
├── components/
│   ├── ui/                      # shadcn/ui base components (Button, Input, Card, etc.)
│   ├── layout/                  # Sidebar, Topbar, MobileNav, PublicNavbar, PublicFooter
│   ├── auth/                    # LoginForm, SignupForm
│   ├── admin/                   # Admin components (UserTable, PlatformAnalytics, etc.)
│   ├── dashboard/               # Dashboard widgets (StatsCard, OnboardingChecklist)
│   ├── clients/                 # ClientTable, ClientModal
│   ├── projects/                # ProjectTable, ProjectModal
│   ├── tasks/                   # TaskTable, TaskModal
│   ├── proposals/               # ProposalTable, ProposalEditor
│   ├── contracts/               # ContractTable, ContractEditor
│   ├── time/                    # TimeLogTable, TimerWidget
│   ├── expenses/                # ExpenseTable, ExpenseModal
│   ├── invoices/                # InvoiceTable, InvoiceBuilder, InvoicePDF
│   ├── reports/                 # ReportsDashboard (ECharts)
│   ├── settings/                # SettingsTabs (profile, business, defaults, security)
│   ├── calendar/                # CalendarView
│   └── shared/                  # Reusable (PageHeader, StatusBadge, EmptyState, etc.)
├── lib/
│   ├── actions/                 # Server actions for all modules (CRUD operations)
│   ├── supabase/                # Supabase client factories (server, admin, browser)
│   ├── validations/             # Zod schemas for all forms
│   ├── utils.ts                 # Utility functions (formatCurrency, cn, etc.)
│   └── __tests__/               # Unit tests
├── types/                       # TypeScript interfaces (Profile, Client, Invoice, etc.)
├── hooks/                       # Custom React hooks (useToast, etc.)
├── scripts/                     # Database seed scripts (seed-admin.ts)
├── public/                      # Static assets (fonts, images)
├── proxy.ts                     # Next.js proxy/middleware (auth routing, session refresh, role checks)
├── Dockerfile                   # Multi-stage Docker build
├── docker-compose.yml           # Docker Compose configuration
├── vitest.config.ts             # Test runner configuration
└── tailwind.config.ts           # Tailwind CSS configuration
```

---

## Deployment to Vercel

1. Push project to GitHub
2. Import repository in [Vercel](https://vercel.com/)
3. Bun is auto-detected via `bun.lock`
4. Add all required environment variables in Vercel project settings
5. Deploy from `main` branch
6. Configure Supabase Auth URL settings:
   - **Site URL** = your Vercel deployment URL
   - **Redirect URLs** = include localhost for local dev

---

## License

This project was built as a take-home assignment for Inamdar Strategic Solutions.

Built by [Vedang Patel](https://github.com/VedangP57)
