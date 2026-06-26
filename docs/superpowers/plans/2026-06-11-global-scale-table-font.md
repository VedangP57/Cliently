# Global Scale + Table Font Reduction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the entire app look like 90% browser zoom at 100%, and reduce the projects table font size slightly.

**Architecture:** Two isolated one-line changes — `zoom: 0.9` on the existing `body` rule in globals.css, and `cellFontSizeSM: 11` added to the existing `TABLE_DENSITY_THEME` constant in ProjectTable.tsx.

**Tech Stack:** Next.js App Router, Tailwind CSS, Ant Design v6

---

## File Map

| File | Change |
|---|---|
| `app/globals.css` | Add `zoom: 0.9` to existing `body` rule (line 156) |
| `components/projects/ProjectTable.tsx` | Add `cellFontSizeSM: 11` to `TABLE_DENSITY_THEME` constant |

---

### Task 1: Add `zoom: 0.9` to body

**Files:**
- Modify: `app/globals.css:156-159`

- [ ] **Step 1: Add zoom to the existing body rule**

Find the existing `body` rule at line 156:
```css
body {
  @apply bg-background text-foreground;
  font-family: 'Avenir LT Pro', system-ui, -apple-system, sans-serif;
}
```

Change it to:
```css
body {
  @apply bg-background text-foreground;
  font-family: 'Avenir LT Pro', system-ui, -apple-system, sans-serif;
  zoom: 0.9;
}
```

- [ ] **Step 2: Verify visually**

Open `http://localhost:3000/dashboard/projects` at 100% browser zoom. The entire page — sidebar, buttons, text, stat chips, table — should appear 10% smaller, matching the current 90% zoom appearance.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "fix(layout): scale entire app to 90% zoom via body zoom property"
```

---

### Task 2: Reduce projects table font size

**Files:**
- Modify: `components/projects/ProjectTable.tsx`

- [ ] **Step 1: Add cellFontSizeSM to TABLE_DENSITY_THEME**

Find the existing constant (near line 52):
```tsx
const TABLE_DENSITY_THEME = { components: { Table: { cellPaddingBlockSM: 2 } } } as const
```

Change it to:
```tsx
const TABLE_DENSITY_THEME = { components: { Table: { cellPaddingBlockSM: 2, cellFontSizeSM: 11 } } } as const
```

- [ ] **Step 2: Verify visually**

Open `http://localhost:3000/dashboard/projects` at 100% zoom. The table cell text should appear slightly smaller than the surrounding UI (sidebar nav items, stat chip labels, etc.).

- [ ] **Step 3: Commit**

```bash
git add components/projects/ProjectTable.tsx
git commit -m "fix(projects): reduce table cell font size to 11px via ConfigProvider token"
```
