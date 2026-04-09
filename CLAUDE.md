# CLAUDE.md — Cliently: Freelance Business OS

> Single source of truth. Read fully before writing code. Never deviate without explicit instruction.

## 1. PROJECT OVERVIEW

**Product:** Cliently — all-in-one business OS for freelancers (clients, projects, proposals, contracts, time tracking, expenses, invoices)
**Context:** Full Stack Developer assessment for Inamdar Legal — evaluated on UI/UX polish, code quality, security, responsiveness, bonus features
**Deadline:** Sunday, 12 April 2026 at 22:00 IST
**Submission:** Public GitHub repo + live Vercel URL → support@inamdarlegal.com

---

## 2. TECH STACK (LOCKED)

| Layer | Tech | Constraint |
|---|---|---|
| Framework | Next.js 14 | App Router only. NO Pages Router. |
| Bundler | Turbopack | `next dev --turbopack` |
| Language | TypeScript strict | No `any`. No `as any`. |
| Styling | Tailwind CSS + shadcn/ui | No inline styles. Use `cn()`. |
| Theme | next-themes | Light + Dark mode |
| DB/Auth/Storage | Supabase | No Prisma. No Axios. |
| Auth | Supabase Auth + @supabase/ssr | Email + password. SSR-safe. |
| Rich Text | Tiptap | Proposals + Contracts |
| Kanban | @dnd-kit/core + sortable | Tasks board |
| PDF | @react-pdf/renderer | Invoices + Proposals |
| Charts | Recharts | Reports |
| Forms | react-hook-form + zod + @hookform/resolvers | Every form. |
| Date | dayjs | No moment. No date-fns. |
| Icons | lucide-react | No react-icons. No heroicons. |
| Analytics | PostHog (posthog-js) | Public pages only |
| Deploy | Vercel | Auto-deploy from main |
| State | React state + Context | No Redux. No Zustand. |

---

## 3. ENVIRONMENT VARIABLES

```
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY  ← browser-safe (sb_publishable_…)
SUPABASE_SECRET_KEY                                          ← SERVER ONLY (sb_secret_…), never expose
Optional: SUPABASE_URL — same as project URL for server-only modules (e.g. admin client)
NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_POSTHOG_HOST
NEXT_PUBLIC_APP_URL
```

`.env.local` in `.gitignore`. Add all to Vercel for production.

---

## 4. FOLDER STRUCTURE

See `app/`, `components/`, `lib/`, `hooks/`, `types/` directories in the repo. Key layout:

- `app/(public)/` — Landing, pricing, login, signup (no auth)
- `app/(dashboard)/dashboard/` — All authenticated modules (clients, projects, tasks, proposals, contracts, time, expenses, invoices, calendar, reports, settings)
- `app/(admin)/admin/` — Admin-only (overview, user management)
- `app/share/` — Public shareable pages (proposal/contract/invoice by slug)
- `app/api/` — Auth callback + PDF export
- `components/ui/` — shadcn, `components/layout/` — Sidebar/Topbar/MobileNav, `components/shared/` — reusable
- `lib/supabase/` — client.ts (browser), server.ts (SSR), admin.ts (secret key, bypasses RLS)
- `lib/actions/` — Server Actions per module
- `lib/validations/` — Zod schemas per module

---

## 5. DATABASE

10 tables: `profiles`, `clients`, `projects`, `tasks`, `proposals`, `contracts`, `time_logs`, `expenses`, `invoices`, `invoice_items`. Full SQL schema is in Section 6 reference (below). All tables have RLS enabled with user-scoped policies. Proposals, contracts, and invoices have public read for slug-based sharing.

Key relationships:
- `profiles.id` → `auth.users.id` (auto-created via trigger)
- Most tables have `user_id` → `profiles.id`
- `invoice_items.invoice_id` → `invoices.id`

---

## 6. CODING RULES

### Architecture
- **Server Components by default** — `'use client'` only for event handlers, hooks, browser APIs
- **Server Actions for mutations** — `lib/actions/*.ts` with `'use server'`, return `{ data, error }`
- **Zod validation** — client AND server side
- **Auth check in every server action** — `supabase.auth.getUser()`, never trust client-sent user IDs
- **`revalidatePath()`** after mutations
- **`@/` imports only** — never relative `../../`

### Patterns
```typescript
// Server Action shape
export async function createX(data: FormValues) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Unauthorized' }
  const { data: result, error } = await supabase.from('x').insert({...data, user_id: user.id}).select().single()
  if (error) return { data: null, error: error.message }
  revalidatePath('/dashboard/x')
  return { data: result, error: null }
}
```

