# Clients

The Clients module manages client records for the freelancer. It provides full CRUD operations, search/filter/sort capabilities, a detail page with tabbed sub-views, and bulk delete.

## CRUD Operations

All mutations are implemented as Next.js Server Actions in `lib/actions/clients.ts`. Every action follows the `{ data, error }` return pattern.

- **Create** (`createClientAction`): Validates input with Zod, calls `ensureProfile()` to guarantee the user's profile row exists (via admin client bypassing RLS), then inserts into the `clients` table with the authenticated `user_id`. Revalidates `/dashboard/clients`.
- **Update** (`updateClientAction`): Validates input, updates the row matching both `id` and `user_id` (RLS-safe). Revalidates both the list page and the detail page `/dashboard/clients/[id]`.
- **Delete** (`deleteClientAction`): Deletes a single client by `id` scoped to `user_id`. Revalidates the list page.
- **Bulk Delete** (`deleteClientsAction`): Accepts an array of IDs, deletes all matching rows scoped to `user_id` using `.in('id', ids)`. Revalidates the list page.

All actions check `supabase.auth.getUser()` and return `'Unauthorized'` if no session exists. Optional string fields are coerced to `null` when empty before insert/update.

## Data Model

Table: `public.clients`

| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK, `gen_random_uuid()` |
| `user_id` | uuid | FK to `profiles.id`, NOT NULL, cascade delete |
| `name` | text | NOT NULL |
| `email` | text | nullable |
| `phone` | text | nullable |
| `company` | text | nullable |
| `website` | text | nullable |
| `address` | text | nullable |
| `status` | text | NOT NULL, default `'lead'` |
| `notes` | text | nullable |
| `tags` | text[] | default `'{}'` |
| `total_earned` | numeric | default `0` |
| `created_at` | timestamptz | default `now()` |

RLS is enabled with user-scoped CRUD policies (`user_id = auth.uid()`).

## Status Types

The `status` column is constrained to four values:

- `lead` (default) -- a prospective client
- `active` -- currently engaged
- `inactive` -- no current engagement
- `archived` -- no longer relevant

## Validation Rules

Defined in `lib/validations/client.ts` using Zod (`clientSchema`):

| Field | Rule |
|---|---|
| `name` | Required, trimmed, 1-100 chars |
| `email` | Valid email or empty string, defaults to `''` |
| `phone` | Max 30 chars, defaults to `''` |
| `company` | Max 100 chars, defaults to `''` |
| `website` | Valid URL or empty string, defaults to `''` |
| `address` | Max 500 chars, defaults to `''` |
| `status` | Enum: `active`, `inactive`, `lead`, `archived`; defaults to `lead` |
| `notes` | Max 2000 chars, defaults to `''` |
| `tags` | Array of strings, defaults to `[]` |

Validation runs on both client (via `react-hook-form` + `zodResolver`) and server (via `safeParse` in the action).

## List Page

Route: `/dashboard/clients` (Server Component)

The page fetches all clients for the authenticated user ordered by `created_at` descending, then renders the `ClientTable` client component.

### Search, Filter, and Sort

- **Search**: Text input filters by `name`, `company`, or `email` (case-insensitive substring match).
- **Status Filter**: Dropdown with options All, Active, Inactive, Lead, Archived. The status value is normalized (lowercased, whitespace collapsed to underscores) before comparison.
- **Sort**: Filtered results are sorted alphabetically by `name` (`localeCompare`).

### Table Columns

| Column | Notes |
|---|---|
| Name | Links to `/dashboard/clients/[id]` |
| Company | Displays `'--'` if empty |
| Email | Displays `'--'` if empty |
| Phone | Displays `'--'` if empty |
| Status | Rendered via `StatusBadge` component |
| Total Earned | Formatted as currency |
| Action | View, Edit, Delete buttons |

The table uses Ant Design's `Table` component with row selection for bulk operations, pagination (10 per page, hidden on single page), and horizontal scroll at 800px.

### Bulk Delete

Row selection checkboxes are enabled. When one or more rows are selected, a "Delete (N)" button appears. Clicking it opens a `ConfirmDialog` and calls `deleteClientsAction` with the selected IDs.

### Empty State

When no clients exist, an `EmptyState` component shows with an "Add Client" button. When clients exist but filters yield no results, it shows "Try adjusting your search or filter."

## Create / Edit Modal

The `ClientModal` component (Ant Design `Modal`) serves both create and edit flows. It uses `react-hook-form` with `zodResolver(clientSchema)`.

**Form fields**: Name (required), Email, Phone, Company, Website, Status (select), Address (textarea), Notes (textarea), Tags (comma-separated text input parsed into an array).

When editing, the form resets to the client's current values via `useEffect`. On submit, it calls `createClientAction` or `updateClientAction`, shows a toast, and calls `router.refresh()`.

## Detail Page

Route: `/dashboard/clients/[id]` (Server Component)

The page fetches the client (scoped to `user_id`), plus associated [[Projects]] and [[Invoices]] (with `invoice_items(amount)` for totals). Returns `notFound()` if the client does not exist.

### Header

Displays client name, status badge, and company name. Edit and Delete buttons open the modal and confirm dialog respectively. A back button links to the clients list.

### Stats Cards

Four cards in a responsive grid:

1. **Contact Info** -- email, phone, website, address (icons from lucide-react)
2. **Projects** -- count of associated [[Projects]]
3. **Total Paid** -- sum of `invoice_items.amount` from [[Invoices]] with status `'paid'`
4. **Outstanding** -- total invoiced minus total paid

### Tabs

- **Projects** -- table of associated [[Projects]] with columns: Title (links to project detail), Status, Deadline, Budget. Deadline and Budget columns hidden on mobile via `hidden sm:table-cell`.
- **Invoices** -- table of associated [[Invoices]] with columns: Invoice #, Status, Issue Date, Due Date, Amount. Date columns hidden on mobile.
- **Notes** -- displays `client.notes` as preformatted text, plus tags rendered as rounded badge chips.

## Key Files

- `lib/actions/clients.ts` -- Server Actions
- `lib/validations/client.ts` -- Zod schema
- `components/clients/ClientTable.tsx` -- List view with search/filter/bulk delete
- `components/clients/ClientModal.tsx` -- Create/Edit form modal
- `components/clients/ClientDetailContent.tsx` -- Detail page content
- `app/(dashboard)/dashboard/clients/page.tsx` -- List page (Server Component)
- `app/(dashboard)/dashboard/clients/[id]/page.tsx` -- Detail page (Server Component)

## Related

- [[Projects]] -- clients can be associated with projects via `client_id`
- [[Invoices]] -- clients can be associated with invoices; detail page shows invoice history and totals
- [[System]] -- uses shared components (`StatusBadge`, `ConfirmDialog`, `EmptyState`, `PageHeader`)
- [[Auth]] -- all actions require authentication; RLS enforces user-scoped access
