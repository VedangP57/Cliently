# Projects

The Projects module manages project records linked to [[Clients]]. It provides CRUD operations, search/filter by status and client, a detail page with tabbed sub-views for [[Tasks]], [[Time-Tracking]], and [[Expenses]], and a progress bar derived from task completion.

## CRUD Operations

All mutations are implemented as Next.js Server Actions in `lib/actions/projects.ts`. Every action follows the `{ data, error }` return pattern.

- **Create** (`createProjectAction`): Validates input with Zod, calls `ensureProfile()` to guarantee the user's profile row exists, then inserts into the `projects` table with the authenticated `user_id`. Revalidates `/dashboard/projects`.
- **Update** (`updateProjectAction`): Validates input, updates the row matching both `id` and `user_id`. Revalidates both the list page and the detail page `/dashboard/projects/[id]`.
- **Delete** (`deleteProjectAction`): Deletes a single project by `id` scoped to `user_id`. Revalidates the list page. Cascading delete removes associated [[Tasks]] (via `ON DELETE CASCADE` on `tasks.project_id`).

All actions check `supabase.auth.getUser()` and return `'Unauthorized'` if no session exists. Optional fields are coerced to `null` when empty before insert/update.

Note: Unlike [[Clients]], there is no bulk delete action for projects.

## Data Model

Table: `public.projects`

| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK, `gen_random_uuid()` |
| `user_id` | uuid | FK to `profiles.id`, NOT NULL, cascade delete |
| `client_id` | uuid | FK to `clients.id`, nullable, set null on client delete |
| `title` | text | NOT NULL |
| `description` | text | nullable |
| `status` | text | NOT NULL, default `'planning'` |
| `deadline` | date | nullable |
| `budget` | numeric | nullable |
| `notes` | text | nullable |
| `created_at` | timestamptz | default `now()` |

RLS is enabled with user-scoped CRUD policies (`user_id = auth.uid()`).

### Foreign Key Behavior

- Deleting a [[Clients|client]] sets `client_id` to `NULL` (preserves the project).
- Deleting a project cascades to delete all associated [[Tasks]] (`tasks.project_id` has `ON DELETE CASCADE`).
- [[Time-Tracking|Time logs]] (`time_logs.project_id`) and [[Expenses]] (`expenses.project_id`) also cascade on project delete.

## Status Types

The `status` column is constrained to six values:

- `planning` (default) -- initial stage
- `in_progress` -- active work underway
- `review` -- under review
- `completed` -- finished
- `on_hold` -- paused
- `cancelled` -- abandoned

## Validation Rules

Defined in `lib/validations/project.ts` using Zod (`projectSchema`):

| Field | Rule |
|---|---|
| `title` | Required, 1-200 chars |
| `client_id` | Optional UUID or empty string |
| `description` | Optional, max 5000 chars or empty string |
| `status` | Enum: `planning`, `in_progress`, `review`, `completed`, `on_hold`, `cancelled`; defaults to `planning` |
| `deadline` | Optional string (date) or empty string |
| `budget` | Coerced number, min 0, optional (or 0) |
| `notes` | Optional, max 2000 chars or empty string |

Validation runs on both client (via `react-hook-form` + `zodResolver`) and server (via `safeParse` in the action).

## List Page

Route: `/dashboard/projects` (Server Component)

The page fetches all projects and all clients for the authenticated user in parallel (`Promise.all`). Projects are ordered by `created_at` descending; clients are ordered by `name`. Both are passed to the `ProjectTable` client component.

### Search and Filters

- **Search**: Text input filters projects by `title` (case-insensitive substring match).
- **Status Filter**: Dropdown with options All, Planning, In Progress, Review, Completed, On Hold, Cancelled.
- **Client Filter**: Dropdown populated dynamically from the user's [[Clients]] list, with an "All Clients" option.

All three filters are combined with AND logic.

### Table Columns

