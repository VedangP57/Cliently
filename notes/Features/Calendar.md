# Calendar

The Calendar module provides a monthly view that aggregates deadlines from [[Projects]], [[Tasks]], and [[Invoices]] into a single visual timeline with color-coded event dots and a detail sidebar.

## Data Sources

The calendar page (`app/(dashboard)/dashboard/calendar/page.tsx`) is a **server component** that runs three parallel Supabase queries, all scoped to the authenticated user and filtering out rows where the date column is null:

| Source | Query | Date Column | Event Type |
|---|---|---|---|
| `projects` | `id, title, deadline` where `deadline IS NOT NULL` | `deadline` | `project` |
| `tasks` | `id, title, due_date` where `due_date IS NOT NULL` | `due_date` | `task` |
| `invoices` | `id, invoice_number, due_date` where `due_date IS NOT NULL` | `due_date` | `invoice` |

Each query result is mapped into a `CalendarEvent` object:

```typescript
interface CalendarEvent {
  id: string        // prefixed: "project-{uuid}", "task-{uuid}", "invoice-{uuid}"
  title: string     // project title, task title, or "Invoice {number}"
  date: string      // the deadline/due_date value
  href: string      // navigation link to the relevant detail page
  type: CalendarEventType  // 'project' | 'task' | 'invoice'
  time?: string
  description?: string
}
```

Navigation links:
- Projects link to `/dashboard/projects/{id}`
- Tasks link to `/dashboard/tasks` (the global kanban/list page)
- Invoices link to `/dashboard/invoices/{id}`

All three event arrays are concatenated and passed as a single `events` prop to `CalendarView`.

## CalendarView Component

`components/calendar/CalendarView.tsx` is a `'use client'` component. It manages two pieces of state: `currentMonth` (a `dayjs` object at the start of a month) and `selectedDate` (a `YYYY-MM-DD` string, defaulting to today).

### Color Coding

Events are styled by type using two mappings:

**Background badges** (inside calendar cells):
- `project` -- blue: `bg-blue-100 text-blue-800` / `dark:bg-blue-900/40 dark:text-blue-200`
- `task` -- yellow: `bg-yellow-100 text-yellow-800` / `dark:bg-yellow-900/40 dark:text-yellow-200`
- `invoice` -- red: `bg-red-100 text-red-800` / `dark:bg-red-900/40 dark:text-red-200`

**Left border** (in the sidebar detail cards):
- `project` -- `border-l-blue-500`
- `task` -- `border-l-yellow-500`
- `invoice` -- `border-l-red-500`

**Labels** displayed in sidebar badges:
- `project` -- "Project deadline"
- `task` -- "Task due"
- `invoice` -- "Invoice due"

### Month Grid

The grid uses a 7-column layout (Sun--Sat) with 42 cells (6 weeks), built by `buildMonthCells()`:
1. Takes the first day of the current month
2. Finds the start of that week (Sunday)
3. Generates 42 consecutive days from that start

Each cell renders:
- The day number (highlighted in primary color if today)
- An event count badge (if any events exist on that day)
- Up to 2 event title chips with the type-specific background color
- A "+N more" overflow indicator if more than 2 events

Cell styling:
- Days outside the current month get `bg-muted/40 text-muted-foreground`
- Today's cell gets `border-primary/60`
- The selected cell gets `border-primary ring-2 ring-primary/20`

### Navigation

- **Previous/Next month** buttons shift `currentMonth` by one month
- **Today** button resets to the current month and selects today's date
- Clicking any cell sets that cell as the selected date

### Event Sidebar

A right-side card (320px on `lg:` screens, stacked below on mobile) shows events for the selected date:
- Header: formatted date (e.g., "Friday, Apr 11")
- If no events: "No events for this day."
- Each event renders as a clickable `Link` card with:
  - Left color border matching event type
  - Event title
  - Optional description (2-line clamp)
  - Type badge + optional time
  - External link icon
  - Navigates to the `href` defined in the event data

### Layout

The component uses a responsive grid:
- `lg:` and above: side-by-side layout (`1fr 320px`), full viewport height minus 110px
- Below `lg:`: stacked vertically (calendar on top, sidebar below)

Both the calendar grid and sidebar have hidden scrollbars with overflow-y-auto.

## Events Indexing

Events are indexed by date using a `Map<string, CalendarEvent[]>` built in a `useMemo`. The key is the `YYYY-MM-DD` formatted date. This provides O(1) lookup when rendering each cell or the sidebar.

## Key Files

| File | Purpose |
|---|---|
| `app/(dashboard)/dashboard/calendar/page.tsx` | Server component, fetches events from 3 tables |
| `components/calendar/CalendarView.tsx` | Client component, renders month grid + sidebar |

## Related

- [[Projects]] -- project deadlines appear as blue events
- [[Tasks]] -- task due dates appear as yellow events
- [[Invoices]] -- invoice due dates appear as red events
- [[System]] -- uses `dayjs` for date math, `cn()` for conditional class merging
