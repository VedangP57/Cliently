'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Table,
  Tooltip,
  Space,
  Input,
  Select as AntdSelect,
  Button as AntdButton,
  type TableProps
} from 'antd'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ClientModal } from '@/components/clients/ClientModal'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { deleteClientAction, deleteClientsAction } from '@/lib/actions/clients'
import { formatCurrency } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  Users,
} from 'lucide-react'
import type { Client } from '@/types'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'

interface ClientTableProps {
  clients: Client[]
}

export function ClientTable({ clients }: ClientTableProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const filtered = clients
    .filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.company ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (c.email ?? '').toLowerCase().includes(search.toLowerCase())
      const matchesStatus =
        statusFilter === 'all' || c.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    const result = await deleteClientAction(deleteId)
    setDeleting(false)
    setDeleteId(null)
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
    } else {
      toast({ title: 'Client deleted' })
      router.refresh()
    }
  }

  async function handleBulkDelete() {
    setDeleting(true)
    const result = await deleteClientsAction(selectedRowKeys.map(String))
    setDeleting(false)
    setBulkDeleteOpen(false)
    setSelectedRowKeys([])
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
    } else {
      toast({ title: `${selectedRowKeys.length} clients deleted` })
      router.refresh()
    }
  }

  function openEdit(client: Client) {
    setEditingClient(client)
    setModalOpen(true)
  }

  function openCreate() {
    setEditingClient(null)
    setModalOpen(true)
  }

  const columns: TableProps<Client>['columns'] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
      render: (text, record) => (
        <Link
          href={`/dashboard/clients/${record.id}`}
          className="font-medium hover:underline text-[#0f172a]"
        >
          {text}
        </Link>
      ),
    },
    {
      title: 'Company',
      dataIndex: 'company',
      key: 'company',
      align: 'center',
      responsive: ['md'],
      render: (text) => text || '—',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      align: 'center',
      responsive: ['md'],
      render: (text) => text || '—',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      align: 'center',
      responsive: ['lg'],
      render: (text) => text || '—',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status) => <StatusBadge status={status} />,
    },
    {
      title: 'Total Earned',
      dataIndex: 'total_earned',
      key: 'total_earned',
      align: 'center',
      responsive: ['sm'],
      render: (val) => formatCurrency(val),
    },
    {
      title: 'Action',
      key: 'actions',
      width: 140,
      align: 'center',
      render: (_, record) => (
        <div className="flex items-center justify-center gap-1.5">
          <Tooltip title="View Details">
            <AntdButton
              type="text"
              size="small"
              className="flex items-center justify-center text-blue-500 hover:text-blue-600"
              icon={<Eye className="h-4 w-4" />}
              onClick={() => router.push(`/dashboard/clients/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Edit Client">
            <AntdButton
              type="text"
              size="small"
              className="flex items-center justify-center text-amber-500 hover:text-amber-600"
              icon={<Pencil className="h-4 w-4" />}
              onClick={() => openEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Client">
            <AntdButton
              type="text"
              size="small"
              className="flex items-center justify-center text-red-500 hover:text-red-600"
              icon={<Trash2 className="h-4 w-4" />}
              onClick={() => setDeleteId(record.id)}
            />
          </Tooltip>
        </div>
      ),
    },
  ]

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        description={`${clients.length} total clients`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-8 rounded-full text-sm"
            />
          </div>

          <AntdSelect
            className="w-[120px] h-8 select-rounded-full"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: 'All Status', value: 'all' },
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
              { label: 'Lead', value: 'lead' },
              { label: 'Archived', value: 'archived' },
            ]}
          />

          <AntdButton
            type="primary"
            onClick={openCreate}
            className="h-8 rounded-full bg-[#0f172a] hover:bg-[#1e293b]! border-none flex items-center gap-2 px-4 text-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            New Client
          </AntdButton>

          {selectedRowKeys.length > 0 && (
            <AntdButton
              danger
              type="primary"
              onClick={() => setBulkDeleteOpen(true)}
              className="h-8 rounded-full flex items-center gap-2 px-4 text-sm"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete ({selectedRowKeys.length})
            </AntdButton>
          )}
        </div>
      </PageHeader>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No clients found"
          description={
            clients.length === 0
              ? 'Get started by adding your first client.'
              : 'Try adjusting your search or filter.'
          }
        >
          {clients.length === 0 && (
            <AntdButton type="primary" onClick={openCreate} className="rounded-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Client
            </AntdButton>
          )}
        </EmptyState>
      ) : (
        <div className="user-table">
          <Table<Client>
            rowSelection={rowSelection}
            columns={columns}
            dataSource={filtered}
            rowKey="id"
            bordered
            size="small"
            pagination={{
              pageSize: 10,
              showSizeChanger: false,
              hideOnSinglePage: true,
              placement: 'bottomCenter',
              className: 'ant-pagination-mini',
            } as any}
            scroll={{ x: 800 }}
          />
        </div>
      )}

      <ClientModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open)
          if (!open) setEditingClient(null)
        }}
        client={editingClient}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete client"
        description="This will permanently delete this client and cannot be undone."
        onConfirm={handleDelete}
        loading={deleting}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title="Delete selected clients"
        description={`This will permanently delete ${selectedRowKeys.length} client(s). This cannot be undone.`}
        onConfirm={handleBulkDelete}
        loading={deleting}
      />
    </div>
  )
}