### Naming
- Pages: `page.tsx`, `layout.tsx` | Components: `PascalCase.tsx` | Hooks: `use*.ts` | Actions: `camelCase.ts`

### Common Mistakes to Avoid
- Never use `cookies()` without `await` in Next.js 14+
- Never import `lib/supabase/server.ts` or `admin.ts` in client components
- Never `router.push()` after server action — use `redirect()` or `revalidatePath()`
- Never store sensitive data in localStorage
- Tiptap requires `'use client'`
- `@react-pdf/renderer` is PDF-only — use separate component for browser view

---

## 7. STATUS BADGE COLORS

```typescript
const statusColors = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  lead: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  archived: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  planning: 'bg-purple-100 text-purple-800',
  in_progress: 'bg-blue-100 text-blue-800',
  review: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  on_hold: 'bg-orange-100 text-orange-800',
  cancelled: 'bg-red-100 text-red-800',
  todo: 'bg-gray-100 text-gray-800',
  in_review: 'bg-yellow-100 text-yellow-800',
  done: 'bg-green-100 text-green-800',
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
}
```

---

## 8. RESPONSIVE DESIGN

- Mobile first — base styles for mobile, `md:` / `lg:` for larger
- Sidebar: visible `lg:+`, hidden mobile. Mobile: bottom nav with 5 icons.
- Tables: collapse to cards on mobile (`hidden md:table-cell` for non-essential columns)
- Modals: full screen on mobile, `sm:max-w-lg` on desktop
- Test at: 375px, 768px, 1280px, 1536px

---

## 9. KEY FEATURE SPECS (Quick Reference)

| Module | Key Details |
|---|---|
| Dashboard | Stats cards (clients, projects, revenue, unpaid, hours), activity feed, deadlines, quick actions, mini chart |
| Clients | CRUD + search/filter/sort, detail page with tabs (Projects, Invoices, Notes), bulk delete |
| Projects | CRUD + detail page, progress bar from tasks, tabs (Tasks, Time, Expenses, Invoices, Files) |
| Tasks | Global kanban (4 columns), drag-drop status change, filter by project |
| Proposals | Tiptap editor, auto-save 30s, PDF export, shareable slug link, accept button on public page |
| Contracts | Tiptap editor, shareable slug, signing widget (name + checkbox on public page) |
| Time | Running timer (start/pause/stop → auto-creates log), manual log, weekly timesheet view |
| Expenses | CRUD + receipt upload (Supabase Storage), filter by category/project/date |
| Invoices | Line items builder, pull from time logs + expenses, auto-calc totals, PDF, shareable slug, overdue detection |
| Calendar | Monthly view, colored dots (blue=project, yellow=task, red=invoice deadlines), click to navigate |
| Reports | Recharts: revenue line, hours bar, expenses pie, P&L bar. Date range filter. |
| Settings | Profile (avatar), Business (company info for invoices), Defaults (tax/terms), Security (password) |
| Admin | Platform stats, user management (role change, enable/disable) |

---

## 10. SECURITY

- Middleware checks Supabase session for `/dashboard` and `/admin` routes
- Admin routes check `profiles.role = 'admin'`
- RLS on every table — user-scoped
- Secret API key only in `lib/supabase/admin.ts`, server-only
- Input validation: Zod client + server
- File uploads: authenticated-only Supabase Storage bucket
- Public slug pages: read-only (except contract signing + proposal accept)

---

## 11. DEPLOYMENT

- **Local / CI package manager:** Bun — `bun install`, `bun run dev`, `bun run build` (lockfile: `bun.lock`). Vercel detects `bun.lock` and uses Bun.
- Vercel auto-deploy from `main`
- All env vars in Vercel project settings
- Supabase Auth Site URL + Redirect URLs set to Vercel domain
- Docker + docker-compose for local dev

---

## REFERENCE: Database Schema SQL

<details>
<summary>Click to expand full SQL (run in Supabase SQL Editor)</summary>

