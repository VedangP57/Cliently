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
  Pagination,
} from 'antd'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ProjectModal } from '@/components/projects/ProjectModal'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { deleteProjectAction } from '@/lib/actions/projects'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import {
  Plus,
  Search,
  SquarePen,
  Trash,
  ExternalLink,
} from 'lucide-react'
import type { Project, Client } from '@/types'
import type { ColumnsType } from 'antd/es/table'
import type { SorterResult } from 'antd/es/table/interface'
import { PageHeader } from '@/components/shared/PageHeader'

interface ProjectTableProps {
  projects: Project[]
  clients: Client[]
}

export function ProjectTable({ projects, clients }: ProjectTableProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [clientFilter, setClientFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend' | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const inProgressCount = projects.filter(p => p.status === 'in_progress').length
  const completedCount = projects.filter(p => p.status === 'completed').length
  const onHoldCount = projects.filter(p => p.status === 'on_hold').length

  const filtered = projects.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter
    const matchesClient = clientFilter === 'all' || p.client_id === clientFilter
    return matchesSearch && matchesStatus && matchesClient
  })

  const sorted = (() => {
    if (!sortField || !sortOrder) return filtered
    return [...filtered].sort((a, b) => {
      if (sortField === 'title') {
        return sortOrder === 'ascend'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title)
      }
      if (sortField === 'deadline') {
        const da = a.deadline ?? ''
        const db = b.deadline ?? ''
        return sortOrder === 'ascend' ? da.localeCompare(db) : db.localeCompare(da)
      }
      if (sortField === 'budget') {
        const ba = a.budget ?? -1
        const bb = b.budget ?? -1
        return sortOrder === 'ascend' ? ba - bb : bb - ba
      }
      return 0
    })
  })()

  const paginatedData = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  function handleFilterChange(setter: (v: string) => void) {
    return (v: string) => {
      setter(v)
      setCurrentPage(1)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    const result = await deleteProjectAction(deleteId)
    setDeleting(false)
    setDeleteId(null)
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
    } else {
      toast({ title: 'Project deleted' })
      router.refresh()
    }
  }

  function openEdit(project: Project) {
    setEditingProject(project)
    setModalOpen(true)
  }

  function openCreate() {
    setEditingProject(null)
    setModalOpen(true)
  }

  const columns: ColumnsType<Project> = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      align: 'center',
      sorter: true,
      sortOrder: sortField === 'title' ? sortOrder : null,
      render: (text, record) => (
        <Link
          href={`/dashboard/projects/${record.id}`}
          className="font-medium hover:underline text-[#5e5cc5] dark:text-[#a5a3e0]!"
          onClick={(e) => e.stopPropagation()}
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
        const client = clients.find((c) => c.id === record.client_id)
        return <span className="text-muted-foreground">{client?.name ?? '—'}</span>
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
      title: 'Deadline',
      dataIndex: 'deadline',
      key: 'deadline',
      align: 'center',
      sorter: true,
      sortOrder: sortField === 'deadline' ? sortOrder : null,
      render: (date) => <span className="text-muted-foreground">{formatDate(date)}</span>,
    },
    {
      title: 'Budget',
      dataIndex: 'budget',
      key: 'budget',
      align: 'center',
      sorter: true,
      sortOrder: sortField === 'budget' ? sortOrder : null,
      render: (budget) => budget ? formatCurrency(budget) : '—',
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
              onClick={() => router.push(`/dashboard/projects/${record.id}`)}
            />
          </Tooltip>
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
    <div className="flex flex-col h-[calc(100vh-64px)] lg:h-screen -mb-20 lg:-mb-6 overflow-hidden">
      {/* Page header — fixed height */}
      <div className="shrink-0 px-4 py-4  border-border dark:border-white/10 bg-background">
        <PageHeader
          title="Projects"
          description={`${projects.length} total projects`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
                className="pl-9 h-8 rounded-full text-sm"
                style={{ borderColor: '#525252' }}
                allowClear
              />
            </div>

            <AntdSelect
              className="w-[120px] h-8 select-rounded-full"
              value={statusFilter}
              onChange={handleFilterChange(setStatusFilter)}
              style={{ borderColor: '#525252' }}
              options={[
                { label: 'All Status', value: 'all' },
                { label: 'Planning', value: 'planning' },
                { label: 'In Progress', value: 'in_progress' },
                { label: 'Review', value: 'review' },
                { label: 'Completed', value: 'completed' },
                { label: 'On Hold', value: 'on_hold' },
                { label: 'Cancelled', value: 'cancelled' },
              ]}
            />

            <AntdSelect
              className="w-[140px] h-8 select-rounded-full"
              value={clientFilter}
              onChange={handleFilterChange(setClientFilter)}
              style={{ borderColor: '#525252' }}
              options={[
                { label: 'All Clients', value: 'all' },
                ...clients.map(c => ({ label: c.name, value: c.id }))
              ]}
            />

            <AntdButton
              type="primary"
              onClick={openCreate}
              className="h-8 rounded-full bg-primary hover:bg-primary/90! border-none flex items-center gap-2 px-4 text-sm text-primary-foreground"
            >
              <Plus className="h-3.5 w-3.5" />
              New Project
            </AntdButton>
          </div>
        </PageHeader>
      </div>

      {/* Stat cards */}
      <div className="shrink-0 grid grid-cols-2 sm:grid-cols-4 gap-3 px-5 pt-4 pb-2">
        {[
          { label: 'Total Projects', count: projects.length, dot: 'bg-primary', value: 'all' },
          { label: 'In Progress', count: inProgressCount, dot: 'bg-blue-500', value: 'in_progress' },
          { label: 'Completed', count: completedCount, dot: 'bg-green-500', value: 'completed' },
          { label: 'On Hold', count: onHoldCount, dot: 'bg-orange-400', value: 'on_hold' },
        ].map(({ label, count, dot, value }) => (
          <button
            key={value}
            onClick={() => handleFilterChange(setStatusFilter)(value)}
            aria-pressed={statusFilter === value}
            className={[
              'flex flex-col gap-1 p-4 rounded-lg border bg-card text-left transition-all',
              statusFilter === value
                ? 'border-l-4 border-primary bg-primary/5'
                : 'hover:bg-muted/50',
            ].join(' ')}
          >
            <span className="text-2xl font-bold">{count}</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${dot}`} />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Table — fills remaining space */}
      <div className="flex-1 min-h-0 user-table px-5 pt-2 clients-table">
        <Table<Project>
          columns={columns}
          dataSource={paginatedData}
          rowKey="id"
          bordered
          size="small"
          pagination={false}
          scroll={{ x: 800, y: 'calc(100vh - 200px)' }}
          onRow={(record) => ({
            className: 'group cursor-pointer',
            onClick: () => router.push(`/dashboard/projects/${record.id}`),
          })}
          onChange={(_, __, sorter) => {
            const s = sorter as SorterResult<Project>
            setSortField(s.order ? (s.field as string) : null)
            setSortOrder(s.order ?? null)
            setCurrentPage(1)
          }}
        />
      </div>

      {/* Pagination — always stuck at bottom */}
      <div className="shrink-0 flex items-center justify-between px-4 py-2 border-border bg-background">
        <span className="text-sm text-muted-foreground">
          {filtered.length === 0
            ? '0 of 0'
            : `${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, filtered.length)} of ${filtered.length}`}
        </span>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={filtered.length}
          showSizeChanger
          pageSizeOptions={['10', '20', '50', '100']}
          onChange={(page, size) => {
            setCurrentPage(page)
            if (size !== pageSize) setPageSize(size)
          }}
        />
      </div>

      <ProjectModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open)
          if (!open) setEditingProject(null)
        }}
        project={editingProject}
        clients={clients}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete project"
        description="This will permanently delete this project and all its tasks. This cannot be undone."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
