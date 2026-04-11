# Expenses

The expenses module lets users track business spending with full CRUD operations, category-based organization, optional receipt URLs, and project association. Billable expenses can later be pulled into [[Invoices]].

## Page Structure

The page (`app/(dashboard)/dashboard/expenses/page.tsx`) is a **server component** that fetches two datasets in parallel from [[System|Supabase]]:

- `expenses` with joined `project(id, title)`, ordered by date descending
- `projects` filtered to active statuses (`planning`, `in_progress`, `review`), ordered by title

Both are passed to the single client component `ExpenseTable`, which handles the full UI including the page header, filters, table, and modals.

## Expense Table

`ExpenseTable` (`components/expenses/ExpenseTable.tsx`) renders the page header, filtering controls, data table, and total summary.

### Filters

Three client-side filters operate simultaneously:

| Filter | Control | Behavior |
|---|---|---|
| Search | Text input with search icon | Case-insensitive match on expense `title` |
| Category | Select dropdown | Matches `category` field exactly |
| Project | Select dropdown | Matches `project_id` exactly |

All filters default to showing everything ("all"). The filtered total amount is displayed below the table.

### Table Columns

The Ant Design `Table` displays these columns:

- **Date** -- formatted via `formatDate()`
- **Title** -- bold font weight
- **Category** -- rendered as a `StatusBadge` component
- **Project** -- joined project title, or dash if none
- **Amount** -- formatted via `formatCurrency()`
- **Billable** -- shadcn `Badge` with default/secondary variant
- **Action** -- up to 3 buttons: view receipt (opens URL in new tab, only shown if `receipt_url` exists), edit, delete

Pagination is set to 10 rows per page, hidden on single page, with horizontal scroll at 800px.

## Expense Modal

`ExpenseModal` (`components/expenses/ExpenseModal.tsx`) handles both create and edit operations. It uses **react-hook-form** with **zod resolver** (unlike the time tracking modal which uses Ant Design Form).

### Form Fields

| Field | Type | Default | Notes |
|---|---|---|---|
| Title | Text input | Empty | Required, max 200 chars |
| Amount | Number input | 0 | Required, positive, step 0.01 |
| Date | Date input (native) | Today | Required |
| Category | Select | other | One of 6 categories |
| Project | Select | None | Optional, lists active [[Projects]] |
| Receipt URL | Text input | Empty | Optional, validated as URL if provided |
| Billable | Switch | true | Toggle for invoice inclusion |

The modal renders inside a shadcn `Dialog` with `sm:max-w-lg` and vertical scroll for overflow on small screens.

On submit it calls either `createExpenseAction` or `updateExpenseAction`, then resets the form and closes the dialog.

## Expense Categories

Six fixed categories are enforced at both the validation and database level:

| Category | Value |
|---|---|
| Software | `software` |
| Hardware | `hardware` |
| Travel | `travel` |
| Marketing | `marketing` |
| Meals | `meals` |
| Other | `other` |

The default category is `other`.

## Server Actions

Defined in `lib/actions/expenses.ts`. All actions follow the standard `{ data, error }` return pattern.

### createExpenseAction

1. Validates input with `expenseSchema`
2. Authenticates via `supabase.auth.getUser()`
3. Calls `ensureProfile(user)` to guarantee the profile row exists
4. Inserts into `expenses` with `user_id` set server-side
5. Calls `revalidatePath('/dashboard/expenses')`

### updateExpenseAction

1. Validates input with `expenseSchema`
2. Authenticates the user
3. Updates the row matching both `id` and `user_id` (RLS-safe double check)
4. Revalidates the path

### deleteExpenseAction

1. Authenticates the user
2. Deletes the row matching both `id` and `user_id`
3. Revalidates the path

## Validation Schema

Defined in `lib/validations/expense.ts` using [[System|Zod]]:

```typescript
expenseSchema = z.object({
  title:       z.string().min(1, 'Title is required').max(200),
  amount:      z.coerce.number().positive('Amount must be greater than 0'),
  category:    z.enum(['software','hardware','travel','marketing','meals','other']).default('other'),
  project_id:  z.string().uuid().or(z.literal('')).default(''),
  date:        z.string().min(1, 'Date is required'),
  billable:    z.boolean().default(true),
  receipt_url: z.string().url('Invalid URL').or(z.literal('')).default(''),
})
```

Key rules:
- `title` is required with a 200 character maximum
- `amount` is coerced from string input and must be positive
- `category` is restricted to the 6 allowed enum values
- `project_id` accepts either a valid UUID or an empty string
- `receipt_url` must be a valid URL or empty string
- `billable` defaults to `true`

## Data Model

The `expenses` table in [[System|Supabase]]:

| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK, auto-generated |
| `user_id` | uuid | FK to `profiles`, NOT NULL, cascade delete |
| `project_id` | uuid | FK to [[Projects]], cascade delete |
| `title` | text | NOT NULL |
| `amount` | numeric | CHECK > 0 |
| `category` | text | CHECK in 6 allowed values, default `other` |
| `date` | date | NOT NULL |
| `receipt_url` | text | Optional |
| `billable` | boolean | Default true |
| `invoiced` | boolean | Default false |
| `created_at` | timestamptz | Default now() |

RLS is enabled with user-scoped CRUD policies (`user_id = auth.uid()`).

The `invoiced` flag is stored in the database but is not toggled from the expenses UI -- it is set when expenses are pulled into [[Invoices]].

## Receipt Handling

The current implementation accepts a receipt URL as a plain text field validated as a URL string. The `ExpenseModal` form has a text input for pasting a URL (e.g., `https://example.com/receipt.pdf`). The `ExpenseTable` renders a blue link icon button that opens the receipt URL in a new browser tab with `noopener,noreferrer` for security.

The receipt URL is stored in the `receipt_url` column and is optional for all operations.

## Related Modules

- [[Projects]] -- expenses are optionally linked to a project; the project dropdown is filtered to active statuses
- [[Invoices]] -- billable expenses can be pulled into invoice line items as `type: 'expense'`
- [[System]] -- uses Supabase server client, Zod validation, react-hook-form, dayjs for dates
