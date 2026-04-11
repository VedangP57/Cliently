# Database

The Cliently database runs on [[System|Supabase]] PostgreSQL with 10 tables, Row Level Security on every table, and a trigger for automatic profile creation.

## Tables

### profiles
- Primary key `id` references `auth.users` via `on delete cascade`
- Stores `full_name`, `avatar_url`, `role` (`user` | `admin`), business info (`company_name`, `company_logo`, `address`), and invoice defaults (`tax_rate`, `payment_terms`, `invoice_notes`)
- Auto-created by the `handle_new_user` trigger (see below)

### clients
- Owned by `user_id` -> `profiles.id`
- Fields: `name`, `email`, `phone`, `company`, `website`, `address`, `status` (active/inactive/lead/archived), `notes`, `tags` (text array), `total_earned`
- Referenced by [[Proposals]], [[Contracts]], and [[Invoices]]

### projects
- Owned by `user_id` -> `profiles.id`
- Optional `client_id` -> `clients.id` (set null on delete)
- Fields: `title`, `description`, `status` (planning/in_progress/review/completed/on_hold/cancelled), `deadline`, `budget`, `notes`
- Parent for tasks, time_logs, expenses, and invoices

### tasks
- Owned by `user_id` -> `profiles.id`
- `project_id` -> `projects.id` (cascade on delete)
- Fields: `title`, `description`, `status` (todo/in_progress/in_review/done), `priority` (low/medium/high/urgent), `due_date`, `position` (for Kanban ordering)

### proposals
- Owned by `user_id` -> `profiles.id`
- Optional `client_id` -> `clients.id`
- Fields: `title`, `content` (HTML from Tiptap), `status` (draft/sent/accepted/rejected/expired), `valid_until`, `total_amount`, `slug` (unique, for public sharing)

### contracts
- Owned by `user_id` -> `profiles.id`
- Optional `project_id` -> `projects.id`, optional `client_id` -> `clients.id`
- Fields: `title`, `content` (HTML from Tiptap), `status` (draft/sent/signed/expired), `signed_at`, `signed_name`, `slug` (unique)

### time_logs
- Owned by `user_id` -> `profiles.id`
- `project_id` -> `projects.id` (cascade), optional `task_id` -> `tasks.id` (set null)
- Fields: `description`, `hours` (must be > 0), `date`, `billable`, `invoiced`

### expenses
- Owned by `user_id` -> `profiles.id`
- `project_id` -> `projects.id` (cascade)
- Fields: `title`, `amount` (must be > 0), `category` (software/hardware/travel/marketing/meals/other), `date`, `receipt_url`, `billable`, `invoiced`

### invoices
- Owned by `user_id` -> `profiles.id`
- Optional `client_id` -> `clients.id`, optional `project_id` -> `projects.id`
- Fields: `invoice_number` (unique), `status` (draft/sent/paid/overdue/cancelled), `issue_date`, `due_date`, `tax_rate`, `discount`, `notes`, `paid_at`, `slug` (unique)

### invoice_items
- `invoice_id` -> `invoices.id` (cascade on delete)
- Fields: `description`, `quantity`, `rate`, `amount`, `type` (service/time/expense)
- No `user_id` -- ownership derived from parent invoice

## Key Relationships

- `profiles.id` is always `auth.users.id` (1:1, set by trigger)
- Most tables have a direct `user_id` -> `profiles.id` for RLS scoping
- `projects` optionally link to a `client`
- `tasks`, `time_logs`, `expenses` belong to a `project`
- `invoices` optionally link to both a `client` and a `project`
- `invoice_items` belong to an `invoice` (cascade delete)
- `proposals` and `contracts` optionally link to a `client`; contracts also optionally link to a `project`

## Trigger: handle_new_user

A PostgreSQL trigger function fires `AFTER INSERT ON auth.users`. It inserts a row into `profiles` with:
- `id` = the new user's id
- `full_name` from `raw_user_meta_data->>'full_name'`
- `avatar_url` from `raw_user_meta_data->>'avatar_url'`

This ensures every authenticated user always has a corresponding profile row.

## Row Level Security (RLS)

RLS is enabled on all 10 tables. The general policy pattern:
- **User-scoped CRUD**: `WHERE user_id = auth.uid()` on SELECT, INSERT, UPDATE, DELETE
- **profiles**: users can SELECT and UPDATE their own row; admins can SELECT all
- **Public read for slug sharing**: `proposals`, `contracts`, and `invoices` allow anonymous SELECT when accessed by `slug` (used by the `/share/*` routes -- see [[Routes]])
- **invoice_items**: CRUD access derived from parent invoice ownership (join through `invoices.user_id = auth.uid()`)

## TypeScript Types

All table row types are defined in `types/index.ts` as interfaces: `Profile`, `Client`, `Project`, `Task`, `Proposal`, `Contract`, `TimeLog`, `Expense`, `Invoice`, `InvoiceItem`. Status and category enums are defined as union types (e.g., `ClientStatus`, `TaskPriority`, `ExpenseCategory`).

## Related

- [[System]] -- overall architecture
- [[Auth]] -- authentication flow and session management
- [[Security]] -- RLS enforcement and auth checks in server actions
- [[Tech-stack]] -- Supabase as the database layer
