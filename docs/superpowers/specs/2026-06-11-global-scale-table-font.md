# Global Scale + Table Font Reduction — Spec

**Date:** 2026-06-11  
**Goal:** Make the entire app look like 90% browser zoom at 100%, and additionally reduce the projects table font size slightly.

---

## Changes

### 1. `app/globals.css`

Add to the `body` rule (or as a standalone rule if `body` doesn't exist yet):

```css
body {
  zoom: 0.9;
}
```

This applies the same scaling as 90% browser zoom to every page — sidebar, buttons, text, icons, modals.

### 2. `components/projects/ProjectTable.tsx`

The existing module-scope constant:
```tsx
const TABLE_DENSITY_THEME = { components: { Table: { cellPaddingBlockSM: 2 } } } as const
```

Add `cellFontSizeSM: 11` to reduce the small-size table cell font from 12px to 11px:
```tsx
const TABLE_DENSITY_THEME = { components: { Table: { cellPaddingBlockSM: 2, cellFontSizeSM: 11 } } } as const
```

---

## What does NOT change

- Any component logic, state, or behavior
- Any other file in the codebase
- The zoom does not require any layout adjustments — `zoom` on `body` causes the browser to expand the scrollable area to fill the viewport, so no dead space or overflow occurs

---

## Success Criteria

- At 100% browser zoom the app looks visually equivalent to the current 90% zoom appearance
- The projects table text is slightly smaller than other text in the app (11px effective after zoom = ~9.9px rendered)
- No layout regressions on any page
