import { PageHeader } from '@/components/shared/PageHeader'
import { createClient } from '@/lib/supabase/server'
import { ReportsDashboard } from '@/components/reports/ReportsDashboard'

export default async function ReportsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const [invoicesRes, timeLogsRes, expensesRes] = await Promise.all([
    supabase
      .from('invoices')
      .select('status, paid_at, invoice_items(amount)')
      .eq('user_id', user.id)
      .eq('status', 'paid'),
    supabase
      .from('time_logs')
      .select('hours, date, project:projects(title)')
      .eq('user_id', user.id),
    supabase
      .from('expenses')
      .select('amount, date, category')
      .eq('user_id', user.id),
  ])

  const invoices = (invoicesRes.data ?? []).map((invoice) => ({
    status: invoice.status,
    paid_at: invoice.paid_at,
    amount: ((invoice.invoice_items as Array<{ amount: number }> | null) ?? []).reduce(
      (total, item) => total + Number(item.amount),
      0
    ),
  }))

  const timeLogs = (timeLogsRes.data ?? []).map((log) => ({
    hours: Number(log.hours),
    date: log.date,
    project_title: Array.isArray(log.project)
      ? (log.project[0]?.title ?? 'Unassigned')
      : ((log.project as { title?: string } | null)?.title ?? 'Unassigned'),
  }))

  const expenses = (expensesRes.data ?? []).map((expense) => ({
    amount: Number(expense.amount),
    date: expense.date,
    category: expense.category,
  }))

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Visualize revenue, time, expenses, and profit trends." />
      <ReportsDashboard invoices={invoices} timeLogs={timeLogs} expenses={expenses} />
    </div>
  )
}
