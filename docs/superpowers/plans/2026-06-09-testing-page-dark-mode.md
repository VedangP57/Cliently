# Testing Page Dark Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `app/testing/page.tsx` respond correctly to light/dark theme by replacing hardcoded hex colors with `hsl(var(--token))` CSS variable references, and adding a Sun/Moon toggle button to the sticky nav bar.

**Architecture:** A single `useIsDark()` hook uses `MutationObserver` on `document.documentElement.classList` to track the active theme and exposes a `toggleTheme()` that follows the same `.dark` class + `localStorage` contract as the existing `AppThemeProvider`. All inline style color values that vary by theme are replaced with `hsl(var(--token))` values drawn from the CSS variables already defined in `globals.css`. The antd `ConfigProvider` inside `AntdThemeProvider` is already handled separately — no changes needed there.

**Tech Stack:** Next.js 14 App Router · React (useCallback, useEffect, useState) · antd v6 · `globals.css` CSS custom properties (HSL values without wrapper, so usage is `hsl(var(--token))`)

---

## Color Replacement Reference

Use this table when editing inline styles — old value → exact replacement:

| Old value | Replacement | Semantic |
|---|---|---|
| `"#f0f2f5"` | `"hsl(var(--background))"` | Page bg |
| `"#fff"` / `"#ffffff"` (container bg) | `"hsl(var(--card))"` | Elevated surface |
| `"#f5f5f5"` (fill bg) | `"hsl(var(--muted))"` | Subtle fill |
| `"#fafafa"` (fill bg) | `"hsl(var(--muted))"` | Subtle fill |
| `"#f0f0f0"` (accent fill) | `"hsl(var(--accent))"` | Neutral accent |
| `"#333"` | `"hsl(var(--foreground))"` | Primary text |
| `"#555"` | `"hsl(var(--muted-foreground))"` | Secondary text |
| `"#666"` | `"hsl(var(--muted-foreground))"` | Secondary text |
| `"#d9d9d9"` (border) | `"hsl(var(--border))"` | Border / divider |
| `"#f0f0f0"` (border) | `"hsl(var(--border))"` | Border / divider |
| `"rgba(255,255,255,0.75)"` | `"hsl(var(--foreground) / 0.75)"` | Dimmed text |
| `"1px solid #d9d9d9"` | `"1px solid hsl(var(--border))"` | Border string |
| `"1px solid #f0f0f0"` | `"1px solid hsl(var(--border))"` | Border string |
| `"1px dashed #d9d9d9"` | `"1px dashed hsl(var(--border))"` | Dashed border |

**Do NOT replace these** (intentional fixed colors):
- `linear-gradient(135deg, #001529 0%, #1677ff 100%)` — page header gradient (always dark)
- `background: "#001529"` / `background: "#002140"` inside the **Layout** CCard — intentional dark-nav demo
- `color: "#fff"` / `color: "rgba(255,255,255,0.65)"` inside the **Layout** Header/Sider — text on fixed dark bg
- `background: "#001529"` inside **Carousel** — intentional dark demo slide
- `hsl(${i * 40}, 60%, 75%)` in **Masonry** items — color is the point of the demo
- Grid/Flex demo box blues (`"#1677ff"`, `"#69b1ff"`, `"#bae0ff"`, `"#91caff"`, `"#4096ff"`) — readable in both modes
- `SECTION_COLORS` palette — already alpha-tinted, works in both modes
- Colored Flex boxes (`"#f56a00"`, `"#7265e6"`, etc.) — demo colors, not UI chrome

---

## Task 1: Add imports and `useIsDark` hook

**Files:**
- Modify: `app/testing/page.tsx:3` (React import)
- Modify: `app/testing/page.tsx:16-21` (icon import)
- Modify: `app/testing/page.tsx` (add hook before `Section` component)

- [ ] **Step 1: Update the React import to include `useCallback` and `useEffect`**

Replace line 3:
```tsx
import React, { useState, useRef } from "react";
```
With:
```tsx
import React, { useState, useRef, useEffect, useCallback } from "react";
```

- [ ] **Step 2: Add `SunOutlined` and `MoonOutlined` to the icon import**