| Column | Notes |
|---|---|
| Title | Links to `/dashboard/projects/[id]` |
| Client | Resolved from `client_id` via the clients array; shows `'--'` if none |
| Status | Rendered via `StatusBadge` component |
| Deadline | Formatted date |
| Budget | Formatted currency or `'--'` |
| Action | View, Edit, Delete buttons |

The table uses Ant Design's `Table` component with pagination (10 per page, hidden on single page) and horizontal scroll at 800px.

## Create / Edit Modal

The `ProjectModal` component (Ant Design `Modal`) serves both create and edit flows. It uses `react-hook-form` with `zodResolver(projectSchema)`.

**Form fields**: Title (required), Client (select dropdown from user's clients, with "No Client" option), Description (textarea), Status (select), Deadline (date input), Budget (number input, step 0.01), Notes (textarea).

When editing, the form resets to the project's current values via `useEffect`. On submit, it calls `createProjectAction` or `updateProjectAction`, shows a toast, and calls `router.refresh()`.

## Detail Page

Route: `/dashboard/projects/[id]` (Server Component)

The page fetches the project with a join to get the client name (`*, client:clients(name)`), plus associated [[Tasks]] (ordered by `position`), [[Time-Tracking|time logs]] (ordered by `date` descending), and [[Expenses]] (ordered by `date` descending) -- all in parallel. Returns `notFound()` if the project does not exist.

### Header

Displays project title, status badge, and client name (if associated). A back button links to the projects list.

### Stats Cards

Four cards in a responsive grid:

1. **Tasks Progress** -- shows `doneTasks/totalTasks` with a `Progress` bar. Progress percentage is calculated as `Math.round((doneTasks / totalTasks) * 100)`, where `doneTasks` counts [[Tasks]] with status `'done'`.
2. **Hours Tracked** -- sum of `hours` from all [[Time-Tracking|time logs]], displayed to one decimal place.
3. **Budget** -- formatted currency or `'--'` if not set.
4. **Deadline** -- formatted date or `'--'` if not set.

### Progress Bar

The progress bar is a visual representation of task completion. It uses the shadcn `Progress` component. When a project has no tasks, progress is 0%.

### Tabs

The detail page currently implements three tabs (Tasks, Time Logs, Expenses). The spec mentions Files and Invoices tabs but these are not yet implemented.

- **Tasks** -- table showing project [[Tasks]] with columns: Title, Status, Priority, Due Date. Due Date is hidden on mobile. Tasks are ordered by `position`.
- **Time Logs** -- table showing [[Time-Tracking|time logs]] with columns: Date, Description, Hours. Hours are formatted to one decimal with "h" suffix.
- **Expenses** -- table showing [[Expenses]] with columns: Date, Title, Category (as status badge), Amount. Amounts are formatted as currency.

Each tab shows a count in its trigger label and displays an empty message when no records exist.

## Key Files

- `lib/actions/projects.ts` -- Server Actions
- `lib/validations/project.ts` -- Zod schema
- `components/projects/ProjectTable.tsx` -- List view with search/filter
- `components/projects/ProjectModal.tsx` -- Create/Edit form modal
- `app/(dashboard)/dashboard/projects/page.tsx` -- List page (Server Component)
- `app/(dashboard)/dashboard/projects/[id]/page.tsx` -- Detail page (Server Component)

## Related

- [[Clients]] -- projects optionally link to a client via `client_id`; client filter on list page
- [[Tasks]] -- tasks belong to projects; progress bar derived from task completion; cascade delete
- [[Time-Tracking]] -- time logs are scoped to projects; displayed in detail page Time Logs tab
- [[Expenses]] -- expenses are scoped to projects; displayed in detail page Expenses tab
- [[Invoices]] -- invoices can reference a project via `project_id` (tab not yet implemented on detail page)
- [[System]] -- uses shared components (`StatusBadge`, `ConfirmDialog`, `PageHeader`, `Progress`)
