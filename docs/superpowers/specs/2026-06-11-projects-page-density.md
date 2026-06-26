# Projects Page Density — Spec

**Date:** 2026-06-11  
**Goal:** Make the projects page at 100% browser zoom look as compact as it currently does at 90% zoom. The table must fit 20 rows in the visible body without internal scrolling on a standard 1440×900 viewport.

---

## Problem

At 100% zoom the layout is ~10% too spacious. Three areas contribute vertical waste:

| Area | Current | Target | Saving |
|---|---|---|---|
| Header wrapper padding | `pt-4 pb-3` (28px) | `pt-3 pb-2` (20px) | 8px |
| Stat cards wrapper padding | `pb-3` (12px) | `pb-2` (8px) | 4px |
| Stat card button vertical padding | `py-2` (16px total) | `py-1.5` (12px total) | 4px |
| Table row height (via cell padding) | `cellPaddingBlockSM: 4` → ~30px row | `cellPaddingBlockSM: 2` → ~26px row | 4px/row |

Total non-table saving: ~16px. Table body gains 4px × 20 rows = 80px less required height.

---

## Approach

Option A: ConfigProvider token override + CSS class tightening.

- Scoped `ConfigProvider` wrapping only the `<Table>` element with `Table: { cellPaddingBlockSM: 2 }`. Does not affect other Ant Design tables in the app.
- Padding reductions via Tailwind class changes on existing divs. No new components, no new files.

---

## Changes

### `components/projects/ProjectTable.tsx`

1. **Header wrapper** (line ~377):  
   `px-5 pb-3 pt-4` → `px-5 pb-2 pt-3`

2. **Stat cards wrapper** (line ~454):  
   `gap-2 px-5 pb-3` → `gap-2 px-5 pb-2`

3. **Stat card button** (line ~467):  
   `px-3 py-2 rounded-md ...` → `px-3 py-1.5 rounded-md ...`

4. **Table cell padding**:  
   Add `ConfigProvider` import from `antd`. Wrap `<Table<Project> ...>` in:
   ```jsx
   <ConfigProvider theme={{ components: { Table: { cellPaddingBlockSM: 2 } } }}>
     <Table<Project> ... />
   </ConfigProvider>
   ```

### No other files change.

---

## What does NOT change

- Pagination, column widths, sorting, filtering — all unchanged.
- Font sizes — unchanged.
- The `PageHeader` component itself — unchanged (padding lives in the wrapper div in `ProjectTable`, not in `PageHeader`).
- Board view — unaffected (ConfigProvider only wraps the table, stat card padding change is cosmetic).
- Any other page in the app.

---

## Success Criteria

- At 100% browser zoom on a ~900px viewport height, all 20 rows of page 1 are visible in the table body without the internal scrollbar activating.
- The page looks visually equivalent to the current 90% zoom appearance.
- No layout regression on the board view or other pages.