The icon import block currently ends with `PlusOutlined`. Replace the last two lines of the icon import:
```tsx
import {
  UserOutlined, UploadOutlined, InboxOutlined, SmileOutlined,
  HomeOutlined, SettingOutlined, AppstoreOutlined, PlusOutlined,
  DownOutlined, HeartOutlined, StarOutlined, DeleteOutlined,
  BellOutlined, FileOutlined, CheckCircleOutlined, ClockCircleOutlined,
  EditOutlined, EyeOutlined, MailOutlined, PhoneOutlined,
} from "@ant-design/icons";
```
With:
```tsx
import {
  UserOutlined, UploadOutlined, InboxOutlined, SmileOutlined,
  HomeOutlined, SettingOutlined, AppstoreOutlined, PlusOutlined,
  DownOutlined, HeartOutlined, StarOutlined, DeleteOutlined,
  BellOutlined, FileOutlined, CheckCircleOutlined, ClockCircleOutlined,
  EditOutlined, EyeOutlined, MailOutlined, PhoneOutlined,
  SunOutlined, MoonOutlined,
} from "@ant-design/icons";
```

- [ ] **Step 3: Add the `useIsDark` hook function after `const { Header, Sider, Content, Footer } = Layout;` (line 24) and before the `Section` component**

Insert this block between line 24 and line 26:
```tsx
function useIsDark() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    setIsDark(root.classList.contains("dark"));
    const observer = new MutationObserver(() =>
      setIsDark(root.classList.contains("dark"))
    );
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const toggleTheme = useCallback(() => {
    const next = isDark ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("theme", next);
  }, [isDark]);

  return { isDark, toggleTheme };
}
```

- [ ] **Step 4: Run TypeScript check — expect zero errors**

```bash
cd /Users/sarvadhisolution/Documents/Personal/cliently && bunx tsc --noEmit
```

Expected: no output (zero errors).

---

## Task 2: Wire hook into component + add toggle button to nav bar

**Files:**
- Modify: `app/testing/page.tsx` (TestingPage function + Affix nav section)

- [ ] **Step 1: Destructure `isDark` and `toggleTheme` at the top of `TestingPage`**

The `TestingPage` component opens with `const [modalOpen, setModalOpen] = useState(false);`. Add the hook call immediately after the opening brace:
```tsx
export default function TestingPage() {
  const { isDark, toggleTheme } = useIsDark();
  const [modalOpen, setModalOpen] = useState(false);
  // ... rest of state declarations unchanged
```

- [ ] **Step 2: Add the ThemeToggle button inside the Affix nav bar div**

The current Affix section (around line 234) is:
```tsx
<Affix offsetTop={0}>
  <div style={{ background: "#fff", borderBottom: "1px solid #f0f0f0", padding: "0 48px" }}>
    <Anchor direction="horizontal" offsetTop={0}
      items={[...]}
    />
  </div>
</Affix>
```

Replace it with (the background and border will be fixed in Task 3, but update the div structure now to add the toggle):
```tsx
<Affix offsetTop={0}>
  <div style={{ background: "#fff", borderBottom: "1px solid #f0f0f0", padding: "0 48px", display: "flex", alignItems: "center" }}>
    <div style={{ flex: 1 }}>
      <Anchor direction="horizontal" offsetTop={0}
        items={[
          { key: "general", href: "#general", title: "General" },
          { key: "layout", href: "#layout", title: "Layout" },
          { key: "nav", href: "#nav", title: "Navigation" },
          { key: "entry", href: "#entry", title: "Data Entry" },
          { key: "display", href: "#display", title: "Data Display" },
          { key: "feedback", href: "#feedback", title: "Feedback" },
          { key: "other", href: "#other", title: "Other" },
        ]}
      />
    </div>
    <Tooltip title={isDark ? "Switch to light mode" : "Switch to dark mode"}>
      <Button
        type="text"
        size="small"
        icon={isDark ? <SunOutlined /> : <MoonOutlined />}
        onClick={toggleTheme}
        style={{ flexShrink: 0, marginLeft: 8 }}
      />
    </Tooltip>
  </div>
</Affix>
```

- [ ] **Step 3: Run TypeScript check — expect zero errors**

```bash
cd /Users/sarvadhisolution/Documents/Personal/cliently && bunx tsc --noEmit
```

Expected: no output.

- [ ] **Step 4: Commit the hook + toggle wiring**

```bash
git add app/testing/page.tsx
git commit -m "feat(testing): add useIsDark hook and theme toggle button to nav bar"
```

---

## Task 3: Replace page-level and nav bar inline colors

These are the outermost wrapper, component index grid, and sticky nav bar — the highest-visibility chrome on the page.

**Files:**
- Modify: `app/testing/page.tsx` (lines ~186–235)

- [ ] **Step 1: Replace the outer page wrapper background**

Find (line ~186):
```tsx
<div style={{ background: "#f0f2f5", minHeight: "100vh" }}>
```
Replace with:
```tsx
<div style={{ background: "hsl(var(--background))", minHeight: "100vh" }}>
```

- [ ] **Step 2: Replace the page header subtitle text color**

