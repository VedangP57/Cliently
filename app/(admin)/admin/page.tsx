import dayjs from 'dayjs'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatCurrency } from '@/lib/utils'
import { PageHeader } from '@/components/shared/PageHeader'
import { PlatformStatsCard } from '@/components/admin/PlatformStatsCard'
import { AdminOverviewCharts } from '@/components/admin/AdminOverviewCharts'
import { Users, DollarSign, FolderKanban, FileSpreadsheet, Briefcase, Clock } from 'lucide-react'

export default async function AdminOverviewPage() {
  const admin = createAdminClient()

  const [
    usersRes,
    clientsCountRes,
    paidInvoicesRes,
    activeProjectsRes,
    invoicesSentMonthRes,
    totalProjectsRes,
    totalTimeLogsRes,
    allInvoicesRes,
    profilesRes,
  ] = await Promise.all([
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    admin.from('clients').select('id', { count: 'exact', head: true }),
    admin.from('invoices').select('user_id, invoice_items(amount)').eq('status', 'paid'),
    admin.from('projects').select('id', { count: 'exact', head: true }).eq('status', 'in_progress'),
    admin.from('invoices').select('id', { count: 'exact', head: true })
      .eq('status', 'sent')
      .gte('created_at', dayjs().startOf('month').toISOString()),
    admin.from('projects').select('id', { count: 'exact', head: true }),
    admin.from('time_logs').select('id, hours'),
    admin.from('invoices').select('id, status'),
    admin.from('profiles').select('id, created_at'),
  ])

  function invoiceAmount(invoice: { invoice_items: unknown }): number {
    return ((invoice.invoice_items as Array<{ amount: number }> | null) ?? []).reduce(
      (sum, item) => sum + Number(item.amount), 0
    )
  }

  const totalUsers = usersRes.data?.users.length ?? 0
  const totalClients = clientsCountRes.count ?? 0
  const paidInvoices = paidInvoicesRes.data ?? []
  const totalRevenue = paidInvoices.reduce((sum, inv) => sum + invoiceAmount(inv), 0)
  const activeProjects = activeProjectsRes.count ?? 0
  const invoicesSentThisMonth = invoicesSentMonthRes.count ?? 0
  const totalProjects = totalProjectsRes.count ?? 0
  const totalHours = (totalTimeLogsRes.data ?? []).reduce((s, l) => s + Number(l.hours), 0)

  // User signups last 6 months
  const monthKeys = Array.from({ length: 6 }, (_, i) =>
    dayjs().subtract(5 - i, 'month').format('YYYY-MM')
  )
  const signupMap = new Map<string, number>()
  monthKeys.forEach((k) => signupMap.set(k, 0))
  for (const p of (profilesRes.data ?? [])) {
    const key = dayjs(p.created_at).format('YYYY-MM')
    if (signupMap.has(key)) signupMap.set(key, (signupMap.get(key) ?? 0) + 1)
  }
  const userGrowth = monthKeys.map((k) => ({
    month: dayjs(`${k}-01`).format('MMM'),
    count: signupMap.get(k) ?? 0,
  }))

  // Invoice status breakdown
  const statusMap = new Map<string, number>()
  for (const inv of (allInvoicesRes.data ?? [])) {
    statusMap.set(inv.status, (statusMap.get(inv.status) ?? 0) + 1)
  }
  const invoiceBreakdown = Array.from(statusMap.entries()).map(([status, count]) => ({ status, count }))

  // Recent signups (last 5)
  const authUsers = usersRes.data?.users ?? []
  const recentUsers = [...authUsers]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
    .map((u) => ({
      email: u.email ?? '—',
      createdAt: u.created_at,
    }))

  return (
    <div className="space-y-6">
      <PageHeader title="Admin Overview" description="Platform-level statistics at a glance." />

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <PlatformStatsCard title="Total Users" value={totalUsers.toLocaleString()} icon={Users} />
        <PlatformStatsCard title="Total Clients" value={totalClients.toLocaleString()} icon={Briefcase} />
        <PlatformStatsCard title="Total Revenue" value={formatCurrency(totalRevenue)} icon={DollarSign} />
        <PlatformStatsCard title="Active Projects" value={activeProjects.toLocaleString()} icon={FolderKanban} />
        <PlatformStatsCard title="Invoices This Month" value={invoicesSentThisMonth.toLocaleString()} icon={FileSpreadsheet} />
        <PlatformStatsCard title="Total Hours Logged" value={`${totalHours.toFixed(0)}h`} icon={Clock} />
      </div>

      {/* Charts + Recent Activity */}
      <AdminOverviewCharts
        userGrowth={userGrowth}
        invoiceBreakdown={invoiceBreakdown}
        recentUsers={recentUsers}
        totalProjects={totalProjects}
        totalUsers={totalUsers}
        totalClients={totalClients}
      />
    </div>
  )
}
