# Tech Stack Decisions

## Core Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR + Server Components, Vercel deploy — see [[System]] |
| Database/Auth | Supabase | Integrated auth, RLS, real-time, storage — see [[Auth]] |
| Styling | Tailwind CSS + shadcn/ui | Rapid UI development, consistent design system |
| Theme | next-themes | Light + Dark mode support |
| Forms | react-hook-form + zod | Type-safe validation, client + server |
| Rich Text | Tiptap | Proposals + Contracts editor |
| Kanban | @dnd-kit/core + sortable | Tasks board drag-and-drop |
| PDF | @react-pdf/renderer | Invoice + Proposal PDF export |
| Charts | Recharts | Reports and dashboard visualizations |
| Date | dayjs | Lightweight date handling |
| Icons | lucide-react | Consistent icon set |
| Analytics | PostHog | Public pages only |
| Package Manager | Bun | Fast installs, Vercel-compatible |

## Constraints (Locked)

- No Prisma, no Axios
- No Redux, no Zustand (React state + Context only)
- No moment.js, no date-fns (dayjs only)
- No react-icons, no heroicons (lucide-react only)
- No Pages Router (App Router only)
- No `any` or `as any` in TypeScript
- No inline styles (Tailwind + `cn()` only)

## Deployment

- Vercel auto-deploy from `main` branch
- Bun detected via `bun.lock`
- Environment variables configured in Vercel project settings

## Related
- [[System]]
