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
  Checkbox,
} from 'antd'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ProjectModal } from '@/components/projects/ProjectModal'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { deleteProjectAction, bulkUpdateStatusAction, bulkDeleteProjectsAction } from '@/lib/actions/projects'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import {
  Plus,
  Search,
  SquarePen,
  Trash,
  ExternalLink,
  LayoutList,
  LayoutGrid,
} from 'lucide-react'
import type { Project, Client } from '@/types'
import type { ColumnsType } from 'antd/es/table'
import type { SorterResult } from 'antd/es/table/interface'
import { PageHeader } from '@/components/shared/PageHeader'
import { ProjectBoardView } from '@/components/projects/ProjectBoardView'

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
  const [sortField, setSortField] = useState<keyof Project | null>(null)
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend' | null>(null)
  const [view, setView] = useState<'table' | 'board'>(() => {
    if (typeof window === 'undefined') return 'table'
    const stored = localStorage.getItem('projects-view')
    return stored === 'board' ? 'board' : 'table'
  })
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [bulkUpdating, setBulkUpdating] = useState(false)
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
        const da = a.deadline ?? null
        const db = b.deadline ?? null
        if (!da && !db) return 0
        if (!da) return sortOrder === 'ascend' ? 1 : -1
        if (!db) return sortOrder === 'ascend' ? -1 : 1
        return sortOrder === 'ascend' ? da.localeCompare(db) : db.localeCompare(da)
      }
      if (sortField === 'budget') {
        const ba = a.budget ?? null
        const bb = b.budget ?? null
        if (ba === null && bb === null) return 0
        if (ba === null) return sortOrder === 'ascend' ? 1 : -1
        if (bb === null) return sortOrder === 'ascend' ? -1 : 1
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
      setSelectedIds([])
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

  async function handleBulkStatusChange(status: string) {
    setBulkUpdating(true)
    const result = await bulkUpdateStatusAction(selectedIds, status)
    setBulkUpdating(false)
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
    } else {
      toast({ title: `${selectedIds.length} projects updated` })
      setSelectedIds([])
      router.refresh()
    }
  }

  async function handleBulkDelete() {
    setBulkUpdating(true)
    const count = selectedIds.length
    const result = await bulkDeleteProjectsAction(selectedIds)
    setBulkUpdating(false)
    setBulkDeleteOpen(false)
    setSelectedIds([])
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
    } else {
      toast({ title: `${count} projects deleted` })
      router.refresh()
    }
  }

  const columns: ColumnsType<Project> = [
    {
      key: 'select',
      width: 40,
      align: 'center' as const,
      title: (
        <Checkbox
          checked={paginatedData.length > 0 && paginatedData.every(p => selectedIds.includes(p.id))}
          indeterminate={
            paginatedData.some(p => selectedIds.includes(p.id)) &&
            !paginatedData.every(p => selectedIds.includes(p.id))
          }
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedIds(paginatedData.map(p => p.id))
            } else {
              setSelectedIds([])
            }
          }}
        />
      ),
      render: (_: unknown, record: Project) => (
        <Checkbox
          checked={selectedIds.includes(record.id)}
          onChange={(e) => {
            e.nativeEvent.stopImmediatePropagation()
            if (e.target.checked) {
              setSelectedIds(prev => [...prev, record.id])
            } else {
              setSelectedIds(prev => prev.filter(id => id !== record.id))
            }
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
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
        <div className="flex items-center justify-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150">
          <Tooltip title="View">
            <AntdButton
              type="text"
              size="small"
              className="flex items-center justify-center h-8 w-8 rounded-lg text-blue-500! hover:text-blue-600! hover:bg-transparent"
              icon={<ExternalLink className="h-3.5 w-3.5" />}
              onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/projects/${record.id}`) }}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <AntdButton
              type="text"
              size="small"
              className="flex items-center justify-center h-8 w-8 rounded-lg text-amber-500! hover:text-amber-600! hover:bg-transparent"
              icon={<SquarePen className="h-3.5 w-3.5" />}
              onClick={(e) => { e.stopPropagation(); openEdit(record) }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <AntdButton
              type="text"
              size="small"
              className="flex items-center justify-center h-8 w-8 rounded-lg text-red-500! hover:text-red-600! hover:bg-transparent"
              icon={<Trash className="h-3.5 w-3.5" />}
              onClick={(e) => { e.stopPropagation(); setDeleteId(record.id) }}
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
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); setSelectedIds([]) }}
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

            <div className="flex items-center border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => { setView('table'); localStorage.setItem('projects-view', 'table') }}
                className={[
                  'flex items-center justify-center h-8 w-8 transition-colors',
                  view === 'table' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground',
                ].join(' ')}
                title="Table view"
              >
                <LayoutList className="h-4 w-4" />
              </button>
              <button
                onClick={() => { setView('board'); localStorage.setItem('projects-view', 'board') }}
                className={[
                  'flex items-center justify-center h-8 w-8 transition-colors',
                  view === 'board' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground',
                ].join(' ')}
                title="Board view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>

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

      {/* Table or Board — fills remaining space */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {view === 'table' ? (
          <div className="h-full user-table px-5 pt-2 clients-table">
            <Table<Project>
              columns={columns}
              dataSource={paginatedData}
              rowKey="id"
              bordered
              size="small"
              pagination={false}
              scroll={{ x: 800, y: 'calc(100vh - 280px)' }}
              onRow={(record) => ({
                className: 'group cursor-pointer',
                onClick: () => router.push(`/dashboard/projects/${record.id}`),
              })}
              onChange={(_, __, sorter) => {
                const s = Array.isArray(sorter) ? sorter[0] : sorter as SorterResult<Project>
                setSortField(s?.order ? (s.field as keyof Project) : null)
                setSortOrder(s?.order ?? null)
                setCurrentPage(1)
              }}
            />
          </div>
        ) : (
          <div className="h-full pt-2">
            <ProjectBoardView
              projects={sorted}
              clients={clients}
              onEdit={openEdit}
              onDelete={(id) => setDeleteId(id)}
            />
          </div>
        )}
      </div>

      {view === 'table' && selectedIds.length > 0 && (
        <div className="shrink-0 flex items-center justify-between px-4 py-2 border-t border-primary/30 bg-primary/5 transition-all duration-200">
          <span className="text-sm font-medium text-foreground">{selectedIds.length} selected</span>
          <div className="flex items-center gap-2">
            <AntdSelect
              size="small"
              placeholder="Change status…"
              className="w-[150px]"
              loading={bulkUpdating}
              onChange={handleBulkStatusChange}
              value={null}
              options={[
                { label: 'Planning', value: 'planning' },
                { label: 'In Progress', value: 'in_progress' },
                { label: 'Review', value: 'review' },
                { label: 'Completed', value: 'completed' },
                { label: 'On Hold', value: 'on_hold' },
                { label: 'Cancelled', value: 'cancelled' },
              ]}
            />
            <AntdButton
              danger
              size="small"
              loading={bulkUpdating}
              onClick={() => setBulkDeleteOpen(true)}
            >
              Delete
            </AntdButton>
          </div>
        </div>
      )}

      {view === 'table' && (
        <div className="shrink-0 flex items-center justify-between px-4 py-2 border-t border-border bg-background">
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
              setSelectedIds([])
            }}
          />
        </div>
      )}

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

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title={`Delete ${selectedIds.length} projects`}
        description={`This will permanently delete ${selectedIds.length} projects and all their tasks. This cannot be undone.`}
        onConfirm={handleBulkDelete}
        loading={bulkUpdating}
      />
    </div>
  )
}
