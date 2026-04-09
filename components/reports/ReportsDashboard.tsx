'use client'

import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import {
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'

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

function formatTooltipValue(value: unknown, suffix = '') {
  const numeric = typeof value === 'number' ? value : Number(value ?? 0)
  if (Number.isNaN(numeric)) return `${value ?? ''}`
  return suffix ? `${numeric.toFixed(2)}${suffix}` : formatCurrency(numeric)
}

export function ReportsDashboard({ invoices, timeLogs, expenses }: ReportsDashboardProps) {
  const [range, setRange] = useState<RangeKey>('30d')
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

      <Card>
        <CardHeader>
          <CardTitle>Revenue</CardTitle>
          <p className="text-sm text-muted-foreground">Total revenue: {formatCurrency(totals.revenue)}</p>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatTooltipValue(value)} />
              <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hours</CardTitle>
          <p className="text-sm text-muted-foreground">Total hours: {totals.hours.toFixed(2)}h</p>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hoursByProject}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="project" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip formatter={(value) => formatTooltipValue(value, 'h')} />
              <Bar dataKey="hours" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expenses</CardTitle>
          <p className="text-sm text-muted-foreground">Total expenses: {formatCurrency(totals.expenses)}</p>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={expensesByCategory} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={100} label>
                {expensesByCategory.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatTooltipValue(value)} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profit &amp; Loss</CardTitle>
          <p className="text-sm text-muted-foreground">Net profit: {formatCurrency(totals.netProfit)}</p>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={profitLossByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatTooltipValue(value)} />
              <Bar dataKey="value">
                {profitLossByMonth.map((entry, index) => (
                  <Cell key={`pl-cell-${index}`} fill={entry.value >= 0 ? '#22c55e' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
