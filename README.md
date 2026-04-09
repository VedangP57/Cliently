# Cliently

Cliently is an all-in-one Freelance Business OS that helps solo freelancers manage clients, projects, proposals, contracts, time logs, expenses, invoices, reporting, and admin operations from one dashboard.

- Live URL: `https://your-vercel-url.vercel.app` (replace after deploy)
- Screenshot: `docs/screenshot-dashboard.png` (add your screenshot)

## Full Feature List (13 Modules)

1. Dashboard overview (KPIs, quick insights)
2. Clients management
3. Projects management
4. Tasks (kanban workflow)
5. Proposals (editor + share)
6. Contracts (editor + share + sign)
7. Time tracking (timer + manual logs)
8. Expenses tracking
9. Invoices (items, totals, status)
10. Calendar (deadlines and due dates)
11. Reports (revenue, hours, expenses, profit/loss)
12. Settings (profile, business, defaults, security)
13. Admin panel (platform stats + user management)

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Package manager | Bun |
| Styling | Tailwind CSS + shadcn/ui |
| UI primitives | Radix UI |
| Data/Auth/Storage | Supabase |
| Forms/Validation | react-hook-form + zod |
| Rich text | Tiptap |
| Charts | Recharts |
| Date handling | dayjs |
| Icons | lucide-react |
| Analytics | posthog-js |
| Deploy | Vercel |
| Local containerization | Docker + docker-compose |

## Local Development (Bun)

1. Install dependencies:
   - `bun install`
2. Add environment variables:
   - Create `.env.local` from your `.env.example` template.
3. Start dev server:
   - `bun run dev`
4. Type-check:
   - `bun run type-check`
5. Production build:
   - `bun run build`
6. Start production server locally:
   - `bun run start`

## Docker Setup

### Build and run with Docker Compose

```bash
docker compose up --build
```

App will be available at `http://localhost:3000`.

### Notes

- `Dockerfile` uses a multi-stage build and runs `bun run build` in the builder stage.
- `docker-compose.yml` reads variables from `.env.local`.

## Environment Variables

Create `.env.local` and define:

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL (public) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Supabase publishable key (public) |
| `SUPABASE_SECRET_KEY` | Yes | Supabase service key (server only) |
| `SUPABASE_URL` | Optional | Server-side override for Supabase URL |
| `NEXT_PUBLIC_POSTHOG_KEY` | Optional | PostHog project key |
| `NEXT_PUBLIC_POSTHOG_HOST` | Optional | PostHog API host |
| `NEXT_PUBLIC_APP_URL` | Yes | App base URL (used by sitemap/robots) |

### `.env.example` guidance

- Keep only placeholders in `.env.example` (no secrets).
- Real credentials belong in `.env.local` and hosting platform environment settings.
- Never commit real keys to Git.

## Database Setup (Supabase)

1. Create a Supabase project.
2. Open the SQL editor in Supabase dashboard.
3. Run the schema SQL from project documentation (`CLAUDE.md` schema section).
4. Confirm all expected tables are created:
   - `profiles`, `clients`, `projects`, `tasks`, `proposals`, `contracts`, `time_logs`, `expenses`, `invoices`, `invoice_items`
5. Confirm RLS policies are enabled and valid.
6. Create required storage bucket(s), including:
   - `avatars`

## Folder Structure Overview

```text
app/
  (public)/          # landing, pricing, auth pages
  (dashboard)/       # authenticated product modules
  (admin)/           # admin-only routes
  api/               # API/route handlers
components/
  ui/                # shadcn/ui primitives
  shared/            # reusable shared components/providers
  layout/            # navbar/sidebar/topbar/footer
  calendar/          # calendar UI
  reports/           # reports dashboard charts
  admin/             # admin user table
  settings/          # settings tabs/forms
lib/
  actions/           # server actions
  validations/       # zod schemas
  supabase/          # client/server/admin Supabase clients
types/               # shared TypeScript types
```

## Bonus Features Checklist

- [x] Public share-ready metadata and OpenGraph setup
- [x] `robots.ts` and dynamic `sitemap.ts`
- [x] Public-page PostHog analytics integration
- [x] Calendar with color-coded deadline events
- [x] Reports with multiple visual chart types
- [x] Admin panel with role and account controls
- [x] Dockerfile + docker-compose local runtime
- [x] Strict TypeScript + server actions + Zod patterns

## Deployment to Vercel

1. Push project to GitHub.
2. Import repository in Vercel.
3. Ensure Bun is detected (`bun.lock` present).
4. Add all required environment variables in Vercel project settings.
5. Deploy from `main`.
6. Configure Supabase Auth:
   - Site URL = deployed app URL
   - Redirect URL(s) include auth callback endpoints
7. Verify:
   - Public pages
   - Dashboard routes
   - Admin routes
   - File uploads
   - Build logs are clean
