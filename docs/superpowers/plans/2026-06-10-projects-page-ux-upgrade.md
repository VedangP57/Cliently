# Projects Page UX Upgrade — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade `/dashboard/projects` with stat cards, sortable table, hover-reveal actions, board view toggle, and bulk actions.

**Architecture:** All changes are in `components/projects/ProjectTable.tsx` (state, layout, table config) and a new `components/projects/ProjectBoardView.tsx` (board layout). One new server action in `lib/actions/projects.ts`. One CSS rule in `app/globals.css`.

**Tech Stack:** Next.js 14 App Router, Ant Design v6, Tailwind CSS, TypeScript, localStorage (view persistence), Supabase (bulk update action).

---

## File Map

| File | Action | What changes |
|------|--------|-------------|
| `components/projects/ProjectTable.tsx` | Modify | Stat cards, sort state, view toggle, onRow, hover-reveal, bulk state + bar |
| `components/projects/ProjectBoardView.tsx` | Create | Board grouped-by-status card layout |
| `lib/actions/projects.ts` | Modify | Add `bulkUpdateStatusAction` |
| `app/globals.css` | Modify | Row hover background rule |

---

## Task 1: Stat Cards

**Files:**
- Modify: `components/projects/ProjectTable.tsx`

**Context:** `ProjectTable` receives `projects: Project[]` (all projects, unfiltered). Counts are always derived from this full array so they reflect totals, not the current filtered view. The stat cards slot in as a `shrink-0` section between the header bar and the table wrapper.

- [ ] **Step 1: Add stat card counts above the `filtered` derivation**

In `ProjectTable`, add these derived counts right after the existing state declarations (after line `const router = useRouter()`):

```tsx
const inProgressCount = projects.filter(p => p.status === 'in_progress').length
const completedCount = projects.filter(p => p.status === 'completed').length
const onHoldCount = projects.filter(p => p.status === 'on_hold').length
```

- [ ] **Step 2: Add the stat cards JSX between the header div and the table wrapper div**

The outer wrapper currently has two children: a header `<div>` and a table `<div>`. Insert a new `<div>` between them:

```tsx
{/* Stat cards */}
<div className="shrink-0 grid grid-cols-2 sm:grid-cols-4 gap-3 px-5 pt-4 pb-2">
  {[
    { label: 'Total Projects', count: projects.length, dot: 'bg-primary', value: 'all' },
    { label: 'In Progress', count: inProgressCount, dot: 'bg-blue-500', value: 'in_progress' },
    { label: 'Completed', count: completedCount, dot: 'bg-green-500', value: 'completed' },
    { label: 'On Hold', count: onHoldCount, dot: 'bg-orange-400', value: 'on_hold' },
  ].map(({ label, count, dot, value }) => (
    <button
      key={value}
      onClick={() => handleFilterChange(setStatusFilter)(value)}
      className={[
        'flex flex-col gap-1 p-4 rounded-lg border bg-card text-left transition-all',
        statusFilter === value
          ? 'border-l-4 border-primary bg-primary/5'
          : 'hover:bg-muted/50',
      ].join(' ')}
    >
      <span className="text-2xl font-bold">{count}</span>
      <div className="flex items-center gap-1.5">
        <span className={`w-2 h-2 rounded-full ${dot}`} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    </button>
  ))}
</div>
```

- [ ] **Step 3: Verify in browser**

Open `http://localhost:3000/dashboard/projects`. You should see 4 cards above the table. Clicking "In Progress" should filter the table. Clicking "Total Projects" resets to all.

- [ ] **Step 4: Commit**

```bash
git add components/projects/ProjectTable.tsx
git commit -m "feat(projects): add clickable stat cards above table"
```

---

## Task 2: Sortable Columns + Row Click Navigation

**Files:**
- Modify: `components/projects/ProjectTable.tsx`

**Context:** antd Table's `onChange` callback fires when sort changes (even with `pagination={false}`). We capture the sort field+order in state, apply a manual sort after filtering, then slice for pagination. `onRow` makes each row navigable and adds the Tailwind `group` class (needed for Task 3's hover-reveal).

- [ ] **Step 1: Add sort state and import `SorterResult`**

