'use client'

import dayjs from 'dayjs'
import ReactECharts from 'echarts-for-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTheme } from 'next-themes'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Mail } from 'lucide-react'

interface UserGrowthPoint {
  month: string
  count: number
}

interface InvoiceStatusItem {
  status: string
  count: number
}

interface RecentUser {
  email: string
  createdAt: string
}

interface AdminOverviewChartsProps {
  userGrowth: UserGrowthPoint[]
  invoiceBreakdown: InvoiceStatusItem[]
  recentUsers: RecentUser[]
  totalProjects: number
  totalUsers: number
  totalClients: number
}

const statusColors: Record<string, string> = {
  draft: '#64748b',
  sent: '#3b82f6',
  paid: '#22c55e',
  overdue: '#ef4444',
  cancelled: '#8b5cf6',
}

export function AdminOverviewCharts({
  userGrowth,
  invoiceBreakdown,
  recentUsers,
  totalProjects,
  totalUsers,
  totalClients,
}: AdminOverviewChartsProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const textColor = isDark ? '#a1a1aa' : '#71717a'
  const gridLineColor = isDark ? '#27272a' : '#e4e4e7'

  const userGrowthOption = {
    tooltip: { trigger: 'axis' as const },
    grid: { left: 35, right: 15, top: 15, bottom: 25 },
    xAxis: {
      type: 'category' as const,
      data: userGrowth.map((d) => d.month),
      axisLabel: { color: textColor, fontSize: 11 },
      axisLine: { lineStyle: { color: gridLineColor } },
    },
    yAxis: {
      type: 'value' as const,
      minInterval: 1,
      axisLabel: { color: textColor, fontSize: 11 },
      splitLine: { lineStyle: { color: gridLineColor, type: 'dashed' as const } },
    },
    series: [{
      data: userGrowth.map((d) => d.count),
      type: 'bar' as const,
      itemStyle: { color: '#2563eb', borderRadius: [4, 4, 0, 0] },
    }],
  }

  const totalInvoices = invoiceBreakdown.reduce((s, d) => s + d.count, 0)
  const invoiceStatusOption = {
    tooltip: { trigger: 'item' as const, formatter: '{b}: {c} ({d}%)' },
    legend: {
      orient: 'horizontal' as const,
      bottom: 0,
      left: 'center' as const,
      textStyle: { color: textColor, fontSize: 11 },
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 12,
      icon: 'circle',
    },
    graphic: [{
      type: 'group' as const,
      left: 'center',
      top: 'middle',
      children: [
        { type: 'text' as const, style: { text: `${totalInvoices}`, fontSize: 20, fontWeight: 'bold' as const, fill: isDark ? '#f4f4f5' : '#18181b', textAlign: 'center' as const, x: 0, y: -8 } },
        { type: 'text' as const, style: { text: 'Total', fontSize: 11, fill: textColor, textAlign: 'center' as const, x: 0, y: 12 } },
      ],
    }],
    series: [{
      type: 'pie' as const,
      radius: ['50%', '75%'],
      center: ['50%', '42%'],
      avoidLabelOverlap: true,
      label: { show: false },
      emphasis: {
        scale: true,
        scaleSize: 5,
        label: { show: false },
        itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.12)' },
      },
      itemStyle: { borderRadius: 5, borderColor: isDark ? '#09090b' : '#ffffff', borderWidth: 3 },
      data: invoiceBreakdown.map((d) => ({
        name: d.status,
        value: d.count,
        itemStyle: { color: statusColors[d.status] ?? '#64748b' },
      })),
    }],
  }

  const quickStatsOption = {
    tooltip: { trigger: 'axis' as const },
    grid: { left: 60, right: 15, top: 10, bottom: 15 },
    xAxis: {
      type: 'value' as const,
      axisLabel: { color: textColor, fontSize: 11 },
      splitLine: { lineStyle: { color: gridLineColor, type: 'dashed' as const } },
    },
    yAxis: {
      type: 'category' as const,
      data: ['Clients', 'Projects', 'Users'],
      axisLabel: { color: textColor, fontSize: 12 },
      axisLine: { lineStyle: { color: gridLineColor } },
    },
    series: [{
      type: 'bar' as const,
      data: [
        { value: totalClients, itemStyle: { color: '#f59e0b', borderRadius: [0, 4, 4, 0] } },
        { value: totalProjects, itemStyle: { color: '#22c55e', borderRadius: [0, 4, 4, 0] } },
        { value: totalUsers, itemStyle: { color: '#3b82f6', borderRadius: [0, 4, 4, 0] } },
      ],
    }],
  }

  return (
    <div className="space-y-6">
      {/* Row 1: User Growth + Invoice Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>New Signups</CardTitle>
            <p className="text-sm text-muted-foreground">Last 6 months</p>
          </CardHeader>
          <CardContent>
            <ReactECharts option={userGrowthOption} style={{ height: 240 }} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoice Status</CardTitle>
            <p className="text-sm text-muted-foreground">Breakdown across all users</p>
          </CardHeader>
          <CardContent>
            <ReactECharts option={invoiceStatusOption} style={{ height: 240 }} />
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Platform Summary + Recent Users */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Platform Summary</CardTitle>
            <p className="text-sm text-muted-foreground">Total counts</p>
          </CardHeader>
          <CardContent>
            <ReactECharts option={quickStatsOption} style={{ height: 200 }} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Signups</CardTitle>
            <p className="text-sm text-muted-foreground">Latest registrations</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUsers.map((user, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {user.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {dayjs(user.createdAt).format('MMM D, YYYY [at] h:mm A')}
                    </p>
                  </div>
                </div>
              ))}
              {recentUsers.length === 0 && (
                <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 mr-2" />
                  No recent signups
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
