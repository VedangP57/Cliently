# Invoices

The Invoices module handles billing for freelance work. It provides a line items builder, pulls unbilled [[Time-Tracking]] logs and [[Expenses]], calculates totals with tax and discount, generates PDFs via `@react-pdf/renderer`, and exposes public shareable pages via slug-based URLs.

## Data Model

Two tables back this module:

**`invoices`** -- one row per invoice, owned by `user_id` (references `profiles`). Key columns:

| Column | Type | Notes |
|---|---|---|
| `client_id` | uuid | FK to [[Clients]] (nullable) |
| `project_id` | uuid | FK to [[Projects]] (nullable) |
| `invoice_number` | text | Auto-generated as `INV-XXXX` (zero-padded count of user's invoices + 1) |
| `status` | text | One of `draft`, `sent`, `paid`, `overdue`, `cancelled` |
| `issue_date` / `due_date` | date | Used for overdue detection |
| `tax_rate` | numeric | Percentage applied to subtotal |
| `discount` | numeric | Flat dollar amount subtracted from total |
| `slug` | text | Unique, generated via `generateSlug('invoice')` from [[System]] utils |
| `notes` | text | Freeform notes shown on invoice |

**`invoice_items`** -- child rows linked via `invoice_id` FK (cascade delete). Each item has:

- `description` (text), `quantity` (numeric, default 1), `rate` (numeric), `amount` (numeric, = quantity * rate)
- `type` -- one of `service`, `time`, `expense` -- indicates origin of the line item

RLS is enabled on both tables. `invoices` has public read for slug sharing; `invoice_items` CRUD is scoped via parent invoice ownership.

## Validation

Defined in `lib/validations/invoice.ts` using Zod:

- **`invoiceSchema`** validates the invoice header: `client_id` (optional UUID or empty string), `project_id` (optional UUID or empty string), `invoice_number` (optional string), `status` (enum), `issue_date`/`due_date` (optional strings), `tax_rate`/`discount` (coerced numbers, min 0).
- **`invoiceItemSchema`** validates each line item: `description` (min 1 char required), `quantity` (coerced number, min 0, default 1), `rate` (coerced number, min 0), `amount` (coerced number, min 0), `type` (enum: `service` | `time` | `expense`).

Both schemas are used client-side in the builder and server-side in actions.

## Server Actions

All defined in `lib/actions/invoices.ts` and `lib/actions/invoice-items.ts`, using `'use server'` directive. Every action authenticates via `supabase.auth.getUser()` and scopes queries by `user_id`.

### `createInvoiceAction(data)`
- Validates with `invoiceSchema.safeParse`
- Calls `ensureProfile(user)` to guarantee the profile row exists
- Auto-generates `invoice_number` via `generateInvoiceNumber()` if not provided (counts existing invoices, formats as `INV-0001`, `INV-0002`, etc.)
- Generates a unique `slug` via `generateSlug('invoice')`
- Inserts into `invoices`, calls `revalidatePath('/dashboard/invoices')`

### `updateInvoiceAction(id, data)`
- Accepts partial data, builds update object from defined fields only
- Scopes update by both `id` and `user_id`
- Revalidates both the list page and the individual invoice page

### `deleteInvoiceAction(id)`
- Deletes the invoice row (cascade deletes `invoice_items`)
- Revalidates the list page

### `upsertInvoiceItemsAction(invoiceId, items)`
- Verifies invoice ownership first
- Deletes all existing items for the invoice, then bulk-inserts the new set
- Computes `amount = quantity * rate` server-side during insert
- Revalidates the invoice detail page

### `getUninvoicedTimeLogsAction(projectId)`
- Fetches [[Time-Tracking]] logs where `billable = true` and `invoiced = false` for the given [[Projects]] ID
- Returns raw log rows for the builder to convert into line items

### `getUninvoicedExpensesAction(projectId)`
- Fetches [[Expenses]] where `billable = true` and `invoiced = false` for the given [[Projects]] ID
- Returns raw expense rows for the builder to convert into line items

## Status Flow

```
draft --> sent --> paid
                --> overdue (computed, not stored)
                --> cancelled
```

The `overdue` status is **not stored in the database**. It is computed at display time: if `status === 'sent'` and the `due_date` has passed, the UI shows "overdue" using the `isOverdue()` utility from [[System]]. The `InvoiceTable` component calls `getDisplayStatus()` which checks this condition.

## List Page

`app/(dashboard)/dashboard/invoices/page.tsx` is a **server component** that:

1. Fetches all invoices for the authenticated user with a joined select: `*, client:clients(name), invoice_items(amount)`
2. Passes the result to `InvoiceTable` (client component)

### InvoiceTable Component

`components/invoices/InvoiceTable.tsx` -- a `'use client'` component using Ant Design `Table`. Features:

- **Search** by invoice number (text filter)
- **Status filter** dropdown: All, Draft, Sent, Paid, Overdue, Cancelled
- **Overdue detection** in the filter: compares `getDisplayStatus()` against the selected filter value
- **Columns**: Invoice #, Client name, Status (via `StatusBadge`), Issue Date, Due Date, Amount (summed from `invoice_items`), Actions
- **Actions per row**: View (navigate to detail), Copy share link (clipboard), Edit (navigate to detail), Delete (with `ConfirmDialog`)
- **Amount calculation**: sums `item.amount` across all `invoice_items` for display
- **Copy link**: constructs `/share/invoice/{slug}` URL and copies to clipboard
- Pagination at 10 rows per page, horizontal scroll at 800px

## Invoice Builder

`components/invoices/InvoiceBuilder.tsx` -- the detail/edit view, a `'use client'` component. Two-column layout: line items on the left, invoice details sidebar on the right.

### Line Items (Left Column)

- Responsive grid: description, quantity, rate, computed amount (read-only), delete button
- **Add Line Item** button appends a blank row
- **Add from Time Logs** button: calls `getUninvoicedTimeLogsAction(projectId)`, converts each log into an item with `type: 'time'`, default rate of $50/hr, quantity = hours
- **Add from Expenses** button: calls `getUninvoicedExpensesAction(projectId)`, converts each expense into an item with `type: 'expense'`, quantity = 1, rate = expense amount
- If the items list has only one empty row, pulled items replace it; otherwise they are appended
- Minimum 1 line item enforced (delete button disabled when only 1 remains)

### Totals Card

- **Subtotal** = sum of (quantity * rate) for all items
- **Tax (%)** = editable input, applied as `subtotal * (taxRate / 100)`
- **Discount ($)** = editable input, flat dollar amount
- **Total** = subtotal + taxAmount - discount

### Details Sidebar (Right Column)

- [[Clients]] selector (filters [[Projects]] list when a client is chosen)
- [[Projects]] selector (scoped to selected client, or all projects if no client)
- Invoice number (editable text input)
- Issue date and due date (native date inputs)
- Notes textarea
- Current status display via `StatusBadge`

### Action Buttons

- **Save Draft** -- saves current state without changing status
- **Mark as Sent** -- saves and sets `status: 'sent'`
- **Mark as Paid** -- saves and sets `status: 'paid'`
- **Copy Link** -- copies the `/share/invoice/{slug}` URL to clipboard

The save flow calls `updateInvoiceAction` for the invoice header, then `upsertInvoiceItemsAction` for the line items (filtering out items with empty descriptions). Uses `useTransition` for pending state.

## PDF Export

`components/invoices/InvoicePDF.tsx` uses `@react-pdf/renderer` with `Document`, `Page`, `Text`, `View`, `StyleSheet`. It is a **non-interactive** component designed only for PDF generation (not browser rendering).

Layout:
- **Header**: company name (from profile) + address on the left; "INVOICE" title, invoice number, and uppercase status on the right
- **Client + Dates grid**: "Bill To" section with client name/email/address; invoice issue and due dates
- **Line items table**: description, quantity, rate, amount columns
- **Totals section**: subtotal, conditional tax row, conditional discount row, divider, bold total
- **Footer**: payment terms (from profile), invoice notes, and profile invoice notes

Props: `invoice`, `items` (InvoiceItem[]), `profile` (Profile), `client` (Client | null).

The PDF calculates its own totals independently: `subtotal = sum(items.amount)`, `taxAmount = subtotal * (tax_rate / 100)`, `total = subtotal + taxAmount - discount`.

## Public Share Page

`app/share/invoice/[slug]/page.tsx` is a **server component** (no auth required). It:

1. Looks up the invoice by `slug` with a joined select including `client`, `invoice_items`, and `profile` data
2. Returns `notFound()` if no match
3. Renders a read-only invoice view with:
   - Company/profile header
   - "Bill To" client details
   - Issue and due dates
   - HTML table of line items
   - Totals (subtotal, tax, discount, total)
   - Payment terms, notes, and profile invoice notes in the footer

This page is accessible without authentication, enabled by RLS public read policies on the `invoices` table for slug-based access.

## Key Files

| File | Purpose |
|---|---|
| `lib/actions/invoices.ts` | CRUD server actions for invoices |
| `lib/actions/invoice-items.ts` | Upsert items, fetch uninvoiced time/expenses |
| `lib/validations/invoice.ts` | Zod schemas for invoice + invoice items |
| `components/invoices/InvoiceTable.tsx` | List view with search, filter, actions |
| `components/invoices/InvoiceBuilder.tsx` | Detail/edit view with line items builder |
| `components/invoices/InvoicePDF.tsx` | PDF document component |
| `app/(dashboard)/dashboard/invoices/page.tsx` | Server component page (list) |
| `app/share/invoice/[slug]/page.tsx` | Public shareable invoice page |

## Related

- [[Clients]] -- invoices are billed to a client
- [[Projects]] -- invoices can be scoped to a project; time logs and expenses are pulled by project
- [[Time-Tracking]] -- uninvoiced billable time logs become line items with `type: 'time'`
- [[Expenses]] -- uninvoiced billable expenses become line items with `type: 'expense'`
- [[System]] -- `generateSlug()`, `formatCurrency()`, `formatDate()`, `isOverdue()` utilities