At the top of the file, add to the antd import:
```tsx
import type { SorterResult } from 'antd/es/table/interface'
```

Inside `ProjectTable`, add sort state after the existing `useState` declarations:
```tsx
const [sortField, setSortField] = useState<string | null>(null)
const [sortOrder, setSortOrder] = useState<'ascend' | 'descend' | null>(null)
```

- [ ] **Step 2: Replace the `paginatedData` derivation with sort-aware version**

Replace this existing line:
```tsx
const paginatedData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)
```

With:
```tsx
const sorted = (() => {
  if (!sortField || !sortOrder) return filtered
  return [...filtered].sort((a, b) => {
    if (sortField === 'title') {
      return sortOrder === 'ascend'
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title)
    }
    if (sortField === 'deadline') {
      const da = a.deadline ?? ''
      const db = b.deadline ?? ''
      return sortOrder === 'ascend' ? da.localeCompare(db) : db.localeCompare(da)
    }
    if (sortField === 'budget') {
      const ba = a.budget ?? -1
      const bb = b.budget ?? -1
      return sortOrder === 'ascend' ? ba - bb : bb - ba
    }
    return 0
  })
})()

const paginatedData = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize)
```

- [ ] **Step 3: Add `sorter` and `sortOrder` props to Title, Deadline, Budget columns**

Update the three sortable column definitions in the `columns` array:

```tsx
// Title column — add sorter and sortOrder:
{
  title: 'Title',
  dataIndex: 'title',
  key: 'title',
  align: 'center',
  sorter: true,
  sortOrder: sortField === 'title' ? sortOrder : null,
  render: (text, record) => (
    <Link
      href={`/dashboard/projects/${record.id}`}
      className="font-medium hover:underline text-[#5e5cc5] dark:text-[#a5a3e0]!"
      onClick={(e) => e.stopPropagation()}
    >
      {text}
    </Link>
  ),
},

// Deadline column — add sorter and sortOrder:
{
  title: 'Deadline',
  dataIndex: 'deadline',
  key: 'deadline',
  align: 'center',
  sorter: true,
  sortOrder: sortField === 'deadline' ? sortOrder : null,
  render: (date) => <span className="text-muted-foreground">{formatDate(date)}</span>,
},

// Budget column — add sorter and sortOrder:
{
  title: 'Budget',
  dataIndex: 'budget',
  key: 'budget',
  align: 'center',
  sorter: true,
  sortOrder: sortField === 'budget' ? sortOrder : null,
  render: (budget) => budget ? formatCurrency(budget) : '—',
},
```

- [ ] **Step 4: Add `onRow` and `onChange` to the `<Table>` component**

Update the `<Table>` JSX — add `onRow` and `onChange` props:

```tsx
<Table<Project>
  columns={columns}
  dataSource={paginatedData}
  rowKey="id"
  bordered
  size="small"
  pagination={false}
  scroll={{ x: 800, y: 'calc(100vh - 200px)' }}
  onRow={(record) => ({
    className: 'group cursor-pointer',
    onClick: () => router.push(`/dashboard/projects/${record.id}`),
  })}
  onChange={(_, __, sorter) => {
    const s = sorter as SorterResult<Project>
    setSortField(s.order ? (s.field as string) : null)
    setSortOrder(s.order ?? null)
    setCurrentPage(1)
  }}
/>
```

- [ ] **Step 5: Add row hover CSS to `app/globals.css`**

Append to the end of `app/globals.css`:
```css
/* Projects table — row hover highlight */
.clients-table .ant-table-tbody .ant-table-row:hover .ant-table-cell {
  background-color: hsl(var(--muted)) !important;
}
```

- [ ] **Step 6: Verify in browser**

- Click Title column header → rows sort A→Z, click again → Z→A
- Click Deadline column → sorts by date
- Click a row (not action buttons) → navigates to project detail page
- Rows highlight on hover

- [ ] **Step 7: Commit**

```bash
git add components/projects/ProjectTable.tsx app/globals.css
git commit -m "feat(projects): sortable columns and row click navigation"
```

---

## Task 3: Hover-Reveal Action Buttons

