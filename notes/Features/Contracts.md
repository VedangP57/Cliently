# Contracts

The Contracts module lets freelancers draft rich-text contracts, share them via public slug URLs, and collect client signatures. It integrates with [[Clients]] and [[Projects]] for linking, and supports a lifecycle from draft through signing or expiration.

## Status Flow

```
draft --> sent --> signed
               \-> expired
```

Statuses are enforced by a Zod enum in validation and a PostgreSQL `CHECK` constraint on the `contracts.status` column. The `signContractAction` server action only transitions contracts that are currently in `sent` status.

## Data Model

Table: `contracts`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | `gen_random_uuid()` |
| `user_id` | uuid (FK -> [[Auth]] profiles) | RLS-scoped, set server-side |
| `client_id` | uuid (FK -> [[Clients]]) | Optional, `ON DELETE SET NULL` |
| `project_id` | uuid (FK -> [[Projects]]) | Optional, `ON DELETE SET NULL` |
| `title` | text | Required, 1-200 chars |
| `content` | text | Tiptap HTML string |
| `status` | text | `draft`, `sent`, `signed`, `expired` |
| `signed_at` | timestamptz | Set when client signs |
| `signed_name` | text | Name entered by signer |
| `slug` | text (unique) | Generated from title via `generateSlug()` |
| `created_at` | timestamptz | Auto-set |

RLS policies: owner CRUD + public SELECT for slug-based sharing (no auth required on the public share page).

## Validation

Defined in `lib/validations/contract.ts` using Zod:

- `title`: string, min 1, max 200
- `client_id`: optional UUID or empty string
- `project_id`: optional UUID or empty string
- `content`: optional string, defaults to `''`
- `status`: enum of the four statuses, defaults to `draft`

The exported type is `ContractFormValues` (using `z.input` rather than `z.infer`, meaning it reflects the input shape before Zod transforms/defaults are applied).

## Server Actions

All actions live in `lib/actions/contracts.ts` and follow the [[System]] `{ data, error }` return pattern with [[Auth]] checks.

### `createContractAction(data)`
- Validates with `contractSchema.safeParse`
- Authenticates via `supabase.auth.getUser()`
- Calls `ensureProfile(user)` to guarantee the profile row exists
- Generates a slug from the title via `generateSlug()`
- Inserts into `contracts` with `user_id` set server-side
- Revalidates `/dashboard/contracts`

### `updateContractAction(id, data)`
- Auth check, then partial update on matching `id` + `user_id`
- Only sends fields that are explicitly provided
- Revalidates both the list and detail paths

### `deleteContractAction(id)`
- Auth check, deletes row matching `id` + `user_id`
- Revalidates `/dashboard/contracts`

### `generateContractSlugAction(id)`
- Returns existing slug if one is already set
- Otherwise generates a new slug from the title and updates the row
- Used by the editor's "Generate Link" button

### `signContractAction(slug, signedName)`
- No auth required -- called from the public share page
- Validates that `signedName` is non-empty after trimming
- Updates the row where `slug` matches AND `status = 'sent'`:
  - Sets `signed_name` to the trimmed name
  - Sets `signed_at` to current ISO timestamp
  - Sets `status` to `signed`
- Returns error if contract not found or already signed

## Tiptap Rich Text Editor

Component: `components/contracts/ContractEditor.tsx` (`'use client'`)

### Extensions
- `StarterKit` with headings H1-H3
- `Underline`
- `TextAlign` for paragraph and heading alignment
- `Placeholder` with "Start writing your contract..." text

### Toolbar
Identical to [[Proposals]] editor: Bold, Italic, Underline, H1/H2/H3, Bullet List, Ordered List, Align Left/Center/Right. Uses the same `ToolbarButton` helper pattern.

### Editor Layout
Two-column grid on large screens (`lg:grid-cols-[1fr_300px]`):
- Left: Tiptap editor with toolbar
- Right sidebar: metadata fields (Title, [[Clients]] selector, [[Projects]] selector, Status) and action buttons (Save, Generate/Copy Link)

