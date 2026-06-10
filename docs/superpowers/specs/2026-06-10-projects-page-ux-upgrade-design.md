# Projects Page UX Upgrade — Design Spec

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Upgrade the `/dashboard/projects` page with stat cards, sortable table, hover-reveal actions, board view, and bulk actions.

**Architecture:** All changes are confined to `components/projects/ProjectTable.tsx` and a new `components/projects/ProjectBoardView.tsx`. Shared types live in `types/index.ts` (already exists). No new API routes needed — all data is passed as props or derived client-side.

**Tech Stack:** Next.js 14 App Router, Ant Design v6, Tailwind CSS, TypeScript, localStorage for view persistence.

---

## Section 1: Stat Cards

Four summary cards rendered between the header bar and the table/board area.

### Cards
| Card | Value | Color accent |
|------|-------|-------------|
| Total Projects | `projects.length` | neutral/primary |
| In Progress | count where `status === 'in_progress'` | blue |
| Completed | count where `status === 'completed'` | green |
| On Hold | count where `status === 'on_hold'` | orange |

### Behavior
- Each card is a clickable `<button>`.
- Clicking a card sets `statusFilter` to that status value (e.g. `'in_progress'`). Total card resets to `'all'`.
- The active card (whose filter matches current `statusFilter`) shows a colored left border (`border-l-4`) and a slightly darker background.
- Cards display: large count number (font-bold text-2xl), small label below (text-sm text-muted-foreground), colored dot left of label matching status badge color.
- Layout: 4 cards in a horizontal row (`grid grid-cols-4 gap-3`), within the table area above the antd Table.
- On mobile: 2 columns (`grid-cols-2`).

### Implementation notes
- Derive counts inside `ProjectTable` from the full `projects` prop (not `filtered`) so counts always reflect totals, not current filter state.
- Stat card row sits inside the flex-1 table section div, above the antd Table wrapper, wrapped in a `shrink-0` div with `px-5 pt-4 pb-3`.

---

## Section 2: Table Improvements

### 2a: Row hover highlight
- Add `onRow` prop to antd Table: `onRow={(record) => ({ onClick: () => router.push(...), className: 'cursor-pointer group' })}`.
- CSS in `globals.css`: `.clients-table .ant-table-tbody .ant-table-row:hover .ant-table-cell { background-color: hsl(var(--muted)) !important; }`.

### 2b: Row click navigation
- `onRow` handler calls `router.push(`/dashboard/projects/${record.id}`)` on click.
- Action button clicks call `e.stopPropagation()` to prevent row navigation from firing.

### 2c: Sortable columns
- Add state: `const [sortKey, setSortKey] = useState<'title' | 'deadline' | 'budget' | null>(null)` and `const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')`.
- Sort logic applied after filtering, before slicing for pagination:
  ```ts
  const sorted = sortKey ? [...filtered].sort((a, b) => { ... }) : filtered
  const paginatedData = sorted.slice(...)
  ```
- Title sorts alphabetically. Deadline sorts by date string (ISO). Budget sorts numerically (null budgets go last).
- Columns Title, Deadline, Budget get `sorter: true` and `sortOrder` props fed from state. Use antd's built-in `onChange` on the Table to capture sort state: `onChange={(_, __, sorter) => { ... }}`.
- Clicking a column header toggles asc/desc; clicking a different column resets to asc on the new column.

---

## Section 3: Hover-Reveal Action Buttons

- The action `<div>` in the render function gets class `opacity-0 group-hover:opacity-100 transition-opacity duration-150`.
- `group` class is set on the row via `onRow` (see 2b above) — antd applies `className` from `onRow` to the `<tr>`.
- On touch devices (mobile), actions remain always visible: add `sm:opacity-0 sm:group-hover:opacity-100` so on small screens opacity is always 1.
- Each action button already calls `e.stopPropagation()` to prevent row click.

---

## Section 4: Board View

### Toggle
- State: `const [view, setView] = useState<'table' | 'board'>(() => (localStorage.getItem('projects-view') as 'table' | 'board') ?? 'table')`.
- Two icon buttons in the header bar (left of "+ New Project"): `<LayoutList>` for table, `<LayoutGrid>` for board. Active button gets `bg-muted` background.
- On toggle: `setView(v); localStorage.setItem('projects-view', v)`.
- `localStorage` read is in the `useState` initializer — safe because `ProjectTable` is a client component.

### Board layout (`components/projects/ProjectBoardView.tsx`)
- Props: `{ projects: Project[], clients: Client[], onEdit: (p: Project) => void, onDelete: (id: string) => void }`.
- Status columns in order: `planning`, `in_progress`, `review`, `completed`, `on_hold`, `cancelled`.
- Layout: horizontal scrollable flex row (`flex gap-4 overflow-x-auto pb-4`). Each column: `min-w-[260px] flex flex-col`.
- Column header: status label + count badge (e.g. "In Progress · 12").
- Each project card: white/card background, rounded-lg, border, p-4, shadow-sm. Shows:
  - Title as a `<Link>` to `/dashboard/projects/[id]`
  - Client name (text-sm text-muted-foreground)
  - Deadline (text-xs, with a calendar icon)
  - Budget (text-xs)
  - Three action icon buttons (always visible, same as table view)
- `filtered` prop is passed in from ProjectTable so search/filter/stat card filters apply to board view too.
- Board view has no pagination — all filtered projects shown.

---

## Section 5: Bulk Actions (Table View Only)

### Checkbox column
- Add state: `const [selectedIds, setSelectedIds] = useState<string[]>([])`.
- First column in table: `{ key: 'select', width: 40, render: (_, record) => <Checkbox checked={selectedIds.includes(record.id)} onChange={...} onClick={e => e.stopPropagation()} />, title: <Checkbox indeterminate={...} checked={allSelected} onChange={toggleAll} /> }`.
- `toggleAll` checks/unchecks all rows on current page only.
- Selecting rows does NOT trigger row navigation.

### Bulk action bar
- Rendered between the table and pagination, `shrink-0`, only visible when `selectedIds.length > 0`.
- Left side: `"{n} selected"` text.
- Right side: 
  - **Change Status** — antd `Select` with all status options; on change calls a new `bulkUpdateStatus(ids, status)` server action that updates all selected projects.
  - **Delete** — red button; opens `ConfirmDialog`; on confirm calls `deleteProjectAction` for each id in sequence, then `router.refresh()`.
- Bar animates in with a slide-up: `transition-all duration-200`.
- Changing page or applying a filter clears `selectedIds`.

### Server action
- `bulkUpdateStatus(ids: string[], status: string)` added to `lib/actions/projects.ts`: batch update via `supabase.from('projects').update({ status }).in('id', ids).eq('user_id', user.id)`.

---

## Files Changed

| File | Change |
|------|--------|
| `components/projects/ProjectTable.tsx` | Stat cards, sort state, onRow handler, view toggle, bulk state + bar, board/table conditional render |
| `components/projects/ProjectBoardView.tsx` | **New file** — board view component |
| `app/globals.css` | Row hover background rule |
| `lib/actions/projects.ts` | Add `bulkUpdateStatus` server action |

---

## Out of Scope
- Drag-and-drop between board columns
- Cross-page bulk selection
- Saving board column order
- Inline editing
