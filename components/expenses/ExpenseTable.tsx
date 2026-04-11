'use client'

import { useState } from 'react'
import {
  Table,
  Button as AntdButton,
  Input,
  Select as AntdSelect,
  Tooltip,
} from 'antd'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Badge } from '@/components/ui/badge'
import { ExpenseModal } from '@/components/expenses/ExpenseModal'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { deleteExpenseAction } from '@/lib/actions/expenses'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import {
  Plus,
  Search,
  SquarePen,
  Trash,
  ExternalLink,
  Receipt
} from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import type { Expense, Project } from '@/types'
import type { ColumnsType } from 'antd/es/table'

interface ExpenseTableProps {
  expenses: Expense[]
  projects: Project[]
}

export function ExpenseTable({ expenses, projects }: ExpenseTableProps) {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [projectFilter, setProjectFilter] = useState<string>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { toast } = useToast()

  const filtered = expenses.filter((e) => {
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase())
    const matchesCategory =
      categoryFilter === 'all' || e.category === categoryFilter
    const matchesProject =
      projectFilter === 'all' || e.project_id === projectFilter
    return matchesSearch && matchesCategory && matchesProject
  })

  const totalAmount = filtered.reduce((sum, e) => sum + e.amount, 0)

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    const result = await deleteExpenseAction(deleteId)
    setDeleting(false)
    setDeleteId(null)
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
    } else {
      toast({ title: 'Expense deleted' })
    }
  }

  function openEdit(expense: Expense) {
    setEditingExpense(expense)
    setModalOpen(true)
  }

  function openCreate() {
    setEditingExpense(null)
    setModalOpen(true)
  }

  const columns: ColumnsType<Expense> = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      align: 'center',
      render: (date) => <span className="whitespace-nowrap text-muted-foreground">{formatDate(date)}</span>,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      align: 'center',
      render: (title) => <span className="font-medium">{title}</span>,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      align: 'center',
      render: (category) => <StatusBadge status={category} />,
    },
    {
      title: 'Project',
      key: 'project',
      align: 'center',
      render: (_, record) => {
        return <span className="text-muted-foreground">{record.project?.title ?? '—'}</span>
      },
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      align: 'center',
      render: (amount) => <span className="font-medium">{formatCurrency(amount)}</span>,
    },
    {
      title: 'Billable',
      dataIndex: 'billable',
      key: 'billable',
      align: 'center',
      render: (billable) => (
        <Badge variant={billable ? 'default' : 'secondary'}>
          {billable ? 'Yes' : 'No'}
        </Badge>
      ),
    },
    {
      title: 'Action',
      key: 'actions',
      width: 140,
      align: 'center',
      render: (_, record) => (
        <div className="flex items-center justify-center gap-1">
          {record.receipt_url && (
            <Tooltip title="View Receipt">
              <AntdButton
                type="text"
                size="small"
                className="flex items-center justify-center h-8 w-8 rounded-lg text-blue-500! hover:text-blue-600! hover:bg-transparent"
                icon={<ExternalLink className="h-3.5 w-3.5" />}
                onClick={() => window.open(record.receipt_url!, '_blank', 'noopener,noreferrer')}
              />
            </Tooltip>
          )}
          <Tooltip title="Edit">
            <AntdButton
              type="text"
              size="small"
              className="flex items-center justify-center h-8 w-8 rounded-lg text-amber-500! hover:text-amber-600! hover:bg-transparent"
              icon={<SquarePen className="h-3.5 w-3.5" />}
              onClick={() => openEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <AntdButton
              type="text"
              size="small"
              className="flex items-center justify-center h-8 w-8 rounded-lg text-red-500! hover:text-red-600! hover:bg-transparent"
              icon={<Trash className="h-3.5 w-3.5" />}
              onClick={() => setDeleteId(record.id)}
            />
          </Tooltip>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        description={`${expenses.length} tracked expense${expenses.length === 1 ? '' : 's'}`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-8 rounded-full text-sm"
              allowClear
            />
          </div>

          <AntdSelect
            className="w-[120px] h-8 select-rounded-full"
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={[
              { label: 'All Categories', value: 'all' },
              { label: 'Software', value: 'software' },
              { label: 'Hardware', value: 'hardware' },
              { label: 'Travel', value: 'travel' },
              { label: 'Marketing', value: 'marketing' },
              { label: 'Meals', value: 'meals' },
              { label: 'Other', value: 'other' },
            ]}
          />

          <AntdSelect
            className="w-[140px] h-8 select-rounded-full"
            value={projectFilter}
            onChange={setProjectFilter}
            options={[
              { label: 'All Projects', value: 'all' },
              ...projects.map((p) => ({ label: p.title, value: p.id }))
            ]}
          />

          <AntdButton
            type="primary"
            onClick={openCreate}
            className="h-8 rounded-full bg-primary hover:bg-primary/90! border-none flex items-center gap-2 px-4 text-sm text-primary-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            New Expense
          </AntdButton>
        </div>
      </PageHeader>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No expenses found"
          description={
            expenses.length === 0
              ? 'Get started by adding your first expense.'
              : 'Try adjusting your search or filters.'
          }
        >
          {expenses.length === 0 && (
            <AntdButton type="primary" onClick={openCreate} className="rounded-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </AntdButton>
          )}
        </EmptyState>
      ) : (
        <div className="user-table space-y-4">
          <Table<Expense>
            columns={columns}
            dataSource={filtered}
            rowKey="id"
            bordered
            size="small"
            pagination={{
              pageSize: 10,
              showSizeChanger: false,
              placement: ['bottomCenter'],
              className: 'ant-pagination-mini',
              hideOnSinglePage: true,
            }}
            scroll={{ x: 800 }}
          />

          <div className="flex justify-end">
            <div className="rounded-lg border bg-muted/50 px-4 py-2 text-sm">
              <span className="text-muted-foreground mr-2">Total:</span>
              <span className="font-semibold">{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </div>
      )}

      <ExpenseModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open)
          if (!open) setEditingExpense(null)
        }}
        expense={editingExpense}
        projects={projects}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete expense"
        description="This will permanently delete this expense and cannot be undone."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
