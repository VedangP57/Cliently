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
import { deleteContractAction } from '@/lib/actions/contracts'
import { formatDate } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import {
  Plus,
  Search,
  SquarePen,
  Trash,
  ExternalLink,
  Copy,
  FileSignature
} from 'lucide-react'
import type { Contract } from '@/types'
import type { ColumnsType } from 'antd/es/table'
import { PageHeader } from '@/components/shared/PageHeader'

interface ContractTableProps {
  contracts: Contract[]
}

export function ContractTable({ contracts }: ContractTableProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const filtered = contracts.filter((c) => {
    const matchesSearch = c.title
      .toLowerCase()
      .includes(search.toLowerCase())
    const matchesStatus =
      statusFilter === 'all' || c.status === statusFilter
    return matchesSearch && matchesStatus
  })

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    const result = await deleteContractAction(deleteId)
    setDeleting(false)
    setDeleteId(null)
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
    } else {
      toast({ title: 'Contract deleted' })
      router.refresh()
    }
  }

  function copyLink(slug: string | null) {
    if (!slug) {
      toast({ title: 'No link generated yet', variant: 'destructive' })
      return
    }
    const url = `${window.location.origin}/share/contract/${slug}`
    navigator.clipboard.writeText(url)
    toast({ title: 'Link copied to clipboard' })
  }

  const columns: ColumnsType<Contract> = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      align: 'center',
      render: (text, record) => (
        <Link
          href={`/dashboard/contracts/${record.id}`}
          className="font-medium hover:underline text-[#5e5cc5] dark:text-[#a5a3e0]!"
        >
          {text}
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
      title: 'Project',
      key: 'project',
      align: 'center',
      render: (_, record) => {
        return <span className="text-muted-foreground">{record.project?.title ?? '—'}</span>
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status) => <StatusBadge status={status} />,
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      align: 'center',
      render: (date) => <span className="text-muted-foreground">{formatDate(date)}</span>,
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
              onClick={() => router.push(`/dashboard/contracts/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <AntdButton
              type="text"
              size="small"
              className="flex items-center justify-center h-8 w-8 rounded-lg text-amber-500! hover:text-amber-600! hover:bg-transparent"
              icon={<SquarePen className="h-3.5 w-3.5" />}
              onClick={() => router.push(`/dashboard/contracts/${record.id}`)}
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
        title="Contracts"
        description={`${contracts.length} total contracts`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search contracts..."
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
              { label: 'Signed', value: 'signed' },
              { label: 'Expired', value: 'expired' },
            ]}
          />

          <AntdButton
            type="primary"
            onClick={() => router.push('/dashboard/contracts/new')}
            className="h-8 rounded-full bg-primary hover:bg-primary/90! border-none flex items-center gap-2 px-4 text-sm text-primary-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            New Contract
          </AntdButton>
        </div>
      </PageHeader>

      {filtered.length === 0 ? (
        <EmptyState
          icon={FileSignature}
          title="No contracts found"
          description={
            contracts.length === 0
              ? 'Create your first contract to send to clients.'
              : 'Try adjusting your search or filter.'
          }
        >
          {contracts.length === 0 && (
            <AntdButton type="primary" onClick={() => router.push('/dashboard/contracts/new')} className="rounded-full">
              <Plus className="mr-2 h-4 w-4" />
              Create Contract
            </AntdButton>
          )}
        </EmptyState>
      ) : (
        <div className="user-table">
          <Table<Contract>
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
        title="Delete contract"
        description="This will permanently delete this contract. This cannot be undone."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