**Files:**
- Modify: `components/projects/ProjectTable.tsx`

**Context:** The `group` class is now on each `<tr>` via `onRow` (added in Task 2). Adding `sm:opacity-0 sm:group-hover:opacity-100` to the action buttons div makes them invisible by default on desktop (where hover works) but always visible on mobile (sm breakpoint and below = always visible). Each button needs `e.stopPropagation()` so clicks don't trigger row navigation.

- [ ] **Step 1: Update the Action column render function**

Replace the existing Action column render:

```tsx
{
  title: 'Action',
  key: 'actions',
  width: 140,
  align: 'center',
  render: (_, record) => (
    <div className="flex items-center justify-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150">
      <Tooltip title="View">
        <AntdButton
          type="text"
          size="small"
          className="flex items-center justify-center h-8 w-8 rounded-lg text-blue-500! hover:text-blue-600! hover:bg-transparent"
          icon={<ExternalLink className="h-3.5 w-3.5" />}
          onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/projects/${record.id}`) }}
        />
      </Tooltip>
      <Tooltip title="Edit">
        <AntdButton
          type="text"
          size="small"
          className="flex items-center justify-center h-8 w-8 rounded-lg text-amber-500! hover:text-amber-600! hover:bg-transparent"
          icon={<SquarePen className="h-3.5 w-3.5" />}
          onClick={(e) => { e.stopPropagation(); openEdit(record) }}
        />
      </Tooltip>
      <Tooltip title="Delete">
        <AntdButton
          type="text"
          size="small"
          className="flex items-center justify-center h-8 w-8 rounded-lg text-red-500! hover:text-red-600! hover:bg-transparent"
          icon={<Trash className="h-3.5 w-3.5" />}
          onClick={(e) => { e.stopPropagation(); setDeleteId(record.id) }}
        />
      </Tooltip>
    </div>
  ),
},
```

- [ ] **Step 2: Verify in browser**

Hover a row — the three action icons should fade in. Move mouse away — they fade out. On a row you're not hovering, icons should be invisible.

- [ ] **Step 3: Commit**

```bash
git add components/projects/ProjectTable.tsx
git commit -m "feat(projects): hover-reveal action buttons on table rows"
```

---

## Task 4: Board View Component

**Files:**
- Create: `components/projects/ProjectBoardView.tsx`

**Context:** This component receives the already-filtered `projects` array (so search/filter/stat card filters apply). It groups them by status into columns. Clients array is passed to look up client names. `onEdit` and `onDelete` callbacks are passed from `ProjectTable` so the same modal/confirm dialog logic works.

- [ ] **Step 1: Create `components/projects/ProjectBoardView.tsx`**

```tsx
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button as AntdButton, Tooltip } from 'antd'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { SquarePen, Trash, ExternalLink, Calendar } from 'lucide-react'
import type { Project, Client } from '@/types'

const STATUS_COLUMNS: { key: Project['status']; label: string }[] = [
  { key: 'planning', label: 'Planning' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'review', label: 'Review' },
  { key: 'completed', label: 'Completed' },
  { key: 'on_hold', label: 'On Hold' },
  { key: 'cancelled', label: 'Cancelled' },
]

interface ProjectBoardViewProps {
  projects: Project[]
  clients: Client[]
  onEdit: (project: Project) => void
  onDelete: (id: string) => void
}

