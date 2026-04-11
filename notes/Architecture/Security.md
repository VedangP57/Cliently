# Security

Security in Cliently is enforced at four layers: proxy (route guards), Row Level Security in the [[Database]], auth checks in every server action, and controlled Supabase client types.

## Proxy Route Guards

The file `proxy.ts` (exported as `proxy`) acts as Next.js middleware. It runs on every request except paths matching `_next/static`, `_next/image`, `favicon.ico`, `share/*`, and `api/auth/*`.

### Rules

1. **Unauthenticated users** requesting `/dashboard/*` or `/admin/*` are redirected to `/login`
2. **Authenticated users** hitting `/login` or `/signup` are redirected to `/dashboard`
3. **Admin route protection**: authenticated users requesting `/admin/*` trigger a database lookup (`profiles.role`). Non-admin users are redirected to `/dashboard`

The proxy creates its own Supabase server client using request cookies, calls `supabase.auth.getUser()`, and forwards updated session cookies on the response.

## Supabase Client Types

Three client factories exist in `lib/supabase/`, each with a distinct security profile:

### Browser Client (`lib/supabase/client.ts`)
- Uses `createBrowserClient` from `@supabase/ssr`
- Configured with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- Runs in the browser; subject to RLS policies scoped to the authenticated user
- Used in `'use client'` components only

### Server Client (`lib/supabase/server.ts`)
- Uses `createServerClient` from `@supabase/ssr`
- Reads cookies via `await cookies()` from `next/headers`
- Same publishable key as browser client; same RLS enforcement
- Used in Server Components, server actions, and API routes
- The `setAll` callback silently catches errors when called from Server Components (cookie writes only work in actions/route handlers)

### Admin Client (`lib/supabase/admin.ts`)
- Uses `createClient` from `@supabase/supabase-js` directly (not SSR)
- Configured with `SUPABASE_SECRET_KEY` (falls back `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL` for the URL)
- **Bypasses RLS entirely** -- used only for admin operations and server-only tasks
- `autoRefreshToken: false`, `persistSession: false` -- no session state
- Must never be imported in client components

## Auth Checks in Server Actions

Every server action in `lib/actions/*.ts` follows this pattern:

1. Create a server Supabase client
2. Call `supabase.auth.getUser()` to verify the session
3. If no user, return `{ data: null, error: 'Unauthorized' }`
4. Use `user.id` as the `user_id` for all database operations (never trust client-sent IDs)
5. Call `revalidatePath()` after successful mutations

This ensures that even if someone bypasses the proxy, every mutation is authenticated server-side.

## Row Level Security

All 10 tables have RLS enabled. Policies enforce:
- Users can only CRUD rows where `user_id = auth.uid()`
- `invoice_items` access is scoped through the parent `invoices` table
- Public read access on `proposals`, `contracts`, and `invoices` for slug-based sharing (no auth required)
- Admin users can read all profiles

See [[Database]] for the full RLS policy breakdown.

## File Upload Security

Expenses support receipt uploads via Supabase Storage. Only authenticated users can upload files. The `receipt_url` field stores the Supabase Storage URL. Uploads go through authenticated Supabase Storage buckets.

## Public Slug Access

Three modules support public sharing via unique slugs:
- **Proposals** (`/share/proposal/[slug]`): read-only view with an "Accept" button when status is `sent`
- **Contracts** (`/share/contract/[slug]`): read-only view with a signing widget (name + checkbox) when status is `sent`
- **Invoices** (`/share/invoice/[slug]`): read-only view showing line items, totals, and payment terms

These pages use the server Supabase client. The RLS policies allow anonymous SELECT on these tables when filtering by `slug`. The proxy matcher explicitly excludes `/share/*` paths so no auth redirect occurs.

Write operations on public pages are limited to:
- Updating proposal status to `accepted` (via `AcceptProposalButton`)
- Updating contract status to `signed` with `signed_name` and `signed_at` (via `SignContractWidget`)

## Input Validation

All forms use `react-hook-form` with `zod` schemas (defined in `lib/validations/`). Validation runs both client-side (form submission) and server-side (in the server action before any database call).

## Environment Variable Safety

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are browser-safe (prefixed `sb_publishable_`)
- `SUPABASE_SECRET_KEY` is server-only, never exposed to the client
- `.env.local` is in `.gitignore`

## Related

- [[System]] -- overall architecture
- [[Auth]] -- authentication flow details
- [[Database]] -- table schema and RLS policies
- [[Routes]] -- API routes and share pages
