# Time Tracking

The time tracking module lets users record hours worked via a live running timer or manual log entries. Each time log can be linked to a [[Projects|project]] and [[Tasks|task]], marked as billable, and later pulled into [[Invoices]].

## Page Structure

The page (`app/(dashboard)/dashboard/time/page.tsx`) is a **server component** that fetches three datasets in parallel from [[System|Supabase]]:

- `time_logs` with joined `project` and `task` relations, ordered by date descending then `created_at` descending
- `projects` ordered by title
- `tasks` ordered by title

These are passed into three client components: `TimerWidget`, `TimeLogTable`, and `TimePageActions`.

## Running Timer

`TimerWidget` (`components/time/TimerWidget.tsx`) implements a stopwatch-style timer with three states: **idle**, **running**, and **paused**.

- **Start** -- sets a `setInterval` that increments elapsed seconds every 1000ms.
- **Pause** -- clears the interval but preserves the elapsed count.
- **Resume** -- restarts the interval from the current elapsed value.
- **Stop** -- clears the interval, converts elapsed seconds to hours (rounded to 2 decimal places), and calls `createTimeLogAction` to persist the entry. If elapsed is less than 1 second, it resets without saving. The minimum logged value is `0.01` hours.

The timer display uses monospaced `HH:MM:SS` formatting. While running, the user can optionally select a [[Projects|project]], a [[Tasks|task]] (filtered by selected project), and type a description. The billable flag is hardcoded to `true` for timer-created logs. The date is set to today via `dayjs().format('YYYY-MM-DD')`.

After a successful stop, all fields (project, task, description, elapsed) reset to their defaults.

## Manual Log Entry

`ManualLogModal` (`components/time/ManualLogModal.tsx`) provides a form for creating or editing time log entries. It uses Ant Design's `Form` component (not react-hook-form) with these fields:

| Field | Type | Default | Notes |
|---|---|---|---|
| Project | Select | None | Optional, filters task list |
| Task | Select | None | Optional, scoped to selected project |
| Date | DatePicker | Today | Required |
| Hours | InputNumber | 1 | Required, min 0.01, step 0.25 |
| Description | TextArea | Empty | Optional, 3-5 rows |
| Billable | Switch | true | Toggle for invoice inclusion |

When editing, the modal pre-fills all fields from the existing `TimeLog` record. On submit it calls either `createTimeLogAction` or `updateTimeLogAction`.

`TimePageActions` (`components/time/TimePageActions.tsx`) renders the "Log Time" button in the page header that opens `ManualLogModal` in create mode.

## Time Log Table

`TimeLogTable` (`components/time/TimeLogTable.tsx`) displays all logs in an Ant Design `Table` with these columns:

- **Date** -- formatted via `formatDate()`
- **Project** -- joined project title, or dash if none
- **Task** -- joined task title (hidden on mobile via `responsive: ['md']`)
- **Description** -- truncated to 300px
- **Hours** -- right-aligned, monospaced, 2 decimal places
- **Billable** -- green "Yes" or muted "No" badge
- **Action** -- edit (opens `ManualLogModal`) and delete (opens `ConfirmDialog`)

The table supports:
- **Filter by project** via a select dropdown above the table
- **Total hours** summary that updates based on the active filter
- **Pagination** at 20 rows per page with size changer (10/20/30/50)
- **Horizontal scroll** at 1000px breakpoint
- **Empty state** with contextual message depending on whether any logs exist or the filter returned no results

## Server Actions

Defined in `lib/actions/time-logs.ts`. All actions follow the standard `{ data, error }` return pattern.

### createTimeLogAction

1. Validates input with `timeLogSchema`
2. Authenticates via `supabase.auth.getUser()`
3. Calls `ensureProfile(user)` to guarantee the profile row exists
4. Inserts into `time_logs` with `user_id` set server-side
5. Calls `revalidatePath('/dashboard/time')`

### updateTimeLogAction

1. Validates input with `timeLogSchema`
2. Authenticates the user
3. Updates the row matching both `id` and `user_id` (RLS-safe double check)
4. Revalidates the path

### deleteTimeLogAction

1. Authenticates the user
2. Deletes the row matching both `id` and `user_id`
3. Revalidates the path

## Validation Schema

Defined in `lib/validations/time-log.ts` using [[System|Zod]]:

```typescript
timeLogSchema = z.object({
  project_id: z.string().uuid().or(z.literal('')).default(''),
  task_id:    z.string().uuid().or(z.literal('')).default(''),
  description: z.string().max(1000).default(''),
  hours:      z.coerce.number().positive('Hours must be greater than 0'),
  date:       z.string().min(1, 'Date is required'),
  billable:   z.boolean().default(true),
})
```

Key rules:
- `project_id` and `task_id` accept either a valid UUID or an empty string (no project/task)
- `hours` is coerced from string input and must be positive
- `date` is a non-empty string (formatted as `YYYY-MM-DD`)
- `billable` defaults to `true`

## Data Model

The `time_logs` table in [[System|Supabase]]:

| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK, auto-generated |
| `user_id` | uuid | FK to `profiles`, NOT NULL, cascade delete |
| `project_id` | uuid | FK to [[Projects]], cascade delete |
| `task_id` | uuid | FK to [[Tasks]], set null on delete |
| `description` | text | Optional |
| `hours` | numeric | CHECK > 0 |
| `date` | date | NOT NULL |
| `billable` | boolean | Default true |
| `invoiced` | boolean | Default false |
| `created_at` | timestamptz | Default now() |

RLS is enabled with user-scoped CRUD policies (`user_id = auth.uid()`).

The `invoiced` flag is stored in the database but is not currently toggled from the time tracking UI -- it is set when time logs are pulled into [[Invoices]].

## Related Modules

- [[Projects]] -- time logs are optionally linked to a project
- [[Tasks]] -- time logs are optionally linked to a task (scoped to project)
- [[Invoices]] -- billable time logs can be pulled into invoice line items
- [[System]] -- uses Supabase server client, Zod validation, dayjs for dates