export function ProjectBoardView({ projects, clients, onEdit, onDelete }: ProjectBoardViewProps) {
  const router = useRouter()

  return (
    <div className="flex gap-4 overflow-x-auto overflow-y-hidden h-full pb-2 px-5">
      {STATUS_COLUMNS.map(({ key, label }) => {
        const colProjects = projects.filter(p => p.status === key)
        return (
          <div key={key} className="min-w-[260px] max-w-[260px] flex flex-col gap-2">
            <div className="flex items-center gap-2 px-1 shrink-0">
              <StatusBadge status={key} />
              <span className="text-xs text-muted-foreground font-medium">{colProjects.length}</span>
            </div>
            <div className="flex flex-col gap-2 overflow-y-auto">
              {colProjects.length === 0 && (
                <div className="text-xs text-muted-foreground text-center py-6 border border-dashed border-border rounded-lg">
                  No projects
                </div>
              )}
              {colProjects.map(project => {
                const client = clients.find(c => c.id === project.client_id)
                return (
                  <div key={project.id} className="bg-card border border-border rounded-lg p-3 shadow-sm">
                    <Link
                      href={`/dashboard/projects/${project.id}`}
                      className="font-medium text-sm hover:underline text-[#5e5cc5] dark:text-[#a5a3e0]! block mb-1 leading-snug"
                    >
                      {project.title}
                    </Link>
                    {client && (
                      <p className="text-xs text-muted-foreground mb-2">{client.name}</p>
                    )}
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-2">
                      {project.deadline && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(project.deadline)}
                        </span>
                      )}
                      {project.budget && <span>{formatCurrency(project.budget)}</span>}
                    </div>
                    <div className="flex items-center gap-0.5">
                      <Tooltip title="View">
                        <AntdButton
                          type="text" size="small"
                          className="h-7 w-7 flex items-center justify-center text-blue-500! hover:bg-transparent"
                          icon={<ExternalLink className="h-3 w-3" />}
                          onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                        />
                      </Tooltip>
                      <Tooltip title="Edit">
                        <AntdButton
                          type="text" size="small"
                          className="h-7 w-7 flex items-center justify-center text-amber-500! hover:bg-transparent"
                          icon={<SquarePen className="h-3 w-3" />}
                          onClick={() => onEdit(project)}
                        />
                      </Tooltip>
                      <Tooltip title="Delete">
                        <AntdButton
                          type="text" size="small"
                          className="h-7 w-7 flex items-center justify-center text-red-500! hover:bg-transparent"
                          icon={<Trash className="h-3 w-3" />}
                          onClick={() => onDelete(project.id)}
                        />
                      </Tooltip>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Add view toggle state and import to `ProjectTable.tsx`**

Add import at the top:
```tsx
import { LayoutList, LayoutGrid } from 'lucide-react'
import { ProjectBoardView } from '@/components/projects/ProjectBoardView'
```

Add view state inside `ProjectTable` (after other `useState` calls):
```tsx
const [view, setView] = useState<'table' | 'board'>(() => {
  if (typeof window === 'undefined') return 'table'
  return (localStorage.getItem('projects-view') as 'table' | 'board') ?? 'table'
})
```

- [ ] **Step 3: Add view toggle buttons to the header bar**

In the header's `<div className="flex flex-wrap items-center gap-2">`, add the toggle buttons just before the `<AntdButton>` "New Project" button:

```tsx
<div className="flex items-center border border-border rounded-lg overflow-hidden">
  <button
    onClick={() => { setView('table'); localStorage.setItem('projects-view', 'table') }}
    className={[
      'flex items-center justify-center h-8 w-8 transition-colors',
      view === 'table' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground',
    ].join(' ')}
    title="Table view"
  >
    <LayoutList className="h-4 w-4" />
  </button>
  <button
    onClick={() => { setView('board'); localStorage.setItem('projects-view', 'board') }}
    className={[
      'flex items-center justify-center h-8 w-8 transition-colors',
      view === 'board' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground',
    ].join(' ')}
    title="Board view"
  >
    <LayoutGrid className="h-4 w-4" />
  </button>
</div>
```

- [ ] **Step 4: Conditionally render table or board in the flex-1 section**

Replace the current table wrapper `<div>`:
```tsx
{/* Was: <div className="flex-1 min-h-0 user-table px-5 pt-5 clients-table"> */}
```

With:
```tsx
<div className="flex-1 min-h-0 overflow-hidden">
  {view === 'table' ? (
    <div className="h-full user-table px-5 pt-2 clients-table">
      <Table<Project>
        columns={columns}
        dataSource={paginatedData}
        rowKey="id"
        bordered
        size="small"
        pagination={false}
        scroll={{ x: 800, y: 'calc(100vh - 200px)' }}
        onRow={(record) => ({
          className: 'group cursor-pointer',
          onClick: () => router.push(`/dashboard/projects/${record.id}`),
        })}
        onChange={(_, __, sorter) => {
          const s = sorter as SorterResult<Project>
          setSortField(s.order ? (s.field as string) : null)
          setSortOrder(s.order ?? null)
          setCurrentPage(1)
        }}
      />
    </div>
  ) : (
    <div className="h-full pt-2">
      <ProjectBoardView
        projects={sorted}
        clients={clients}
        onEdit={openEdit}
        onDelete={(id) => setDeleteId(id)}
      />
    </div>
  )}
</div>
```

Also: the pagination bar should only show in table view. Wrap it:
```tsx
{view === 'table' && (
  <div className="shrink-0 flex items-center justify-between px-4 py-2 border-t border-border bg-background">
    <span className="text-sm text-muted-foreground">
      {filtered.length === 0
        ? '0 of 0'
        : `${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, filtered.length)} of ${filtered.length}`}
    </span>
    <Pagination
      current={currentPage}
      pageSize={pageSize}
      total={filtered.length}
      showSizeChanger
      pageSizeOptions={['10', '20', '50', '100']}
      onChange={(page, size) => {
        setCurrentPage(page)
        if (size !== pageSize) setPageSize(size)
      }}
    />
  </div>
)}
```

- [ ] **Step 5: Verify in browser**

- Toggle button appears in header bar (two icons)
- Clicking grid icon shows board: 6 columns, project cards with title/client/deadline/budget/actions
- Search and status filter apply to board view (columns update in real time)
- Clicking list icon returns to table view
- Refreshing the page preserves the last selected view

- [ ] **Step 6: Commit**

```bash
git add components/projects/ProjectTable.tsx components/projects/ProjectBoardView.tsx
git commit -m "feat(projects): board view with status columns and view toggle"
```

---

## Task 5: Bulk Actions

**Files:**
- Modify: `lib/actions/projects.ts`
- Modify: `components/projects/ProjectTable.tsx`

**Context:** A checkbox column is added as the first column in table view only. Selecting rows shows a floating action bar (above pagination) with "Change Status" select and "Delete" button. Bulk actions only affect the current page selection. Changing page, filter, or search clears the selection.

- [ ] **Step 1: Add `bulkUpdateStatusAction` to `lib/actions/projects.ts`**

Append to the end of `lib/actions/projects.ts`:

```ts
export async function bulkUpdateStatusAction(ids: string[], status: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('projects')
    .update({ status })
    .in('id', ids)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/projects')
  return { error: null }
}
```

- [ ] **Step 2: Add bulk state and import `Checkbox` in `ProjectTable.tsx`**

Add `Checkbox` to the antd import:
```tsx
import {
  Table, Button as AntdButton, Input, Select as AntdSelect,
  Tooltip, Pagination, Checkbox,
} from 'antd'
```

Add import for the new action:
```tsx
import { deleteProjectAction, bulkUpdateStatusAction } from '@/lib/actions/projects'
```

Add bulk state inside `ProjectTable` (after other `useState` calls):
```tsx
const [selectedIds, setSelectedIds] = useState<string[]>([])
const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
const [bulkUpdating, setBulkUpdating] = useState(false)
```

- [ ] **Step 3: Clear selection when page, filter, or search changes**

Update the existing `handleFilterChange` to also clear selection:
```tsx
function handleFilterChange(setter: (v: string) => void) {
  return (v: string) => {
    setter(v)
    setCurrentPage(1)
    setSelectedIds([])
  }
}
```

Update the search Input `onChange`:
```tsx
onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); setSelectedIds([]) }}
```

Update the Pagination `onChange`:
```tsx
onChange={(page, size) => {
  setCurrentPage(page)
  if (size !== pageSize) setPageSize(size)
  setSelectedIds([])
}}
```

- [ ] **Step 4: Add bulk handlers**

Add these two functions inside `ProjectTable` (after `openCreate`):

```tsx
async function handleBulkStatusChange(status: string) {
  setBulkUpdating(true)
  const result = await bulkUpdateStatusAction(selectedIds, status)
  setBulkUpdating(false)
  if (result.error) {
    toast({ title: 'Error', description: result.error, variant: 'destructive' })
  } else {
    toast({ title: `${selectedIds.length} projects updated` })
    setSelectedIds([])
    router.refresh()
  }
}

async function handleBulkDelete() {
  setBulkUpdating(true)
  for (const id of selectedIds) {
    await deleteProjectAction(id)
  }
  setBulkUpdating(false)
  setBulkDeleteOpen(false)
  setSelectedIds([])
  toast({ title: `${selectedIds.length} projects deleted` })
  router.refresh()
}
```

- [ ] **Step 5: Add checkbox as first column in table view**

Add a new first entry to the `columns` array (before the Title column):

```tsx
{
  key: 'select',
  width: 40,
  align: 'center' as const,
  title: (
    <Checkbox
      checked={paginatedData.length > 0 && paginatedData.every(p => selectedIds.includes(p.id))}
      indeterminate={
        paginatedData.some(p => selectedIds.includes(p.id)) &&
        !paginatedData.every(p => selectedIds.includes(p.id))
      }
      onChange={(e) => {
        if (e.target.checked) {
          setSelectedIds(paginatedData.map(p => p.id))
        } else {
          setSelectedIds([])
        }
      }}
    />
  ),
  render: (_: unknown, record: Project) => (
    <Checkbox
      checked={selectedIds.includes(record.id)}
      onChange={(e) => {
        e.nativeEvent.stopImmediatePropagation()
        if (e.target.checked) {
          setSelectedIds(prev => [...prev, record.id])
        } else {
          setSelectedIds(prev => prev.filter(id => id !== record.id))
        }
      }}
      onClick={(e) => e.stopPropagation()}
    />
  ),
},
```

- [ ] **Step 6: Add the bulk action bar and confirm dialog**

In the JSX, between the table wrapper `<div>` and the pagination `{view === 'table' && ...}`, add:

```tsx
{view === 'table' && selectedIds.length > 0 && (
  <div className="shrink-0 flex items-center justify-between px-4 py-2 border-t border-primary/30 bg-primary/5 transition-all duration-200">
    <span className="text-sm font-medium text-foreground">{selectedIds.length} selected</span>
    <div className="flex items-center gap-2">
      <AntdSelect
        size="small"
        placeholder="Change status…"
        className="w-[150px]"
        loading={bulkUpdating}
        onChange={handleBulkStatusChange}
        value={null}
        options={[
          { label: 'Planning', value: 'planning' },
          { label: 'In Progress', value: 'in_progress' },
          { label: 'Review', value: 'review' },
          { label: 'Completed', value: 'completed' },
          { label: 'On Hold', value: 'on_hold' },
          { label: 'Cancelled', value: 'cancelled' },
        ]}
      />
      <AntdButton
        danger
        size="small"
        loading={bulkUpdating}
        onClick={() => setBulkDeleteOpen(true)}
      >
        Delete
      </AntdButton>
    </div>
  </div>
)}
```

Also add the bulk delete `ConfirmDialog` after the existing one:

```tsx
<ConfirmDialog
  open={bulkDeleteOpen}
  onOpenChange={(open) => !open && setBulkDeleteOpen(false)}
  title={`Delete ${selectedIds.length} projects`}
  description={`This will permanently delete ${selectedIds.length} projects and all their tasks. This cannot be undone.`}
  onConfirm={handleBulkDelete}
  loading={bulkUpdating}
/>
```

- [ ] **Step 7: Verify in browser**

- Checkboxes appear as first column in table view
- Checking rows shows the bulk action bar between table and pagination
- "Change Status" dropdown updates all selected projects and refreshes the table
- "Delete" opens confirm dialog; confirming deletes all selected and clears selection
- Switching page or changing a filter clears selection
- Board view has no checkboxes

- [ ] **Step 8: Commit**

```bash
git add components/projects/ProjectTable.tsx lib/actions/projects.ts
git commit -m "feat(projects): bulk select, status change, and delete actions"
```

---

## Done

All 5 tasks complete. The projects page now has:
- Stat cards with click-to-filter
- Sortable columns (Title, Deadline, Budget)
- Row hover highlight + click to navigate
- Hover-reveal action buttons (fade in on hover)
- Table / Board view toggle persisted in localStorage
- Bulk checkbox select with status change and delete
