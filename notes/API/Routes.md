# Routes

All API routes live under `app/api/`. Public share pages live under `app/share/`. Both are excluded from the [[Security|proxy route guard]] matcher so they handle auth independently.

## API Routes

### GET /api/auth/callback
**File:** `app/api/auth/callback/route.ts`

Handles the OAuth/email confirmation callback from [[Auth|Supabase Auth]].

- Reads the `code` query parameter from the URL
- Exchanges it for a session via `supabase.auth.exchangeCodeForSession(code)`
- On success: redirects to the `next` query parameter (defaults to `/dashboard`)
- On failure: redirects to `/login?error=Could not authenticate`

Uses the server Supabase client (`lib/supabase/server.ts`).

### POST /api/export/pdf
**File:** `app/api/export/pdf/route.ts`

Generates a PDF for an [[Invoices|invoice]] and returns it as a downloadable file.

- Expects JSON body: `{ invoiceId: string }`
- Authenticates via `supabase.auth.getUser()` -- returns 401 if no session
- Fetches the invoice (with `invoice_items` and `client` joins) scoped to `user_id = user.id`
- Fetches the user's `profiles` row for business info (company name, address, payment terms)
- Renders the PDF using `@react-pdf/renderer`'s `renderToBuffer` with the `InvoicePDF` component
- Returns the buffer with `Content-Type: application/pdf` and a `Content-Disposition` header for download
- Returns 400 if no invoice ID, 404 if invoice not found, 500 on render failure

## Share Pages (Public)

These are Server Components that fetch data via the server Supabase client. RLS policies in the [[Database]] allow anonymous SELECT by `slug`. The [[Security|proxy]] excludes `/share/*` from auth checks.

### /share/proposal/[slug]
**File:** `app/share/proposal/[slug]/page.tsx`

Displays a public proposal page.

- Fetches the proposal by slug, joining `clients.name` and `profiles.full_name, company_name`
- Shows company name, title, status badge, valid-until date, and total amount
- Renders the Tiptap HTML content via `dangerouslySetInnerHTML`
- If status is `sent`: shows an accept section with `AcceptProposalButton` (client component that calls a server action to update status to `accepted`)
- If status is `accepted`: shows a green confirmation banner

### /share/contract/[slug]
**File:** `app/share/contract/[slug]/page.tsx`

Displays a public contract page.

- Fetches the contract by slug, joining `clients.name` and `profiles.full_name, company_name`
- Shows company name, title, status badge, and client name
- Renders the Tiptap HTML content via `dangerouslySetInnerHTML`
- If status is `sent`: shows the `SignContractWidget` (client component with name input + checkbox that calls a server action to set status to `signed`, record `signed_name` and `signed_at`)
- If status is `signed`: shows a green banner with signer name and date

### /share/invoice/[slug]
**File:** `app/share/invoice/[slug]/page.tsx`

Displays a public invoice page styled as a printable document.

- Fetches the invoice by slug, joining `clients(name, email, address)`, `invoice_items(*)`, and `profiles(full_name, company_name, address, payment_terms, invoice_notes)`
- Renders a full invoice layout: header with company info and invoice number, bill-to section, issue/due dates, line items table, subtotal/tax/discount/total calculation, and footer notes
- Read-only -- no interactive elements

## Server Actions (Not API Routes)

Mutations are handled by server actions in `lib/actions/*.ts`, not API routes. Each module has its own action file:

| File | Covers |
|---|---|
| `auth.ts` | Login, signup, logout |
| `clients.ts` | Client CRUD |
| `projects.ts` | Project CRUD |
| `tasks.ts` | Task CRUD, status/position updates |
| `proposals.ts` | Proposal CRUD, accept action |
| `contracts.ts` | Contract CRUD, sign action |
| `time-logs.ts` | Time log CRUD |
| `expenses.ts` | Expense CRUD |
| `invoices.ts` | Invoice CRUD |
| `invoice-items.ts` | Invoice line item CRUD |
| `settings.ts` | Profile and business settings updates |
| `admin.ts` | Admin user management |
| `ensure-profile.ts` | Profile existence check/creation |

All server actions follow the `{ data, error }` return pattern and include auth checks (see [[Security]]).

## Related

- [[System]] -- overall architecture
- [[Auth]] -- authentication flow
- [[Security]] -- route guards and auth enforcement
- [[Invoices]] -- invoice PDF generation
- [[Proposals]] -- proposal acceptance flow
- [[Contracts]] -- contract signing flow
