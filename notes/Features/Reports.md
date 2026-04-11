# Reports

The Reports module visualizes financial and productivity data using Recharts. It presents four charts -- revenue line, hours bar, expenses pie, and profit & loss bar -- with a date range filter that controls the time window for all visualizations.

## Data Fetching

`app/(dashboard)/dashboard/reports/page.tsx` is a **server component** that runs three parallel Supabase queries scoped to the authenticated user:

| Source | Query | Fields |
|---|---|---|
| `invoices` | Filtered to `status = 'paid'`, joins `invoice_items(amount)` | `status`, `paid_at`, computed `amount` (sum of item amounts) |
| `time_logs` | All user logs, joins `project:projects(title)` | `hours`, `date`, `project_title` |
| `expenses` | All user expenses | `amount`, `date`, `category` |

Invoice amounts are computed server-side by reducing `invoice_items.amount` into a single total per invoice. Time log project titles are extracted from the joined project relation, defaulting to "Unassigned" when no project is linked.

The processed arrays are passed as props to `ReportsDashboard`.

## Date Range Filter

The component offers four range presets, rendered as toggle buttons at the top:

| Key | Label | Months |
|---|---|---|
| `30d` | Last 30 days | 1 |
| `3m` | 3 months | 3 |
| `6m` | 6 months | 6 |
| `1y` | 1 year | 12 |

Default selection is `30d`. Changing the range recomputes all chart data via `useMemo` hooks. The period start is calculated as `dayjs().subtract(months, 'month').startOf('day')`, and data is filtered to the window between `periodStart` and end of today.

A `monthKeys` array is built for the selected range, providing month buckets (e.g., `['2026-01', '2026-02', '2026-03']`) used by the revenue and P&L charts.

## Charts

All charts use `recharts` with `ResponsiveContainer` (100% width, fixed 288px height per card). Each chart lives inside a `Card` with a title and summary statistic.

### Revenue Line Chart

- **Data**: `revenueByMonth` -- groups paid [[Invoices]] by the month of `paid_at`, sums their `amount` per month
- **X-axis**: month labels (e.g., "Apr 26")
- **Y-axis**: dollar amounts
- **Line**: monotone curve, stroke `#2563eb` (blue), 2px width
- **Summary**: "Total revenue: {formatted currency}"
- **Tooltip**: formats values as currency

### Hours Bar Chart

- **Data**: `hoursByProject` -- groups [[Time-Tracking]] logs by `project_title`, sums hours, sorted descending, top 8 projects
- **X-axis**: project names (11px font)
- **Y-axis**: hours
- **Bars**: fill `#3b82f6` (blue)
- **Summary**: "Total hours: {hours}h"
- **Tooltip**: formats values with "h" suffix

### Expenses Pie Chart

- **Data**: `expensesByCategory` -- groups [[Expenses]] by `category`, sums amounts
- **Pie**: centered, 100px outer radius, labeled
- **Colors**: cycles through `['#3b82f6', '#f59e0b', '#ef4444', '#22c55e', '#8b5cf6', '#64748b']` (blue, amber, red, green, violet, slate)
- **Summary**: "Total expenses: {formatted currency}"
- **Tooltip**: formats values as currency

### Profit & Loss Bar Chart

- **Data**: `profitLossByMonth` -- for each month, calculates `revenue - expenses` using paid [[Invoices]] and [[Expenses]]
- **X-axis**: month labels
- **Y-axis**: dollar amounts
- **Bars**: green (`#22c55e`) for positive months, red (`#ef4444`) for negative months (per-cell coloring)
- **Summary**: "Net profit: {formatted currency}"
- **Tooltip**: formats values as currency

## Summary Statistics

Four totals are computed from the filtered data and displayed as card subtitles:

| Metric | Calculation |
|---|---|
| Total revenue | Sum of all paid invoice amounts in range |
| Total hours | Sum of all time log hours in range |
| Total expenses | Sum of all expense amounts in range |
| Net profit | Revenue minus expenses |

## Key Files

| File | Purpose |
|---|---|
| `app/(dashboard)/dashboard/reports/page.tsx` | Server component, fetches and shapes data |
| `components/reports/ReportsDashboard.tsx` | Client component, renders range filter and 4 Recharts charts |

## Related

- [[Invoices]] -- revenue data comes from paid invoices; amounts derived from `invoice_items`
- [[Time-Tracking]] -- hours data comes from time logs, grouped by project
- [[Expenses]] -- expense data grouped by category for pie chart, by month for P&L
- [[System]] -- `formatCurrency()` utility, `dayjs` for date filtering and month bucketing
