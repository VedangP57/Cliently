# Components

All components live in the `components/` directory, organized by purpose: `ui/` for shadcn primitives, `layout/` for app shell, `shared/` for reusable pieces, and per-module folders for feature-specific components.

## Layout Components (`components/layout/`)

These form the authenticated app shell used by the [[System|dashboard layout]].

### Sidebar
- `Sidebar.tsx` -- Desktop sidebar, visible `lg:` and above. Collapsible (toggle between 240px and 68px). Contains 12 nav items linking to all dashboard modules. Includes a user dropdown (avatar, settings link, logout action) and a [[Tech-stack|ThemeToggle]]. Active route is highlighted with the brand color (`#5e5cc5`).

### Topbar
- `Topbar.tsx` -- Mobile header, visible below `lg:`. Contains a hamburger menu that opens a Sheet with `MobileSidebar`, a ThemeToggle, and a user avatar dropdown.

### MobileSidebar
- `MobileSidebar.tsx` -- Full navigation for the Sheet drawer on mobile. Same 12 nav items as the desktop Sidebar, plus user dropdown and ThemeToggle.

### MobileNav
- `MobileNav.tsx` -- Fixed bottom navigation bar, visible below `lg:`. Shows 5 icons: Home, Clients, Projects, Time, Invoices. Provides quick access to the most-used modules on small screens.

### PublicNavbar / PublicFooter
- `PublicNavbar.tsx` -- Navigation for public (unauthenticated) pages like landing, pricing, login
- `PublicFooter.tsx` -- Footer for public pages

## UI Components (`components/ui/`)

All shadcn/ui primitives. These are low-level building blocks used throughout the app:

`accordion`, `alert`, `avatar`, `badge`, `button`, `calendar`, `card`, `checkbox`, `command`, `dialog`, `dropdown-menu`, `form`, `input`, `label`, `popover`, `progress`, `radio-group`, `select`, `separator`, `sheet`, `skeleton`, `switch`, `table`, `tabs`, `textarea`, `toast`, `toaster`, `tooltip`

All styled with Tailwind CSS and composed using the `cn()` utility from `lib/utils.ts`.

## Shared Components (`components/shared/`)

Reusable components used across multiple modules:

- `StatusBadge.tsx` -- Renders a colored badge based on status string (uses the status color map from the project spec)
- `EmptyState.tsx` -- Placeholder UI for empty lists/tables
- `PageHeader.tsx` -- Standard page header with title and optional actions
- `ConfirmDialog.tsx` -- Reusable confirmation dialog for destructive actions
- `ThemeToggle.tsx` -- Light/dark mode toggle using `next-themes`
- `AppThemeProvider.tsx` -- Theme provider wrapper
- `AntdThemeProvider.tsx` -- Additional theme provider
- `PostHogProvider.tsx` -- [[Tech-stack|PostHog]] analytics provider for public pages
- `TrackedCtaLink.tsx` -- CTA link with PostHog event tracking
- `DisableServiceWorkerInDev.tsx` -- Dev utility to prevent stale service workers

## Module Components

### Dashboard (`components/dashboard/`)
- `StatsCard.tsx` -- Metric card (clients, projects, revenue, hours, etc.)
- `QuickActions.tsx` -- Quick action buttons for common tasks
- `RecentActivity.tsx` -- Activity feed widget

### Auth (`components/auth/`)
- `LoginForm.tsx` -- Email + password login form
- `SignupForm.tsx` -- Registration form

### Clients (`components/clients/`)
- `ClientTable.tsx` -- Sortable, filterable client list with search
- `ClientModal.tsx` -- Create/edit client dialog
- `ClientDetailContent.tsx` -- Client detail page with tabs (Projects, Invoices, Notes)

### Projects (`components/projects/`)
- `ProjectTable.tsx` -- Project list with status filters and sorting
- `ProjectModal.tsx` -- Create/edit project dialog

### Tasks (`components/tasks/`)
- `KanbanBoard.tsx` -- Drag-and-drop Kanban board using `@dnd-kit` with 4 columns (todo, in_progress, in_review, done)
- `TaskCard.tsx` -- Individual task card for the Kanban board
- `TaskModal.tsx` -- Create/edit task dialog
- `TaskTable.tsx` -- Alternative table view for tasks
- `TasksWrapper.tsx` -- Wrapper that switches between Kanban and table views

### Proposals (`components/proposals/`)
- `ProposalTable.tsx` -- Proposal list with status filtering
- `ProposalEditor.tsx` -- Tiptap rich text editor for proposal content (auto-save every 30s)
- `AcceptProposalButton.tsx` -- Client-facing button on the public share page to accept a proposal

### Contracts (`components/contracts/`)
- `ContractTable.tsx` -- Contract list with status filtering
- `ContractEditor.tsx` -- Tiptap rich text editor for contract content
- `SignContractWidget.tsx` -- Client-facing signing widget on the public share page (name input + checkbox)

### Time Tracking (`components/time/`)
- `TimerWidget.tsx` -- Running timer with start/pause/stop (auto-creates a time log on stop)
- `ManualLogModal.tsx` -- Manual time log entry dialog
- `TimeLogTable.tsx` -- Time log list with project/date filtering
- `TimePageActions.tsx` -- Action bar for the time tracking page

### Expenses (`components/expenses/`)
- `ExpenseTable.tsx` -- Expense list with category/project/date filtering
- `ExpenseModal.tsx` -- Create/edit expense dialog with receipt upload

### Invoices (`components/invoices/`)
- `InvoiceTable.tsx` -- Invoice list with status filtering and overdue detection
- `InvoiceBuilder.tsx` -- Line items builder with auto-calculated totals
- `InvoicePDF.tsx` -- PDF template using `@react-pdf/renderer` (used by the `/api/export/pdf` route, see [[Routes]])

### Calendar (`components/calendar/`)
- `CalendarView.tsx` -- Monthly calendar view with colored dots (blue for projects, yellow for tasks, red for invoice deadlines)

### Reports (`components/reports/`)
- `ReportsDashboard.tsx` -- Charts dashboard using Recharts (revenue line, hours bar, expenses pie, P&L bar) with date range filtering

### Settings (`components/settings/`)
- `SettingsTabs.tsx` -- Tabbed settings page (Profile, Business, Defaults, Security)

### Admin (`components/admin/`)
- `UserTable.tsx` -- User management table (role change, enable/disable)

### Pricing (`components/pricing/`)
- `PricingContent.tsx` -- Pricing page content for the public site

## Tests (`components/__tests__/`)

- `StatusBadge.test.tsx` -- Tests for the StatusBadge component
- `EmptyState.test.tsx` -- Tests for the EmptyState component

## Related

- [[System]] -- overall architecture and folder structure
- [[Tech-stack]] -- shadcn/ui, Tiptap, dnd-kit, Recharts, react-pdf
- [[Security]] -- client vs server component boundaries