Find (line ~194):
```tsx
<Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 16 }}>
```
Replace with:
```tsx
<Text style={{ color: "hsl(var(--foreground) / 0.75)", fontSize: 16 }}>
```
Note: The header gradient is intentionally dark in both modes, so near-black foreground text is readable against it.

- [ ] **Step 3: Replace the component index grid container colors**

Find (line ~200):
```tsx
<div style={{ background: "#fff", padding: "24px 48px", borderBottom: "1px solid #f0f0f0" }}>
```
Replace with:
```tsx
<div style={{ background: "hsl(var(--card))", padding: "24px 48px", borderBottom: "1px solid hsl(var(--border))" }}>
```

- [ ] **Step 4: Replace Quick Jump label text color**

Find (line ~201):
```tsx
<Text style={{ fontSize: 13, fontWeight: 700, color: "#333", display: "block", marginBottom: 12 }}>
```
Replace with:
```tsx
<Text style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--foreground))", display: "block", marginBottom: 12 }}>
```

- [ ] **Step 5: Replace legend section text color**

Find (line ~227, inside the `Object.entries(...)` legend map):
```tsx
<Text style={{ fontSize: 11, color: "#666" }}>{label}</Text>
```
Replace with:
```tsx
<Text style={{ fontSize: 11, color: "hsl(var(--muted-foreground))" }}>{label}</Text>
```

- [ ] **Step 6: Replace the sticky nav bar container colors**

Find (line ~235 — the div you already modified in Task 2 step 2):
```tsx
<div style={{ background: "#fff", borderBottom: "1px solid #f0f0f0", padding: "0 48px", display: "flex", alignItems: "center" }}>
```
Replace with:
```tsx
<div style={{ background: "hsl(var(--card))", borderBottom: "1px solid hsl(var(--border))", padding: "0 48px", display: "flex", alignItems: "center" }}>
```

- [ ] **Step 7: Run TypeScript check — expect zero errors**

```bash
cd /Users/sarvadhisolution/Documents/Personal/cliently && bunx tsc --noEmit
```

Expected: no output.

- [ ] **Step 8: Commit page-level color replacements**

```bash
git add app/testing/page.tsx
git commit -m "fix(testing): replace page-level hardcoded colors with CSS variables"
```

---

## Task 4: Replace CCard title text and component demo inline colors

These are colors inside the `CCard` header and inside individual component demo boxes.

**Files:**
- Modify: `app/testing/page.tsx` (CCard component + Layout/Splitter/FloatButton/Spin/Watermark CCards)

- [ ] **Step 1: Replace CCard title label text color**

Find (line ~45, inside the `CCard` function):
```tsx
<Text style={{ fontSize: 12, color: "#555", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{title}</Text>
```
Replace with:
```tsx
<Text style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{title}</Text>
```

- [ ] **Step 2: Replace FloatButton demo container border**

Find (line ~279, inside the FloatButton CCard):
```tsx
<div style={{ position: "relative", height: 80, border: "1px dashed #d9d9d9", borderRadius: 8, marginTop: 8 }}>
```
Replace with:
```tsx
<div style={{ position: "relative", height: 80, border: "1px dashed hsl(var(--border))", borderRadius: 8, marginTop: 8 }}>
```

- [ ] **Step 3: Replace Layout demo outer border + Content + Footer backgrounds**

The Layout CCard demo (lines ~373–388) has three values to replace. Leave `background: "#001529"` (Header), `background: "#002140"` (Sider), `color: "#fff"` (Header text), and `color: "rgba(255,255,255,0.65)"` (Sider text) **exactly as-is** — they are intentional dark-nav UI demos.

Replace only these three:

Find the Layout outer wrapper (line ~373):
```tsx
<Layout style={{ minHeight: 180, borderRadius: 8, overflow: "hidden", border: "1px solid #d9d9d9" }}>
```
Replace with:
```tsx
<Layout style={{ minHeight: 180, borderRadius: 8, overflow: "hidden", border: "1px solid hsl(var(--border))" }}>
```

Find the Content area (line ~381):
```tsx
<Content style={{ background: "#f5f5f5", padding: 24, minHeight: 80 }}>
```
Replace with:
```tsx
<Content style={{ background: "hsl(var(--muted))", padding: 24, minHeight: 80 }}>
```

Find the Footer (line ~385):
```tsx
<Footer style={{ textAlign: "center", background: "#f0f0f0", padding: "12px 24px" }}>
```
Replace with:
```tsx
<Footer style={{ textAlign: "center", background: "hsl(var(--accent))", padding: "12px 24px" }}>
```

- [ ] **Step 4: Replace Splitter demo outer border**

