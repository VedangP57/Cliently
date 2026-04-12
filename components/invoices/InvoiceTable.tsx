'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Table,
  Button as AntdButton,
  Input,
  Select as AntdSelect,
  Tooltip,
} from 'antd'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { deleteInvoiceAction } from '@/lib/actions/invoices'
import { formatCurrency, formatDate, isOverdue } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import {
  Plus,
  Search,
  SquarePen,
  Trash,
  ExternalLink,
  Copy,
  FileSpreadsheet
} from 'lucide-react'
import type { Invoice } from '@/types'
import type { ColumnsType } from 'antd/es/table'
import { PageHeader } from '@/components/shared/PageHeader'

interface InvoiceTableProps {
  invoices: Invoice[]
}

export function InvoiceTable({ invoices }: InvoiceTableProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  function getDisplayStatus(invoice: Invoice) {
    if (isOverdue(invoice.due_date, invoice.status) && invoice.status === 'sent') return 'overdue'
    return invoice.status
  }

  const filtered = invoices.filter((inv) => {
    const matchesSearch = (inv.invoice_number ?? '')
      .toLowerCase()
      .includes(search.toLowerCase())
    const displayStatus = getDisplayStatus(inv)
    const matchesStatus =
      statusFilter === 'all' || displayStatus === statusFilter
    return matchesSearch && matchesStatus
  })

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    const result = await deleteInvoiceAction(deleteId)
    setDeleting(false)
    setDeleteId(null)
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
    } else {
      toast({ title: 'Invoice deleted' })
      router.refresh()
    }
  }

  function copyLink(slug: string | null) {
    if (!slug) {
      toast({ title: 'No link available', variant: 'destructive' })
      return
    }
    navigator.clipboard.writeText(`${window.location.origin}/share/invoice/${slug}`)
    toast({ title: 'Link copied' })
  }

  const columns: ColumnsType<Invoice> = [
    {
      title: 'Invoice #',
      dataIndex: 'invoice_number',
      key: 'invoice_number',
      align: 'center',
      render: (text, record) => (
        <Link
          href={`/dashboard/invoices/${record.id}`}
          className="font-medium hover:underline text-[#5e5cc5] dark:text-[#a5a3e0]!"
        >
          {text ?? '—'}
        </Link>
      ),
    },
    {
      title: 'Client',
      key: 'client',
      align: 'center',
      render: (_, record) => {
        return <span className="text-muted-foreground">{record.client?.name ?? '—'}</span>
      },
    },
    {
      title: 'Status',
      key: 'status',
      align: 'center',
      render: (_, record) => <StatusBadge status={getDisplayStatus(record)} />,
    },
    {
      title: 'Issue Date',
      dataIndex: 'issue_date',
      key: 'issue_date',
      align: 'center',
      render: (date) => <span className="text-muted-foreground">{formatDate(date)}</span>,
    },
    {
      title: 'Due Date',
      dataIndex: 'due_date',
      key: 'due_date',
      align: 'center',
      render: (date) => <span className="text-muted-foreground">{formatDate(date)}</span>,
    },
    {
      title: 'Amount',
      key: 'amount',
      align: 'center',
      render: (_, record) => {
        const amount = (record.invoice_items ?? []).reduce((s, item) => s + item.amount, 0)
        return <span className="font-medium">{formatCurrency(amount)}</span>
      },
    },
    {
      title: 'Action',
      key: 'actions',
      width: 140,
      align: 'center',
      render: (_, record) => (
        <div className="flex items-center justify-center gap-1">
          <Tooltip title="View">
            <AntdButton
              type="text"
              size="small"
              className="flex items-center justify-center h-8 w-8 rounded-lg text-blue-500! hover:text-blue-600! hover:bg-transparent"
              icon={<ExternalLink className="h-3.5 w-3.5" />}
              onClick={() => router.push(`/dashboard/invoices/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <AntdButton
              type="text"
              size="small"
              className="flex items-center justify-center h-8 w-8 rounded-lg text-amber-500! hover:text-amber-600! hover:bg-transparent"
              icon={<SquarePen className="h-3.5 w-3.5" />}
              onClick={() => router.push(`/dashboard/invoices/${record.id}`)}
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
        title="Invoices"
        description={`${invoices.length} total invoices`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-8 rounded-full text-sm"
              allowClear
            />
          </div>

          <AntdSelect
            className="w-[120px] h-8 select-rounded-full"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: 'All Status', value: 'all' },
              { label: 'Draft', value: 'draft' },
              { label: 'Sent', value: 'sent' },
              { label: 'Paid', value: 'paid' },
              { label: 'Overdue', value: 'overdue' },
              { label: 'Cancelled', value: 'cancelled' },
            ]}
          />

          <AntdButton
            type="primary"
            onClick={() => router.push('/dashboard/invoices/new')}
            className="h-8 rounded-full bg-primary hover:bg-primary/90! border-none flex items-center gap-2 px-4 text-sm text-primary-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            New Invoice
          </AntdButton>
        </div>
      </PageHeader>

      {filtered.length === 0 ? (
        <EmptyState
          icon={FileSpreadsheet}
          title="No invoices found"
          description={
            invoices.length === 0
              ? 'Create your first invoice to get paid.'
              : 'Try adjusting your search or filter.'
          }
        >
          {invoices.length === 0 && (
            <AntdButton type="primary" onClick={() => router.push('/dashboard/invoices/new')} className="rounded-full">
              <Plus className="mr-2 h-4 w-4" />
              Create Invoice
            </AntdButton>
          )}
        </EmptyState>
      ) : (
        <div className="user-table">
          <Table<Invoice>
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
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete invoice"
        description="This will permanently delete this invoice. This cannot be undone."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
