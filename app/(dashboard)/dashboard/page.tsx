import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { formatCurrency } from '@/lib/utils'
import {
  Users,
  FolderKanban,
  DollarSign,
  FileSpreadsheet,
  Clock,
} from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch stats
  const [clientsRes, projectsRes, invoicesRes, timeLogsRes] = await Promise.all([
    supabase
      .from('clients')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user!.id),
    supabase
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user!.id)
      .in('status', ['planning', 'in_progress', 'review']),
    supabase
      .from('invoices')
      .select('id, status, invoice_items(amount)')
      .eq('user_id', user!.id),
    supabase
      .from('time_logs')
      .select('hours')
      .eq('user_id', user!.id),
  ])

  const totalClients = clientsRes.count ?? 0
  const activeProjects = projectsRes.count ?? 0

  const invoices = invoicesRes.data ?? []
  const paidInvoices = invoices.filter((i) => i.status === 'paid')
  const unpaidInvoices = invoices.filter(
    (i) => i.status === 'sent' || i.status === 'overdue'
  )

  const totalRevenue = paidInvoices.reduce((sum, inv) => {
    const items = inv.invoice_items ?? []
    return sum + items.reduce((s: number, item: { amount: number }) => s + item.amount, 0)
  }, 0)

  const unpaidTotal = unpaidInvoices.reduce((sum, inv) => {
    const items = inv.invoice_items ?? []
    return sum + items.reduce((s: number, item: { amount: number }) => s + item.amount, 0)
  }, 0)

  const totalHours = (timeLogsRes.data ?? []).reduce(
    (sum, log) => sum + log.hours,
    0
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's an overview of your business."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatsCard
          title="Total Clients"
          value={totalClients.toString()}
          icon={Users}
        />
        <StatsCard
          title="Active Projects"
          value={activeProjects.toString()}
          icon={FolderKanban}
        />
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
        />
        <StatsCard
          title="Unpaid Invoices"
          value={unpaidInvoices.length.toString()}
          description={formatCurrency(unpaidTotal)}
          icon={FileSpreadsheet}
        />
        <StatsCard
          title="Hours Tracked"
          value={totalHours.toFixed(1)}
          icon={Clock}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RecentActivity />
        <QuickActions />
      </div>
    </div>
  )
}
