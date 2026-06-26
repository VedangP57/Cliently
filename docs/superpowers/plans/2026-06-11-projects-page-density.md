# Projects Page Density Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the projects page at 100% browser zoom match its current appearance at 90% zoom, with 20 table rows fitting in the visible body.

**Architecture:** Three spacing reductions in `ProjectTable.tsx` (header wrapper, stat cards wrapper, stat card button) plus a scoped `ConfigProvider` token override that reduces Ant Design table cell padding from 4px to 2px vertically — all in one file.

**Tech Stack:** Next.js App Router, Ant Design v6, Tailwind CSS

---

## File Map

| File | Change |
|---|---|
| `components/projects/ProjectTable.tsx` | Padding class tweaks + ConfigProvider import + Table wrapper |

No other files change.

---

### Task 1: Tighten header and stat card padding

**Files:**
- Modify: `components/projects/ProjectTable.tsx`

- [ ] **Step 1: Tighten the header wrapper padding**

Find this line (~line 377):
```jsx
<div className="shrink-0 px-5 pb-3 pt-4 dark:border-white/10 ">
```
Change to:
```jsx
<div className="shrink-0 px-5 pb-2 pt-3 dark:border-white/10 ">
```

- [ ] **Step 2: Tighten the stat cards wrapper bottom padding**

Find this line (~line 454):
```jsx
<div className="shrink-0 grid grid-cols-3 sm:grid-cols-6 gap-2 px-5 pb-3">
```
Change to:
```jsx
<div className="shrink-0 grid grid-cols-3 sm:grid-cols-6 gap-2 px-5 pb-2">
```

- [ ] **Step 3: Tighten the stat card button vertical padding**

Find this line (~line 467):
```jsx
className="relative overflow-hidden flex items-center justify-between gap-2 px-3 py-2 rounded-md border border-[#e6e6e6] dark:border-white/10 bg-white dark:bg-[#1a1a1a] text-left transition-all cursor-pointer shadow-sm hover:border-[#c7c7c7] dark:hover:border-white/20"
```
Change `py-2` to `py-1.5`:
```jsx
className="relative overflow-hidden flex items-center justify-between gap-2 px-3 py-1.5 rounded-md border border-[#e6e6e6] dark:border-white/10 bg-white dark:bg-[#1a1a1a] text-left transition-all cursor-pointer shadow-sm hover:border-[#c7c7c7] dark:hover:border-white/20"
```

- [ ] **Step 4: Verify visually**

Open `http://localhost:3000/dashboard/projects` at 100% zoom. The header + stat chip row should appear noticeably more compact than before.

- [ ] **Step 5: Commit**

```bash
git add components/projects/ProjectTable.tsx
git commit -m "fix(projects): tighten header and stat card padding for 100% zoom density"
```

---

### Task 2: Reduce table row height via ConfigProvider token

**Files:**
- Modify: `components/projects/ProjectTable.tsx`

- [ ] **Step 1: Add ConfigProvider to the antd import**

Find the existing import block at the top of the file:
```tsx
import {
  App,
  Table,
  Button as AntdButton,
  Input,
  Select as AntdSelect,
  Tooltip,
  Pagination,
  Checkbox,
} from 'antd'
```
Add `ConfigProvider`:
```tsx
import {
  App,
  Table,
  Button as AntdButton,
  ConfigProvider,
  Input,
  Select as AntdSelect,
  Tooltip,
  Pagination,
  Checkbox,
} from 'antd'
```

- [ ] **Step 2: Wrap the Table element in a scoped ConfigProvider**

Find the `<Table<Project>` element (inside the `table-fill` div, ~line 497). It currently looks like:
```tsx
<Table<Project>
  columns={columns}
  dataSource={paginatedData}
  rowKey="id"
  bordered
  size="small"
  pagination={false}
  scroll={{ x: 800, y: tableScrollY }}
  onChange={(_, filters, sorter) => {
    ...
  }}
/>
```
Wrap it:
```tsx
<ConfigProvider theme={{ components: { Table: { cellPaddingBlockSM: 2 } } }}>
  <Table<Project>
    columns={columns}
    dataSource={paginatedData}
    rowKey="id"
    bordered
    size="small"
    pagination={false}
    scroll={{ x: 800, y: tableScrollY }}
    onChange={(_, filters, sorter) => {
      ...
    }}
  />
</ConfigProvider>
```

- [ ] **Step 3: Verify visually at 100% zoom**

Open `http://localhost:3000/dashboard/projects` at 100% zoom. Go to a page with 20 rows (e.g. page 1 with 20/page selected). All 20 rows should be visible in the table body without the internal scrollbar activating. The layout should match how it looked at 90% zoom.

- [ ] **Step 4: Verify board view is unaffected**

Switch to board view. Cards and layout should look normal — the ConfigProvider only wraps the Table element.

- [ ] **Step 5: Commit**

```bash
git add components/projects/ProjectTable.tsx
git commit -m "fix(projects): reduce table row height via ConfigProvider cellPaddingBlockSM token"
```
