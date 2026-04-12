'use client'

import dayjs from 'dayjs'
import ReactECharts from 'echarts-for-react'
import {
  Table,
  type TableProps,
} from 'antd'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { useTheme } from 'next-themes'

interface UserGrowthPoint {
  month: string
  count: number
}

interface RevenuePoint {
  month: string
  revenue: number
}

interface ModuleUsageItem {
  module: string
  count: number
}

interface InvoiceStatusItem {
  status: string
  count: number
}

interface TopUserRow {
  rank: number
  name: string
  email: string
  totalRevenue: number
  invoiceCount: number
  joinedAt: string
}

interface PlatformAnalyticsProps {
  userGrowth: UserGrowthPoint[]
  revenueOverTime: RevenuePoint[]
  moduleUsage: ModuleUsageItem[]
  invoiceStatusBreakdown: InvoiceStatusItem[]
  topUsers: TopUserRow[]
}

const statusColors: Record<string, string> = {
  draft: '#64748b',
  sent: '#3b82f6',
  paid: '#22c55e',
  overdue: '#ef4444',
  cancelled: '#8b5cf6',
}

const moduleColors = ['#3b82f6', '#f59e0b', '#22c55e', '#ef4444', '#8b5cf6', '#64748b', '#06b6d4']

export function PlatformAnalytics({
  userGrowth,
  revenueOverTime,
  moduleUsage,
  invoiceStatusBreakdown,
  topUsers,
}: PlatformAnalyticsProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const textColor = isDark ? '#a1a1aa' : '#71717a'
  const gridLineColor = isDark ? '#27272a' : '#e4e4e7'

  const userGrowthOption = {
    tooltip: { trigger: 'axis' as const },
    grid: { left: 40, right: 20, top: 20, bottom: 30 },
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
      type: 'line' as const,
      smooth: true,
      lineStyle: { color: '#2563eb', width: 2 },
      itemStyle: { color: '#2563eb' },
      areaStyle: { color: { type: 'linear' as const, x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: isDark ? 'rgba(37,99,235,0.3)' : 'rgba(37,99,235,0.15)' }, { offset: 1, color: 'rgba(37,99,235,0)' }] } },
    }],
  }

  const revenueOption = {
    tooltip: {
      trigger: 'axis' as const,
      formatter: (params: any) => {
        const p = Array.isArray(params) ? params[0] : params
        return `${p.name}<br/>${p.marker} Revenue: ${formatCurrency(p.value)}`
      },
    },
    grid: { left: 60, right: 20, top: 20, bottom: 30 },
    xAxis: {
      type: 'category' as const,
      data: revenueOverTime.map((d) => d.month),
      axisLabel: { color: textColor, fontSize: 11 },
      axisLine: { lineStyle: { color: gridLineColor } },
    },
    yAxis: {
      type: 'value' as const,
      axisLabel: { color: textColor, fontSize: 11 },
      splitLine: { lineStyle: { color: gridLineColor, type: 'dashed' as const } },
    },
    series: [{
      data: revenueOverTime.map((d) => d.revenue),
      type: 'bar' as const,
      itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] },
    }],
  }

  const moduleOption = {
    tooltip: { trigger: 'axis' as const },
    grid: { left: 100, right: 30, top: 10, bottom: 20 },
    xAxis: {
      type: 'value' as const,
      minInterval: 1,
      axisLabel: { color: textColor, fontSize: 11 },
      splitLine: { lineStyle: { color: gridLineColor, type: 'dashed' as const } },
    },
    yAxis: {
      type: 'category' as const,
      data: moduleUsage.map((d) => d.module),
      axisLabel: { color: textColor, fontSize: 12 },
      axisLine: { lineStyle: { color: gridLineColor } },
    },
    series: [{
      data: moduleUsage.map((d, i) => ({
        value: d.count,
        itemStyle: { color: moduleColors[i % moduleColors.length], borderRadius: [0, 4, 4, 0] },
      })),
      type: 'bar' as const,
    }],
  }

  const totalInvoices = invoiceStatusBreakdown.reduce((s, d) => s + d.count, 0)
  const invoiceStatusOption = {
    tooltip: { trigger: 'item' as const, formatter: '{b}: {c} ({d}%)' },
    legend: {
      orient: 'horizontal' as const,
      bottom: 0,
      left: 'center' as const,
      textStyle: { color: textColor, fontSize: 11 },
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 16,
      icon: 'circle',
    },
    graphic: [{
      type: 'group' as const,
      left: 'center',
      top: 'middle',
      children: [
        { type: 'text' as const, style: { text: `${totalInvoices}`, fontSize: 22, fontWeight: 'bold' as const, fill: isDark ? '#f4f4f5' : '#18181b', textAlign: 'center' as const, x: 0, y: -8 } },
        { type: 'text' as const, style: { text: 'Invoices', fontSize: 12, fill: textColor, textAlign: 'center' as const, x: 0, y: 14 } },
      ],
    }],
    series: [{
      type: 'pie' as const,
      radius: ['55%', '78%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: true,
      label: { show: false },
      emphasis: {
        scale: true,
        scaleSize: 6,
        label: { show: false },
        itemStyle: { shadowBlur: 12, shadowColor: 'rgba(0,0,0,0.15)' },
      },
      itemStyle: { borderRadius: 6, borderColor: isDark ? '#09090b' : '#ffffff', borderWidth: 3 },
      data: invoiceStatusBreakdown.map((d) => ({
        name: d.status,
        value: d.count,
        itemStyle: { color: statusColors[d.status] ?? '#64748b' },
      })),
    }],
  }

  const topUserColumns: TableProps<TopUserRow>['columns'] = [
    {
      title: 'Rank',
      dataIndex: 'rank',
      key: 'rank',
      width: 60,
      align: 'center',
      render: (val) => <span className="font-medium">#{val}</span>,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      align: 'center',
    },
    {
      title: 'Total Revenue',
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      align: 'center',
      render: (val) => formatCurrency(val),
    },
    {
      title: 'Invoices',
      dataIndex: 'invoiceCount',
      key: 'invoiceCount',
      align: 'center',
    },
    {
      title: 'Joined',
      dataIndex: 'joinedAt',
      key: 'joinedAt',
      align: 'center',
      render: (val) => dayjs(val).format('MMM D, YYYY'),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Row 1: User Growth + Revenue Over Time */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <p className="text-sm text-muted-foreground">New signups per month</p>
          </CardHeader>
          <CardContent>
            <ReactECharts option={userGrowthOption} style={{ height: 280 }} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
            <p className="text-sm text-muted-foreground">Total paid invoice amounts per month</p>
          </CardHeader>
          <CardContent>
            <ReactECharts option={revenueOption} style={{ height: 280 }} />
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Module Usage + Invoice Status Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Module Usage</CardTitle>
            <p className="text-sm text-muted-foreground">Total records created across all users</p>
          </CardHeader>
          <CardContent>
            <ReactECharts option={moduleOption} style={{ height: 280 }} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoice Status Breakdown</CardTitle>
            <p className="text-sm text-muted-foreground">Distribution of invoice statuses</p>
          </CardHeader>
          <CardContent>
            <ReactECharts option={invoiceStatusOption} style={{ height: 280 }} />
          </CardContent>
        </Card>
      </div>

      {/* Top Users by Revenue */}
      <Card>
        <CardHeader>
          <CardTitle>Top Users by Revenue</CardTitle>
          <p className="text-sm text-muted-foreground">Top 10 users ranked by total paid invoice amount</p>
        </CardHeader>
        <CardContent>
          <div className="user-table">
            <Table<TopUserRow>
              columns={topUserColumns}
              dataSource={topUsers}
              rowKey="rank"
              bordered
              size="small"
              pagination={false}
              scroll={{ x: 600 }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
