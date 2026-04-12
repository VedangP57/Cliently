'use client'

import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import ReactECharts from 'echarts-for-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { useTheme } from 'next-themes'

type RangeKey = '30d' | '3m' | '6m' | '1y'

interface InvoiceInput {
  paid_at: string | null
  status: string
  amount: number
}

interface TimeLogInput {
  hours: number
  date: string
  project_title: string
}

interface ExpenseInput {
  amount: number
  date: string
  category: string
}

interface ReportsDashboardProps {
  invoices: InvoiceInput[]
  timeLogs: TimeLogInput[]
  expenses: ExpenseInput[]
}

const ranges: Array<{ key: RangeKey; label: string; months: number }> = [
  { key: '30d', label: 'Last 30 days', months: 1 },
  { key: '3m', label: '3 months', months: 3 },
  { key: '6m', label: '6 months', months: 6 },
  { key: '1y', label: '1 year', months: 12 },
]

const pieColors = ['#3b82f6', '#f59e0b', '#ef4444', '#22c55e', '#8b5cf6', '#64748b']

export function ReportsDashboard({ invoices, timeLogs, expenses }: ReportsDashboardProps) {
  const [range, setRange] = useState<RangeKey>('30d')
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const textColor = isDark ? '#a1a1aa' : '#71717a'
  const gridLineColor = isDark ? '#27272a' : '#e4e4e7'

  const months = ranges.find((item) => item.key === range)?.months ?? 1
  const periodStart = dayjs().subtract(months, 'month').startOf('day')
  const monthKeys = Array.from({ length: months }, (_, i) =>
    dayjs().subtract(months - 1 - i, 'month').format('YYYY-MM')
  )

  const filteredRevenue = useMemo(
    () =>
      invoices.filter(
        (invoice) =>
          invoice.status === 'paid' &&
          invoice.paid_at &&
          dayjs(invoice.paid_at).isAfter(periodStart) &&
          dayjs(invoice.paid_at).isBefore(dayjs().endOf('day'))
      ),
    [invoices, periodStart]
  )

  const filteredLogs = useMemo(
    () => timeLogs.filter((log) => dayjs(log.date).isAfter(periodStart) && dayjs(log.date).isBefore(dayjs().endOf('day'))),
    [timeLogs, periodStart]
  )

  const filteredExpenses = useMemo(
    () =>
      expenses.filter((expense) => dayjs(expense.date).isAfter(periodStart) && dayjs(expense.date).isBefore(dayjs().endOf('day'))),
    [expenses, periodStart]
  )

  const revenueByMonth = useMemo(() => {
    const totals = new Map<string, number>()
    monthKeys.forEach((key) => totals.set(key, 0))
    for (const invoice of filteredRevenue) {
      const key = dayjs(invoice.paid_at).format('YYYY-MM')
      totals.set(key, (totals.get(key) ?? 0) + invoice.amount)
    }
    return monthKeys.map((key) => ({
      month: dayjs(`${key}-01`).format('MMM YY'),
      revenue: Number((totals.get(key) ?? 0).toFixed(2)),
    }))
  }, [filteredRevenue, monthKeys])

  const hoursByProject = useMemo(() => {
    const totals = new Map<string, number>()
    for (const log of filteredLogs) {
      const label = log.project_title || 'Unassigned'
      totals.set(label, (totals.get(label) ?? 0) + Number(log.hours))
    }
    return Array.from(totals.entries())
      .map(([project, hours]) => ({ project, hours: Number(hours.toFixed(2)) }))
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 8)
  }, [filteredLogs])

  const expensesByCategory = useMemo(() => {
    const totals = new Map<string, number>()
    for (const expense of filteredExpenses) {
      const label = expense.category || 'other'
      totals.set(label, (totals.get(label) ?? 0) + expense.amount)
    }
    return Array.from(totals.entries()).map(([category, amount]) => ({
      category,
      amount: Number(amount.toFixed(2)),
    }))
  }, [filteredExpenses])

  const profitLossByMonth = useMemo(() => {
    const revenueMap = new Map<string, number>()
    const expenseMap = new Map<string, number>()
    monthKeys.forEach((key) => {
      revenueMap.set(key, 0)
      expenseMap.set(key, 0)
    })
    for (const invoice of filteredRevenue) {
      const key = dayjs(invoice.paid_at).format('YYYY-MM')
      revenueMap.set(key, (revenueMap.get(key) ?? 0) + invoice.amount)
    }
    for (const expense of filteredExpenses) {
      const key = dayjs(expense.date).format('YYYY-MM')
      expenseMap.set(key, (expenseMap.get(key) ?? 0) + expense.amount)
    }
    return monthKeys.map((key) => {
      const revenue = revenueMap.get(key) ?? 0
      const cost = expenseMap.get(key) ?? 0
      return {
        month: dayjs(`${key}-01`).format('MMM YY'),
        value: Number((revenue - cost).toFixed(2)),
      }
    })
  }, [filteredRevenue, filteredExpenses, monthKeys])

  const totals = useMemo(() => {
    const revenue = filteredRevenue.reduce((acc, invoice) => acc + invoice.amount, 0)
    const hours = filteredLogs.reduce((acc, log) => acc + log.hours, 0)
    const cost = filteredExpenses.reduce((acc, expense) => acc + expense.amount, 0)
    return {
      revenue,
      hours,
      expenses: cost,
      netProfit: revenue - cost,
    }
  }, [filteredRevenue, filteredLogs, filteredExpenses])

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
      data: revenueByMonth.map((d) => d.month),
      axisLabel: { color: textColor, fontSize: 11 },
      axisLine: { lineStyle: { color: gridLineColor } },
    },
    yAxis: {
      type: 'value' as const,
      axisLabel: { color: textColor, fontSize: 11 },
      splitLine: { lineStyle: { color: gridLineColor, type: 'dashed' as const } },
    },
    series: [{
      data: revenueByMonth.map((d) => d.revenue),
      type: 'line' as const,
      smooth: true,
      lineStyle: { color: '#2563eb', width: 2 },
      itemStyle: { color: '#2563eb' },
      areaStyle: { color: { type: 'linear' as const, x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: isDark ? 'rgba(37,99,235,0.3)' : 'rgba(37,99,235,0.15)' }, { offset: 1, color: 'rgba(37,99,235,0)' }] } },
    }],
  }

  const hoursOption = {
    tooltip: {
      trigger: 'axis' as const,
      formatter: (params: any) => {
        const p = Array.isArray(params) ? params[0] : params
        return `${p.name}<br/>${p.marker} Hours: ${p.value}h`
      },
    },
    grid: { left: 50, right: 20, top: 20, bottom: 50 },
    xAxis: {
      type: 'category' as const,
      data: hoursByProject.map((d) => d.project),
      axisLabel: { color: textColor, fontSize: 11, rotate: 30 },
      axisLine: { lineStyle: { color: gridLineColor } },
    },
    yAxis: {
      type: 'value' as const,
      axisLabel: { color: textColor, fontSize: 11 },
      splitLine: { lineStyle: { color: gridLineColor, type: 'dashed' as const } },
    },
    series: [{
      data: hoursByProject.map((d) => d.hours),
      type: 'bar' as const,
      itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] },
    }],
  }

  const totalExpenseAmount = filteredExpenses.reduce((s, e) => s + e.amount, 0)
  const expensesOption = {
    tooltip: { trigger: 'item' as const, formatter: (params: any) => `${params.name}<br/>${params.marker} ${formatCurrency(params.value)} (${params.percent}%)` },
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
        { type: 'text' as const, style: { text: formatCurrency(totalExpenseAmount), fontSize: 18, fontWeight: 'bold' as const, fill: isDark ? '#f4f4f5' : '#18181b', textAlign: 'center' as const, x: 0, y: -8 } },
        { type: 'text' as const, style: { text: 'Total', fontSize: 12, fill: textColor, textAlign: 'center' as const, x: 0, y: 14 } },
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
      data: expensesByCategory.map((d, i) => ({
        name: d.category,
        value: d.amount,
        itemStyle: { color: pieColors[i % pieColors.length] },
      })),
    }],
  }

  const profitLossOption = {
    tooltip: {
      trigger: 'axis' as const,
      formatter: (params: any) => {
        const p = Array.isArray(params) ? params[0] : params
        return `${p.name}<br/>${p.marker} P&L: ${formatCurrency(p.value)}`
      },
    },
    grid: { left: 60, right: 20, top: 20, bottom: 30 },
    xAxis: {
      type: 'category' as const,
      data: profitLossByMonth.map((d) => d.month),
      axisLabel: { color: textColor, fontSize: 11 },
      axisLine: { lineStyle: { color: gridLineColor } },
    },
    yAxis: {
      type: 'value' as const,
      axisLabel: { color: textColor, fontSize: 11 },
      splitLine: { lineStyle: { color: gridLineColor, type: 'dashed' as const } },
    },
    series: [{
      data: profitLossByMonth.map((d) => ({
        value: d.value,
        itemStyle: { color: d.value >= 0 ? '#22c55e' : '#ef4444', borderRadius: d.value >= 0 ? [4, 4, 0, 0] : [0, 0, 4, 4] },
      })),
      type: 'bar' as const,
    }],
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {ranges.map((option) => (
          <Button
            key={option.key}
            variant={range === option.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setRange(option.key)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {/* Row 1: Revenue + Hours */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
            <p className="text-sm text-muted-foreground">Total revenue: {formatCurrency(totals.revenue)}</p>
          </CardHeader>
          <CardContent>
            <ReactECharts option={revenueOption} style={{ height: 280 }} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hours</CardTitle>
            <p className="text-sm text-muted-foreground">Total hours: {totals.hours.toFixed(2)}h</p>
          </CardHeader>
          <CardContent>
            <ReactECharts option={hoursOption} style={{ height: 280 }} />
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Expenses + Profit & Loss */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Expenses</CardTitle>
            <p className="text-sm text-muted-foreground">Total expenses: {formatCurrency(totals.expenses)}</p>
          </CardHeader>
          <CardContent>
            <ReactECharts option={expensesOption} style={{ height: 280 }} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profit &amp; Loss</CardTitle>
            <p className="text-sm text-muted-foreground">Net profit: {formatCurrency(totals.netProfit)}</p>
          </CardHeader>
          <CardContent>
            <ReactECharts option={profitLossOption} style={{ height: 280 }} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