```sql
-- PROFILES
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text, avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin')),
  company_name text, company_logo text, address text,
  tax_rate numeric default 0, payment_terms text default 'Net 30',
  invoice_notes text, created_at timestamptz default now()
);

create or replace function public.handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end; $$ language plpgsql security definer;

create trigger on_auth_user_created after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- CLIENTS
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null,
  name text not null, email text, phone text, company text, website text, address text,
  status text not null default 'lead' check (status in ('active','inactive','lead','archived')),
  notes text, tags text[] default '{}', total_earned numeric default 0,
  created_at timestamptz default now()
);

-- PROJECTS
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null,
  client_id uuid references public.clients on delete set null,
  title text not null, description text,
  status text not null default 'planning' check (status in ('planning','in_progress','review','completed','on_hold','cancelled')),
  deadline date, budget numeric, notes text, created_at timestamptz default now()
);

-- TASKS
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null,
  project_id uuid references public.projects on delete cascade,
  title text not null, description text,
  status text not null default 'todo' check (status in ('todo','in_progress','in_review','done')),
  priority text not null default 'medium' check (priority in ('low','medium','high','urgent')),
  due_date date, position integer default 0, created_at timestamptz default now()
);

-- PROPOSALS
create table public.proposals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null,
  client_id uuid references public.clients on delete set null,
  title text not null, content text,
  status text not null default 'draft' check (status in ('draft','sent','accepted','rejected','expired')),
  valid_until date, total_amount numeric, slug text unique, created_at timestamptz default now()
);

-- CONTRACTS
create table public.contracts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null,
  project_id uuid references public.projects on delete set null,
  client_id uuid references public.clients on delete set null,
  title text not null, content text,
  status text not null default 'draft' check (status in ('draft','sent','signed','expired')),
  signed_at timestamptz, signed_name text, slug text unique, created_at timestamptz default now()
);

-- TIME_LOGS
create table public.time_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null,
  project_id uuid references public.projects on delete cascade,
  task_id uuid references public.tasks on delete set null,
  description text, hours numeric not null check (hours > 0),
  date date not null, billable boolean default true, invoiced boolean default false,
  created_at timestamptz default now()
);

-- EXPENSES
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null,
  project_id uuid references public.projects on delete cascade,
  title text not null, amount numeric not null check (amount > 0),
  category text not null default 'other' check (category in ('software','hardware','travel','marketing','meals','other')),
  date date not null, receipt_url text, billable boolean default true, invoiced boolean default false,
  created_at timestamptz default now()
);

-- INVOICES
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null,
  client_id uuid references public.clients on delete set null,
  project_id uuid references public.projects on delete set null,
  invoice_number text unique,
  status text not null default 'draft' check (status in ('draft','sent','paid','overdue','cancelled')),
  issue_date date, due_date date, tax_rate numeric default 0, discount numeric default 0,
  notes text, paid_at timestamptz, slug text unique, created_at timestamptz default now()
);

create table public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references public.invoices on delete cascade not null,
  description text not null, quantity numeric default 1, rate numeric not null, amount numeric not null,
  type text default 'service' check (type in ('service','time','expense'))
);

-- RLS (all tables)
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.proposals enable row level security;
alter table public.contracts enable row level security;
alter table public.time_logs enable row level security;
alter table public.expenses enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;

-- User-scoped CRUD policies (same pattern for all main tables)
-- profiles: select/update own, admins select all
-- clients/projects/tasks/time_logs/expenses: CRUD where user_id = auth.uid()
-- proposals/contracts/invoices: CRUD own + public select (for slug sharing)
-- invoice_items: CRUD via parent invoice ownership
```

</details>

---

## REFERENCE: Supabase Client Setup

<details>
<summary>Click to expand client setup code</summary>

**Browser** (`lib/supabase/client.ts`): `createBrowserClient(URL, PUBLISHABLE_KEY)`
**Server** (`lib/supabase/server.ts`): `createServerClient(URL, PUBLISHABLE_KEY, { cookies })` — `await cookies()`
**Admin** (`lib/supabase/admin.ts`): `createClient(URL, SECRET_KEY)` — server only, no session; URL from `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL`

</details>

---

## REFERENCE: Proxy (session + route guards)

<details>
<summary>Click to expand proxy logic</summary>

Next.js 16 uses `proxy.ts` (exported `proxy`) for the same role as legacy `middleware.ts`.

- Unauthenticated → `/dashboard` or `/admin` → redirect to `/login`
- Authenticated → `/login` or `/signup` → redirect to `/dashboard`
- Authenticated non-admin → `/admin` → redirect to `/dashboard`
- Matcher excludes: `_next/static`, `_next/image`, `favicon.ico`, `share`, `api/auth`

</details>

---

## REFERENCE: Utility Functions

<details>
<summary>Click to expand</summary>

`lib/utils.ts` exports: `cn()`, `formatCurrency()`, `formatDate()`, `generateSlug()`, `isOverdue()`, `getInitials()`

</details>
