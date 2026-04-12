import dayjs from 'dayjs'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatCurrency } from '@/lib/utils'
import { PageHeader } from '@/components/shared/PageHeader'
import { PlatformStatsCard } from '@/components/admin/PlatformStatsCard'
import { PlatformAnalytics } from '@/components/admin/PlatformAnalytics'
import { Users, DollarSign, FolderKanban, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

type RangeKey = '30d' | '3m' | '6m' | '1y'

const RANGES: Array<{ key: RangeKey; label: string; months: number }> = [
  { key: '30d', label: 'Last 30 days', months: 1 },
  { key: '3m', label: '3 months', months: 3 },
  { key: '6m', label: '6 months', months: 6 },
  { key: '1y', label: '1 year', months: 12 },
]

interface AnalyticsPageProps {
  searchParams: Promise<{ range?: string }>
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const params = await searchParams
  const rangeKey = (params.range ?? '1y') as RangeKey
  const rangeConfig = RANGES.find((r) => r.key === rangeKey) ?? RANGES[3]
  const periodStart = dayjs().subtract(rangeConfig.months, 'month').startOf('day').toISOString()

  const admin = createAdminClient()

  // Fetch all data in parallel
  const [
    profilesRes,
    paidInvoicesRes,
    activeProjectsRes,
    monthInvoicesRes,
    allInvoicesRes,
    clientsCountRes,
    projectsCountRes,
    proposalsCountRes,
    contractsCountRes,
    timeLogsCountRes,
    expensesCountRes,
  ] = await Promise.all([
    admin.from('profiles').select('id, full_name, created_at'),
    admin.from('invoices').select('user_id, paid_at, invoice_items(amount)').eq('status', 'paid'),
    admin.from('projects').select('id', { count: 'exact', head: true }).eq('status', 'in_progress'),
    admin.from('invoices').select('id', { count: 'exact', head: true })
      .eq('status', 'sent')
      .gte('created_at', dayjs().startOf('month').toISOString()),
    admin.from('invoices').select('id, status, user_id, paid_at, invoice_items(amount)'),
    admin.from('clients').select('id', { count: 'exact', head: true }),
    admin.from('projects').select('id', { count: 'exact', head: true }),
    admin.from('proposals').select('id', { count: 'exact', head: true }),
    admin.from('contracts').select('id', { count: 'exact', head: true }),
    admin.from('time_logs').select('id', { count: 'exact', head: true }),
    admin.from('expenses').select('id', { count: 'exact', head: true }),
  ])

  // Also fetch auth users for email mapping
  const { data: authUsersData } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  const authUsers = authUsersData?.users ?? []
  const emailMap = new Map(authUsers.map((u) => [u.id, u.email ?? '']))

  const profiles = profilesRes.data ?? []
  const paidInvoices = paidInvoicesRes.data ?? []
  const allInvoices = allInvoicesRes.data ?? []

  // Helper to get invoice amount
  function invoiceAmount(invoice: { invoice_items: unknown }): number {
    return ((invoice.invoice_items as Array<{ amount: number }> | null) ?? []).reduce(
      (sum, item) => sum + Number(item.amount), 0
    )
  }

  // ---- Top Stats ----
  const totalUsers = profiles.length
  const totalRevenue = paidInvoices.reduce((sum, inv) => sum + invoiceAmount(inv), 0)
  const activeProjects = activeProjectsRes.count ?? 0
  const invoicesSentThisMonth = monthInvoicesRes.count ?? 0

  // ---- User Growth (last 12 months, filtered by range) ----
  const monthCount = rangeConfig.months
  const monthKeys = Array.from({ length: monthCount }, (_, i) =>
    dayjs().subtract(monthCount - 1 - i, 'month').format('YYYY-MM')
  )

  const userGrowthMap = new Map<string, number>()
  monthKeys.forEach((k) => userGrowthMap.set(k, 0))
  for (const p of profiles) {
    const key = dayjs(p.created_at).format('YYYY-MM')
    if (userGrowthMap.has(key)) {
      userGrowthMap.set(key, (userGrowthMap.get(key) ?? 0) + 1)
    }
  }
  const userGrowth = monthKeys.map((k) => ({
    month: dayjs(`${k}-01`).format('MMM YY'),
    count: userGrowthMap.get(k) ?? 0,
  }))

  // ---- Revenue Over Time ----
  const revenueMap = new Map<string, number>()
  monthKeys.forEach((k) => revenueMap.set(k, 0))
  for (const inv of paidInvoices) {
    if (!inv.paid_at) continue
    const key = dayjs(inv.paid_at).format('YYYY-MM')
    if (revenueMap.has(key)) {
      revenueMap.set(key, (revenueMap.get(key) ?? 0) + invoiceAmount(inv))
    }
  }
  const revenueOverTime = monthKeys.map((k) => ({
    month: dayjs(`${k}-01`).format('MMM YY'),
    revenue: Number((revenueMap.get(k) ?? 0).toFixed(2)),
  }))

  // ---- Module Usage ----
  const moduleUsage = [
    { module: 'Clients', count: clientsCountRes.count ?? 0 },
    { module: 'Projects', count: projectsCountRes.count ?? 0 },
    { module: 'Invoices', count: allInvoices.length },
    { module: 'Proposals', count: proposalsCountRes.count ?? 0 },
    { module: 'Contracts', count: contractsCountRes.count ?? 0 },
    { module: 'Time Logs', count: timeLogsCountRes.count ?? 0 },
    { module: 'Expenses', count: expensesCountRes.count ?? 0 },
  ].sort((a, b) => b.count - a.count)

  // ---- Invoice Status Breakdown ----
  const statusMap = new Map<string, number>()
  for (const inv of allInvoices) {
    statusMap.set(inv.status, (statusMap.get(inv.status) ?? 0) + 1)
  }
  const invoiceStatusBreakdown = Array.from(statusMap.entries()).map(([status, count]) => ({
    status,
    count,
  }))

  // ---- Top Users by Revenue ----
  const userRevenueMap = new Map<string, { total: number; count: number }>()
  for (const inv of paidInvoices) {
    const uid = inv.user_id as string
    const amt = invoiceAmount(inv)
    const existing = userRevenueMap.get(uid) ?? { total: 0, count: 0 }
    userRevenueMap.set(uid, { total: existing.total + amt, count: existing.count + 1 })
  }

  const profileMap = new Map(profiles.map((p) => [p.id, p]))
  const topUsers = Array.from(userRevenueMap.entries())
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 10)
    .map(([userId, stats], index) => {
      const profile = profileMap.get(userId)
      return {
        rank: index + 1,
        name: profile?.full_name ?? '—',
        email: emailMap.get(userId) ?? '—',
        totalRevenue: Number(stats.total.toFixed(2)),
        invoiceCount: stats.count,
        joinedAt: profile?.created_at ?? '',
      }
    })

  return (
    <div className="space-y-6">
      <PageHeader title="Platform Analytics" description="Platform-wide statistics and trends." />

      {/* Date Range Filter */}
      <div className="flex flex-wrap gap-2">
        {RANGES.map((option) => (
          <Link key={option.key} href={`/admin/analytics?range=${option.key}`}>
            <Button
              variant={rangeKey === option.key ? 'default' : 'outline'}
              size="sm"
            >
              {option.label}
            </Button>
          </Link>
        ))}
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <PlatformStatsCard
          title="Total Users"
          value={totalUsers.toLocaleString()}
          icon={Users}
          description="Registered accounts"
        />
        <PlatformStatsCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
          description="From paid invoices"
        />
        <PlatformStatsCard
          title="Active Projects"
          value={activeProjects.toLocaleString()}
          icon={FolderKanban}
          description="Currently in progress"
        />
        <PlatformStatsCard
          title="Invoices This Month"
          value={invoicesSentThisMonth.toLocaleString()}
          icon={FileSpreadsheet}
          description="Sent this month"
        />
      </div>

      {/* Charts */}
      <PlatformAnalytics
        userGrowth={userGrowth}
        revenueOverTime={revenueOverTime}
        moduleUsage={moduleUsage}
        invoiceStatusBreakdown={invoiceStatusBreakdown}
        topUsers={topUsers}
      />
    </div>
  )
}
