# Testing Page — Light / Dark Theme Support

**Date:** 2026-06-09  
**Status:** Approved  
**Scope:** `app/testing/page.tsx` only — no changes to shared providers or globals.css

---

## Problem

The `/testing` page showcases all 71 antd components but uses hardcoded hex colors for its custom inline styles (page background, header, demo boxes, index grid). These styles are invisible to the `.dark` class that the rest of the app uses, so switching themes leaves the page looking broken — dark antd components on a white layout background, or light filler boxes against dark cards.

---

## Solution

Replace every hardcoded inline color with `hsl(var(--token))` references drawn from the semantic CSS variables already defined in `globals.css`. Add a Sun/Moon toggle button that follows the same `.dark` class + `localStorage` contract as `AppThemeProvider`.

---

## Architecture

```
globals.css  (unchanged — single source of truth)
  :root  → --background, --card, --muted, --foreground,
            --border, --muted-foreground, --secondary, --accent
  .dark  → same names, dark values

AntdThemeProvider  (unchanged)
  Watches .dark on <html> → switches ConfigProvider between lightTheme / darkTheme
  antd components inherit this automatically — no changes needed

AppThemeProvider  (unchanged)
  Manages .dark class on <html>, reads/writes localStorage key "theme"

app/testing/page.tsx  (all changes here)
  useIsDark()     — MutationObserver on html.classList, returns { isDark, toggleTheme }
  toggleTheme()   — flips .dark, writes localStorage "light"|"dark"
  ThemeToggle     — Button with SunOutlined / MoonOutlined, placed in sticky nav bar
  All inline styles — replaced with hsl(var(--token)) values per the map below
```

---

## Token Map

| Hardcoded value | CSS variable | Semantic meaning |
|---|---|---|
| `#f0f2f5`, `#f5f5f5` | `hsl(var(--background))` | Page / layout background |
| `#ffffff` (container bg) | `hsl(var(--card))` | Card / elevated surface |
| `#f5f5f5` (fills, inner boxes) | `hsl(var(--muted))` | Subtle fill background |
| `#888`, `#666`, `#aaa` | `hsl(var(--muted-foreground))` | Secondary / muted text |
| `#333`, `#555` | `hsl(var(--foreground))` | Primary body text |
| `#d9d9d9`, `#f0f0f0` | `hsl(var(--border))` | Dividers and borders |
| `#001529`, `#002140` | `hsl(var(--secondary))` | Dark surface (Layout sider/header) |
| `#f0f0f0` demo fill boxes | `hsl(var(--accent))` | Neutral accent fill |
| `rgba(255,255,255,0.75)` text | `hsl(var(--foreground) / 0.75)` | Dimmed foreground text |

**Not replaced (intentional):**
- Page header gradient — dark enough to work on both themes
- `SECTION_COLORS` accent palette — already alpha-tinted, works in both modes
- Masonry demo boxes — `hsl(i*40, 50%, 65%)` — colour is the point, stays fixed
- Grid / Flex demo boxes — use `colorPrimary` blues already, readable in both modes

---

## `useIsDark` Hook

```ts
function useIsDark() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    setIsDark(root.classList.contains('dark'))
    const observer = new MutationObserver(() =>
      setIsDark(root.classList.contains('dark'))
    )
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const toggleTheme = useCallback(() => {
    const next = isDark ? 'light' : 'dark'
    document.documentElement.classList.toggle('dark', next === 'dark')
    localStorage.setItem('theme', next)
  }, [isDark])

  return { isDark, toggleTheme }
}
```

---

## Toggle Button

- Placed at the **right end of the sticky Affix nav row** (same `<div>` as the Anchor component)
- Uses antd `Button` with `type="text"`, `size="small"`
- Icon: `SunOutlined` when dark (click → go light), `MoonOutlined` when light (click → go dark)
- Tooltip: "Switch to light mode" / "Switch to dark mode"

---

## Files Changed

| File | Change |
|---|---|
| `app/testing/page.tsx` | Add `useIsDark` hook, `toggleTheme`, `ThemeToggle` button, replace all hardcoded inline colors with `hsl(var(--token))` |

No other files change.

---

## Out of Scope

- Adding new CSS variables to `globals.css`
- Changes to `AppThemeProvider` or `AntdThemeProvider`
- System theme (`prefers-color-scheme`) auto-detection — already handled by `AppThemeProvider`
- Persisting theme preference beyond what `AppThemeProvider` already does