Note: Unlike [[Proposals]], the contract editor does not have `valid_until` or `total_amount` fields.

### Auto-Save (30-second interval)
Same mechanism as [[Proposals]]: a `setInterval` fires every 30 seconds, compares current content and metadata against refs, and calls `updateContractAction` if anything changed.

### Manual Save
The Save button calls `updateContractAction` directly with all current field values.

### Shareable Link Generation
The "Generate Link" / "Copy Link" button calls `generateContractSlugAction`. The share URL format is `/share/contract/{slug}`.

## List Page

Page: `app/(dashboard)/dashboard/contracts/page.tsx` (Server Component)

- Fetches all contracts for the authenticated user with joins on `clients(name)` and `projects(title)`
- Orders by `created_at` descending
- Passes data to `ContractTable`

## Table Component

Component: `components/contracts/ContractTable.tsx` (`'use client'`)

Uses Ant Design `Table` with columns: Title (links to detail), Client name, Project title, Status (via `StatusBadge`), Created date, and Actions.

### Filtering
- Text search on title (client-side, case-insensitive)
- Status dropdown filter: All, Draft, Sent, Signed, Expired

### Actions per row
- View (navigates to detail page)
- Copy Link (copies `/share/contract/{slug}` to clipboard, or shows error if no slug)
- Edit (navigates to detail page)
- Delete (opens `ConfirmDialog`, then calls `deleteContractAction`)

### Empty State
Shows `EmptyState` component with a "Create Contract" CTA when no contracts exist.

## Public Share Page

Page: `app/share/contract/[slug]/page.tsx` (Server Component, no auth required)

- Fetches contract by slug, joining `clients(name)` and `profiles(full_name, company_name)`
- Returns `notFound()` if no match
- Displays: company name (if set), title, status badge, client name
- Renders Tiptap HTML content via `dangerouslySetInnerHTML` inside a prose container
- If status is `sent`: shows the `SignContractWidget`
- If status is `signed`: shows a green banner with signer name and date

### Signing Widget

Component: `components/contracts/SignContractWidget.tsx` (`'use client'`)

The signing flow requires two inputs before the "Sign Contract" button becomes enabled:

1. **Full Name** -- text input, must be non-empty after trimming
2. **Agreement Checkbox** -- "I, [name], agree to the terms above" (dynamically interpolates the entered name)

Both must be provided for the button to activate (`disabled={loading || !name.trim() || !agreed}`).

On submit:
- Calls `signContractAction(slug, name)`
- On success: shows a green checkmark with "Contract Signed" confirmation and a thank-you message, then calls `router.refresh()`
- On error: displays error text below the checkbox

No authentication is required -- anyone with the link can sign.

## File Map

| File | Role |
|---|---|
| `lib/actions/contracts.ts` | Server actions (CRUD + sign + slug generation) |
| `lib/validations/contract.ts` | Zod schema and `ContractFormValues` type |
| `app/(dashboard)/dashboard/contracts/page.tsx` | List page (Server Component) |
| `components/contracts/ContractTable.tsx` | List table with search, filter, delete |
| `components/contracts/ContractEditor.tsx` | Tiptap editor with auto-save and metadata sidebar |
| `components/contracts/SignContractWidget.tsx` | Public signing widget for share page |
| `app/share/contract/[slug]/page.tsx` | Public share page |

## Related

- [[Clients]] -- contracts are optionally linked to a client
- [[Projects]] -- contracts are optionally linked to a project
- [[Proposals]] -- proposals may lead to contracts; both share the same Tiptap editor pattern and slug-based sharing architecture
- [[Auth]] -- all server actions verify `supabase.auth.getUser()`; RLS enforces user-scoping; signing action is unauthenticated
- [[System]] -- uses `generateSlug()`, `formatDate()` from `lib/utils.ts`
