# Proposals

The Proposals module lets freelancers draft rich-text proposals, share them via public slug URLs, and track client acceptance. It integrates with [[Clients]] for recipient assignment and supports a full lifecycle from draft through acceptance or expiration.

## Status Flow

```
draft --> sent --> accepted
                \-> rejected
                \-> expired
```

Statuses are enforced by a Zod enum at validation time and a PostgreSQL `CHECK` constraint on the `proposals.status` column. The `acceptProposalAction` server action only transitions proposals that are currently in `sent` status -- all other statuses are ignored by the `.eq('status', 'sent')` filter.

## Data Model

Table: `proposals`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | `gen_random_uuid()` |
| `user_id` | uuid (FK -> [[Auth]] profiles) | RLS-scoped, set server-side |
| `client_id` | uuid (FK -> [[Clients]]) | Optional, `ON DELETE SET NULL` |
| `title` | text | Required, 1-200 chars |
| `content` | text | Tiptap HTML string |
| `status` | text | `draft`, `sent`, `accepted`, `rejected`, `expired` |
| `valid_until` | date | Optional expiration date |
| `total_amount` | numeric | Optional dollar amount |
| `slug` | text (unique) | Generated from title via `generateSlug()` |
| `created_at` | timestamptz | Auto-set |

RLS policies: owner CRUD + public SELECT for slug-based sharing (no auth required on the public share page).

## Validation

Defined in `lib/validations/proposal.ts` using Zod:

- `title`: string, min 1, max 200
- `client_id`: optional UUID or empty string
- `content`: optional string, defaults to `''`
- `status`: enum of the five statuses, defaults to `draft`
- `valid_until`: optional string (date) or empty string
- `total_amount`: coerced number, min 0, defaults to 0

Validation runs both client-side (form) and server-side (`safeParse` in the server action). The exported type is `ProposalFormValues`.

## Server Actions

All actions live in `lib/actions/proposals.ts` and follow the [[System]] `{ data, error }` return pattern with [[Auth]] checks.

### `createProposalAction(data)`
- Validates with `proposalSchema.safeParse`
- Authenticates via `supabase.auth.getUser()`
- Calls `ensureProfile(user)` to guarantee the profile row exists
- Generates a slug from the title via `generateSlug()`
- Inserts into `proposals` with `user_id` set server-side
- Revalidates `/dashboard/proposals`

### `updateProposalAction(id, data)`
- Auth check, then partial update on matching `id` + `user_id`
- Only sends fields that are explicitly provided (avoids overwriting with undefined)
- Revalidates both the list and detail paths

### `deleteProposalAction(id)`
- Auth check, deletes row matching `id` + `user_id`
- Revalidates `/dashboard/proposals`

### `generateProposalSlugAction(id)`
- Returns existing slug if one is already set
- Otherwise generates a new slug from the title and updates the row
- Used by the editor's "Generate Link" button

### `acceptProposalAction(slug)`
- No auth required -- this is called from the public share page
- Updates status to `accepted` only where `slug` matches AND `status = 'sent'`
- Returns `{ data: true }` on success

## Tiptap Rich Text Editor

Component: `components/proposals/ProposalEditor.tsx` (`'use client'`)

### Extensions
- `StarterKit` with headings H1-H3
- `Underline`
- `TextAlign` for paragraph and heading alignment
- `Placeholder` with "Start writing your proposal..." text

### Toolbar
The toolbar provides buttons for: Bold, Italic, Underline, H1/H2/H3, Bullet List, Ordered List, Align Left/Center/Right. Each button uses a `ToolbarButton` helper that highlights with `bg-muted` when active.

### Editor Layout
Two-column grid on large screens (`lg:grid-cols-[1fr_300px]`):
- Left: Tiptap editor with toolbar
- Right sidebar: metadata fields (Title, [[Clients]] selector, Status, Valid Until date, Total Amount) and action buttons (Save, Generate/Copy Link)

### Auto-Save (30-second interval)
An `setInterval` fires every 30 seconds. It compares current editor HTML and metadata fields against `lastSavedContent` and `lastSavedMeta` refs. If anything changed, it calls `updateProposalAction` automatically. The interval resets when the `saveContent` callback identity changes.

### Manual Save
The Save button calls `updateProposalAction` directly and shows a toast on success or error.

### Shareable Link Generation
The "Generate Link" / "Copy Link" button calls `generateProposalSlugAction`. If a slug already exists it copies the URL to clipboard. The share URL format is `/share/proposal/{slug}`.

## List Page

Page: `app/(dashboard)/dashboard/proposals/page.tsx` (Server Component)

- Fetches all proposals for the authenticated user with a join on `clients(name)` for display
- Orders by `created_at` descending
- Passes data to `ProposalTable`

## Table Component

Component: `components/proposals/ProposalTable.tsx` (`'use client'`)

Uses Ant Design `Table` with columns: Title (links to detail), Client name, Status (via `StatusBadge`), Valid Until (formatted date), Amount (formatted currency), and Actions.

### Filtering
- Text search on title (client-side, case-insensitive)
- Status dropdown filter: All, Draft, Sent, Accepted, Rejected, Expired

### Actions per row
- View (navigates to detail page)
- Copy Link (copies `/share/proposal/{slug}` to clipboard, or shows error if no slug)
- Edit (navigates to detail page)
- Delete (opens `ConfirmDialog`, then calls `deleteProposalAction`)

### Empty State
Shows `EmptyState` component with a "Create Proposal" CTA when no proposals exist.

## Public Share Page

Page: `app/share/proposal/[slug]/page.tsx` (Server Component, no auth required)

- Fetches proposal by slug, joining `clients(name)` and `profiles(full_name, company_name)`
- Returns `notFound()` if no match
- Displays: company name (if set), title, status badge, valid-until date, total amount
- Renders Tiptap HTML content via `dangerouslySetInnerHTML` inside a prose container
- If status is `sent`: shows the `AcceptProposalButton`
- If status is `accepted`: shows a green confirmation banner

### Accept Button

Component: `components/proposals/AcceptProposalButton.tsx` (`'use client'`)

- Single button that calls `acceptProposalAction(slug)`
- On success, shows a green checkmark with "Proposal Accepted" text and calls `router.refresh()` to update the page
- No authentication required -- anyone with the link can accept

## File Map

| File | Role |
|---|---|
| `lib/actions/proposals.ts` | Server actions (CRUD + accept + slug generation) |
| `lib/validations/proposal.ts` | Zod schema and `ProposalFormValues` type |
| `app/(dashboard)/dashboard/proposals/page.tsx` | List page (Server Component) |
| `components/proposals/ProposalTable.tsx` | List table with search, filter, delete |
| `components/proposals/ProposalEditor.tsx` | Tiptap editor with auto-save and metadata sidebar |
| `components/proposals/AcceptProposalButton.tsx` | Public accept button for share page |
| `app/share/proposal/[slug]/page.tsx` | Public share page |

## Related

- [[Clients]] -- proposals are optionally linked to a client
- [[Contracts]] -- proposals may lead to contracts for the same client
- [[Auth]] -- all server actions verify `supabase.auth.getUser()`; RLS enforces user-scoping
- [[System]] -- uses `generateSlug()`, `formatCurrency()`, `formatDate()` from `lib/utils.ts`
