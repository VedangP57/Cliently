# Authentication

## Implementation

- **Provider:** Supabase Auth with @supabase/ssr
- **Method:** Email + password
- **Session:** SSR-safe via cookie-based session management

## Supabase Clients

| Client | File | Usage |
|---|---|---|
| Browser | `lib/supabase/client.ts` | Client components |
| Server | `lib/supabase/server.ts` | Server components, server actions |
| Admin | `lib/supabase/admin.ts` | Server-only, bypasses RLS |

## Route Protection

- Middleware checks Supabase session for `/dashboard` and `/admin` routes
- Unauthenticated users redirected to `/login`
- Authenticated users on `/login` or `/signup` redirected to `/dashboard`
- Non-admin users on `/admin` redirected to `/dashboard`

## User Profile

- `profiles` table auto-created via database trigger on `auth.users` insert (see [[System]] for data flow)
- Stores: full_name, avatar_url, role, company info, tax/payment defaults
- Role: `user` (default) or `admin`

## Security Rules

- Every server action must call `supabase.auth.getUser()` and verify user exists
- Never trust client-sent user IDs
- RLS policies on all tables scope data to `auth.uid()`
- Secret API key only used in `lib/supabase/admin.ts`

## Related
- [[System]]
- [[Tech-stack]]
