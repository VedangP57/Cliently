# Tasks

The Tasks module provides task management with a Kanban board (drag-and-drop), a table view, filtering, and a modal for creating/editing tasks. Tasks can optionally belong to a [[Projects|project]].

## Data Model

Database table: `tasks`

| Column       | Type        | Constraint / Default                              |
|--------------|-------------|---------------------------------------------------|
| `id`         | `uuid`      | PK, `gen_random_uuid()`                           |
| `user_id`    | `uuid`      | FK -> `profiles.id`, NOT NULL, RLS-scoped         |
| `project_id` | `uuid`      | FK -> `projects.id`, ON DELETE CASCADE, nullable   |
| `title`      | `text`      | NOT NULL                                          |
| `description`| `text`      | nullable                                          |
| `status`     | `text`      | `todo`, `in_progress`, `in_review`, `done`        |
| `priority`   | `text`      | `low`, `medium`, `high`, `urgent` (default `medium`) |
| `due_date`   | `date`      | nullable                                          |
| `position`   | `integer`   | default `0`, used for ordering within columns     |
| `created_at` | `timestamptz` | default `now()`                                 |

RLS is enabled. All queries filter by `user_id = auth.uid()`.

## Validation Rules

Defined in `lib/validations/task.ts` using Zod (`taskSchema`):

- **title** -- required string, min 1 char, max 200 chars
- **project_id** -- optional UUID (or empty string)
- **description** -- optional string, max 5000 chars (or empty string)
- **status** -- enum `todo | in_progress | in_review | done`, defaults to `todo`
- **priority** -- enum `low | medium | high | urgent`, defaults to `medium`
- **due_date** -- optional string (or empty string)

Validation runs both client-side (react-hook-form + zodResolver) and server-side (safeParse in every server action).

## Server Actions

All actions live in `lib/actions/tasks.ts`. Each action authenticates the user via `supabase.auth.getUser()` and calls `revalidatePath('/dashboard/tasks')` after mutation.

### `createTaskAction(data)`
- Validates with `taskSchema.safeParse`
- Calls `ensureProfile(user)` to guarantee the profile row exists
- Queries the max `position` value for the target status column, then inserts at `maxPosition + 1`
- Returns `{ data: task, error: null }` on success

### `updateTaskAction(id, data)`
- Validates, then updates the task where `id` and `user_id` both match
- Does **not** recalculate position (preserves current position)

### `updateTaskStatusAction(id, status, position)`
- Lightweight action used by drag-and-drop: updates only `status` and `position`
- No Zod validation on the full form -- just auth + direct update

### `deleteTaskAction(id)`
- Deletes the task where `id` and `user_id` match

## Page Architecture

**Route:** `/dashboard/tasks`
**File:** `app/(dashboard)/dashboard/tasks/page.tsx`

The page is a **server component** that fetches tasks and projects in parallel:

- Tasks: `select('*, project:projects(title)')` ordered by `position`
- Projects: filtered to active statuses (`planning`, `in_progress`, `review`), ordered by `title`

Data is passed to `TasksWrapper`, a client component that manages all client-side state.

## Views

### Kanban Board (default)

`components/tasks/KanbanBoard.tsx`

Four columns rendered in a CSS grid:

| Column       | Status DB value | Label       |
|--------------|-----------------|-------------|
| 1            | `todo`          | To Do       |
| 2            | `in_progress`   | In Progress |
| 3            | `in_review`     | In Review   |
| 4            | `done`          | Done        |

Each column is a `DroppableColumn` using `useDroppable` from `@dnd-kit/core`. Tasks within columns are wrapped in `SortableContext` with `verticalListSortingStrategy`.

**Drag-and-drop flow:**
1. `onDragStart` -- stores the active task in state for the `DragOverlay`
2. `onDragOver` -- determines the target column (either directly over a column or over a task in a column) and optimistically updates the task's status in local state
3. `onDragEnd` -- calculates the new position (appended to end of target column) and calls `updateTaskStatusAction`

