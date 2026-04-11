# System Architecture

## Overview

Cliently is a full-stack freelance business OS built with Next.js 14 (App Router) and Supabase.

## Key Layers

### Frontend
- **Framework:** Next.js 14 with App Router
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** React state + Context (no external state management)
- **Forms:** react-hook-form + zod + @hookform/resolvers (see [[Tech-stack]])

### Backend
- **Server Actions:** `lib/actions/*.ts` for all mutations
- **Auth:** Supabase Auth + @supabase/ssr (email + password) — see [[Auth]]
- **Database:** Supabase (PostgreSQL) with RLS on all tables
- **Storage:** Supabase Storage for file uploads (receipts, avatars)

### Routing
- `app/(public)/` - Landing, pricing, login, signup (no auth required)
- `app/(dashboard)/dashboard/` - All authenticated modules
- `app/(admin)/admin/` - Admin-only routes
- `app/share/` - Public shareable pages (proposals, contracts, invoices via slug)
- `app/api/` - Auth callback + PDF export

### Data Flow
1. Server Components fetch data via Supabase server client
2. Client Components handle interactions (forms, drag-drop, timers)
3. Server Actions handle mutations with auth check + Zod validation
4. `revalidatePath()` refreshes data after mutations

### Security
- Middleware guards `/dashboard` and `/admin` routes
- RLS policies scope all data to `auth.uid()`
- Admin client (`lib/supabase/admin.ts`) bypasses RLS, server-only
- Zod validation on both client and server

## Database
10 tables: profiles, clients, projects, tasks, proposals, contracts, time_logs, expenses, invoices, invoice_items. See CLAUDE.md for full schema.

## See also
- [[Tech-stack]]
- [[Auth]]
- [[Database]]
- [[Security]]
- [[Components]]
- [[Routes]]
