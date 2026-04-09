import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { ExpenseTable } from '@/components/expenses/ExpenseTable'
import type { Expense, Project } from '@/types'

export default async function ExpensesPage() {
  const supabase = await createClient()

  const [expensesResult, projectsResult] = await Promise.all([
    supabase
      .from('expenses')
      .select('*, project:projects(id, title)')
      .order('date', { ascending: false }),
    supabase
      .from('projects')
      .select('*')
      .in('status', ['planning', 'in_progress', 'review'])
      .order('title'),
  ])

  const expenses = (expensesResult.data ?? []) as Expense[]
  const projects = (projectsResult.data ?? []) as Project[]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        description={`${expenses.length} expense${expenses.length === 1 ? '' : 's'} tracked`}
      />
      <ExpenseTable expenses={expenses} projects={projects} />
    </div>
  )
}