Find (line ~423, inside the Splitter CCard):
```tsx
<Splitter style={{ height: 140, border: "1px solid #d9d9d9", borderRadius: 8, overflow: "hidden" }}>
```
Replace with:
```tsx
<Splitter style={{ height: 140, border: "1px solid hsl(var(--border))", borderRadius: 8, overflow: "hidden" }}>
```

- [ ] **Step 5: Replace Spin demo content area background**

Find (line ~1049, inside the Spin CCard):
```tsx
<div style={{ padding: 24, background: "#f5f5f5", borderRadius: 8, width: 200, textAlign: "center" }}>
```
Replace with:
```tsx
<div style={{ padding: 24, background: "hsl(var(--muted))", borderRadius: 8, width: 200, textAlign: "center" }}>
```

- [ ] **Step 6: Replace Watermark demo container colors**

Find (line ~1067, inside the Watermark CCard):
```tsx
<div style={{ height: 120, background: "#fafafa", border: "1px dashed #d9d9d9", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
```
Replace with:
```tsx
<div style={{ height: 120, background: "hsl(var(--muted))", border: "1px dashed hsl(var(--border))", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
```

- [ ] **Step 7: Run TypeScript check — expect zero errors**

```bash
cd /Users/sarvadhisolution/Documents/Personal/cliently && bunx tsc --noEmit
```

Expected: no output.

- [ ] **Step 8: Commit component demo color replacements**

```bash
git add app/testing/page.tsx
git commit -m "fix(testing): replace component demo hardcoded colors with CSS variables"
```

---

## Task 5: Visual verification

There are no unit tests for a visual showcase page. Verify by toggling the theme and visually inspecting.

**Files:** none (verification only)

- [ ] **Step 1: Verify the page renders in both themes**

Open `http://localhost:3000/testing` in a browser (dev server must be running — start it with `bun run dev` if not already running).

Check in **light mode** (default):
- Page background is white/off-white (not `#f0f2f5` gray)
- Component index grid has a white card background with a light gray border
- Sticky nav bar has a white background
- CCard titles are in a medium gray (muted), not dark gray
- Layout Content area is a soft gray
- Layout Footer is a soft gray

Click the Moon icon in the top-right of the sticky nav to switch to **dark mode**:
- Page background turns very dark (`#0a0a0a`)
- Component index grid turns dark card color (`#1a1a1a`) with a dark border
- Sticky nav bar turns dark
- CCard titles are a medium gray against dark
- antd components (buttons, inputs, cards) switch to their dark variants automatically via `AntdThemeProvider`
- Layout demo header/sider remain dark navy (unchanged — intentional)
- Click the Sun icon to switch back to light mode

- [ ] **Step 2: Verify the toggle persists across page reload**

1. Switch to dark mode using the toggle
2. Reload the page (`Cmd+R`)
3. Confirm the page loads in dark mode (localStorage key `"theme"` = `"dark"` is respected by `AppThemeProvider`)
4. Switch back to light, reload, confirm it loads light

- [ ] **Step 3: Confirm no TypeScript errors in final state**

```bash
cd /Users/sarvadhisolution/Documents/Personal/cliently && bunx tsc --noEmit
```

Expected: no output.

- [ ] **Step 4: Final commit**

```bash
git add app/testing/page.tsx
git commit -m "feat(testing): complete dark/light theme support with CSS variable tokens"
```

---

## Self-Review

**Spec coverage:**
- ✅ `useIsDark()` hook with MutationObserver — Task 1
- ✅ `toggleTheme()` following AppThemeProvider contract — Task 1
- ✅ Sun/Moon toggle button in sticky nav bar — Task 2
- ✅ `#f0f2f5` → `hsl(var(--background))` — Task 3
- ✅ `#fff` containers → `hsl(var(--card))` — Task 3, 4
- ✅ `#f5f5f5` fills → `hsl(var(--muted))` — Task 4
- ✅ `#888`/`#666`/`#555` → `hsl(var(--muted-foreground))` — Task 3, 4
- ✅ `#333` → `hsl(var(--foreground))` — Task 3
- ✅ `#d9d9d9`/`#f0f0f0` borders → `hsl(var(--border))` — Task 3, 4
- ✅ `rgba(255,255,255,0.75)` → `hsl(var(--foreground) / 0.75)` — Task 3
- ✅ Layout Header/Sider/Carousel kept as hardcoded dark — all tasks avoid these
- ✅ SECTION_COLORS, Masonry, Grid/Flex demos untouched

**Placeholder scan:** No TBD, TODO, or vague steps.

**Type consistency:** `useIsDark()` returns `{ isDark: boolean, toggleTheme: () => void }` — used consistently in Task 2.