The `PointerSensor` has an activation constraint of 5px distance to avoid accidental drags when clicking.

**`DragOverlay`** renders a rotated shadow card showing the task title and priority badge while dragging.

**Responsive layout:** single column on mobile, 2 columns on `sm:`, 4 columns on `lg:`. On large screens, columns fill `calc(100vh - 145px)`.

### Task Cards

`components/tasks/TaskCard.tsx`

Each card in the Kanban board uses `useSortable` from `@dnd-kit/sortable`. Displays:
- Drag handle (GripVertical icon) -- stops click propagation so dragging does not trigger edit
- Task title
- Project name (if assigned)
- Priority badge via `StatusBadge`
- Due date formatted as "MMM D" (if set)

Clicking a card opens the edit modal.

### Table View

`components/tasks/TaskTable.tsx`

An Ant Design `Table` with columns: No., Title, Status, Priority, Project, and Actions (edit/delete). Pagination defaults to 50 rows with options for 20/30/50/100. Horizontal scroll at 1020px breakpoint.

## TasksWrapper (Client Orchestrator)

`components/tasks/TasksWrapper.tsx`

Manages all interactive state:

- **View toggle** -- Segmented control switches between `kanban` and `table` views (both rendered, toggled via `hidden` class for instant switching)
- **Search** -- filters tasks by title (case-insensitive)
- **Status filter** -- dropdown: All Status, To Do, In Progress, In Review, Done
- **Project filter** -- dropdown: All Projects, plus each active project by name
- **Create/Edit** -- opens `TaskModal`, passes `editingTask` or null
- **Delete** -- opens `ConfirmDialog`, then calls `deleteTaskAction` and removes from local state

## Task Modal

`components/tasks/TaskModal.tsx`

An Ant Design `Modal` (centered, 600px wide) containing a react-hook-form powered form.

**Fields:**
- Title (required) -- text input
- Project -- select dropdown (options from active projects, plus "No Project")
- Description -- textarea, 3 rows
- Status -- select: To Do / In Progress / In Review / Done
- Priority -- select: Low / Medium / High / Urgent
- Due Date -- native date input

The form resets when the modal opens: populates from the task when editing, or uses defaults (status defaults to `defaultStatus` prop if provided, otherwise `todo`; priority defaults to `medium`).

On submit, calls `createTaskAction` or `updateTaskAction`, shows a toast, resets the form, closes the modal, and calls `router.refresh()`.

## Priority Levels

| Priority | Badge Style                        |
|----------|------------------------------------|
| `low`    | gray background, gray text         |
| `medium` | blue background, blue text         |
| `high`   | orange background, orange text     |
| `urgent` | red background, red text           |

Priority badges use the shared `StatusBadge` component with the [[System]] status color map.

## Key Files

| File | Purpose |
|------|---------|
| `app/(dashboard)/dashboard/tasks/page.tsx` | Server component, data fetching |
| `components/tasks/TasksWrapper.tsx` | Client orchestrator, state, filters |
| `components/tasks/KanbanBoard.tsx` | Drag-and-drop board with @dnd-kit |
| `components/tasks/TaskCard.tsx` | Sortable card in Kanban columns |
| `components/tasks/TaskTable.tsx` | Ant Design table view |
| `components/tasks/TaskModal.tsx` | Create/edit modal with form |
| `lib/actions/tasks.ts` | Server actions (CRUD + status update) |
| `lib/validations/task.ts` | Zod schema and form types |

## Related

- [[Projects]] -- Tasks belong to projects via `project_id`. The project filter only shows projects in active statuses.
- [[Time-Tracking]] -- Time logs can reference a `task_id` for per-task time tracking.
- [[System]] -- Status badge colors, shared components (`StatusBadge`, `PageHeader`, `ConfirmDialog`), utility functions.
