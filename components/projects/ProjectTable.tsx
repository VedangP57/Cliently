'use client'

import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  App,
  Table,
  Button as AntdButton,
  Input,
  Select as AntdSelect,
  Tooltip,
  Pagination,
  Checkbox,
  ConfigProvider,
} from 'antd'
import { NoiseTexture } from '@/components/ui/noise-texture'
import { ProjectModal } from '@/components/projects/ProjectModal'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { deleteProjectAction, bulkUpdateStatusAction, bulkDeleteProjectsAction } from '@/lib/actions/projects'
import { formatCurrency, formatDate } from '@/lib/utils'
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

const PROJECT_STATUS_OPTIONS = [
  { label: 'Planning', value: 'planning' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Review', value: 'review' },
  { label: 'Completed', value: 'completed' },
  { label: 'On Hold', value: 'on_hold' },
  { label: 'Cancelled', value: 'cancelled' },
]

const TABLE_DENSITY_THEME = { components: { Table: { cellPaddingBlockSM: 8 } } } as const

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
  const [view, setView] = useState<'table' | 'board'>('table')

  useEffect(() => {
    const stored = localStorage.getItem('projects-view')
    if (stored === 'table' || stored === 'board') setView(stored)
  }, [])

  const [isDark, setIsDark] = useState(false)
  useEffect(() => {
    const root = document.documentElement
    const checkDark = () => setIsDark(root.classList.contains('dark'))
    checkDark()
    const observer = new MutationObserver(checkDark)
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [bulkUpdating, setBulkUpdating] = useState(false)
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null)
  const tableWrapperRef = useRef<HTMLDivElement>(null)
  const [tableScrollY, setTableScrollY] = useState(400)
  const { notification } = App.useApp()
  const router = useRouter()

  useLayoutEffect(() => {
    if (view !== 'table') return

    const el = tableWrapperRef.current
    if (!el) return

    const updateScrollHeight = () => {
      const header = el.querySelector('.ant-table-header') as HTMLElement | null
      const headerHeight = header?.offsetHeight ?? 39
      const bodyHeight = el.clientHeight - headerHeight
      if (bodyHeight > 0) setTableScrollY(bodyHeight)
    }

    updateScrollHeight()
    const observer = new ResizeObserver(updateScrollHeight)
    observer.observe(el)
    return () => observer.disconnect()
  }, [view, selectedIds.length, pageSize, currentPage])

  const planningCount = projects.filter(p => p.status === 'planning').length
  const inProgressCount = projects.filter(p => p.status === 'in_progress').length
  const reviewCount = projects.filter(p => p.status === 'review').length
  const completedCount = projects.filter(p => p.status === 'completed').length
  const onHoldCount = projects.filter(p => p.status === 'on_hold').length
  const cancelledCount = projects.filter(p => p.status === 'cancelled').length

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
      notification.error({ title: 'Error', description: result.error })
    } else {
      notification.success({ title: 'Project deleted' })
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


  async function handleStatusChange(projectId: string, status: string) {
    setUpdatingStatusId(projectId)
    const result = await bulkUpdateStatusAction([projectId], status)
    setUpdatingStatusId(null)
    if (result.error) {
      notification.error({ title: 'Error', description: result.error })
    } else {
      notification.success({ title: 'Status updated' })
      router.refresh()
    }
  }

  async function handleBulkStatusChange(status: string) {
    setBulkUpdating(true)
    const result = await bulkUpdateStatusAction(selectedIds, status)
    setBulkUpdating(false)
    if (result.error) {
      notification.error({ title: 'Error', description: result.error })
    } else {
      notification.success({ title: `${selectedIds.length} projects updated` })
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
      notification.error({ title: 'Error', description: result.error })
    } else {
      notification.success({ title: `${count} projects deleted` })
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
      title: 'No.',
      key: 'no',
      width: 56,
      align: 'center',
      render: (_: unknown, __: Project, index: number) => (
        <span className="text-muted-foreground tabular-nums">
          {(currentPage - 1) * pageSize + index + 1}
        </span>
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
          className="project-title-link font-medium text-[#5b5fc7]! dark:text-[#a5a3e0]! hover:text-[#4f52b2]! dark:hover:text-[#b8b6e8]!"
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
      filters: clients.map(c => ({ text: c.name, value: c.id })),
      filterSearch: true,
      filterMultiple: false,
      filteredValue: clientFilter !== 'all' ? [clientFilter] : null,
      onFilter: () => true,
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
      width: 140,
      render: (status: Project['status'], record) => {
        const STATUS_COLORS: Record<string, string> = {
          planning: '#5b5fc7',
          in_progress: '#0f6cbd',
          review: '#835b00',
          completed: '#0e700e',
          on_hold: '#9a5b00',
          cancelled: '#bc2f32',
        }
        const color = STATUS_COLORS[status] ?? '#888'
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <AntdSelect
              variant="borderless"
              size="small"
              value={status}
              loading={updatingStatusId === record.id}
              onChange={(value) => handleStatusChange(record.id, value)}
              style={{ color, fontWeight: 500, minWidth: 120 }}
              options={PROJECT_STATUS_OPTIONS}
              className="status-text-select"
            />
          </div>
        )
      },
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
              className="flex items-center justify-center h-8 w-8 rounded-sm text-muted-foreground! dark:text-white/50! hover:text-[#5b5fc7]! dark:hover:text-[#a5a3e0]! hover:bg-[#5b5fc7]/10! dark:hover:bg-[#5b5fc7]/20! transition-colors"
              icon={<ExternalLink className="h-3.5 w-3.5" />}
              onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/projects/${record.id}`) }}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <AntdButton
              type="text"
              size="small"
              className="flex items-center justify-center h-8 w-8 rounded-sm text-muted-foreground! dark:text-white/50! hover:text-amber-600! dark:hover:text-amber-400! hover:bg-amber-500/10! dark:hover:bg-amber-500/15! transition-colors"
              icon={<SquarePen className="h-3.5 w-3.5" />}
              onClick={(e) => { e.stopPropagation(); openEdit(record) }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <AntdButton
              type="text"
              size="small"
              className="flex items-center justify-center h-8 w-8 rounded-sm text-muted-foreground! dark:text-white/50! hover:text-red-600! dark:hover:text-red-400! hover:bg-red-500/10! dark:hover:bg-red-500/15! transition-colors"
              icon={<Trash className="h-3.5 w-3.5" />}
              onClick={(e) => { e.stopPropagation(); setDeleteId(record.id) }}
            />
          </Tooltip>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] lg:h-screen -mb-20 lg:-mb-6 overflow-hidden bg-[#f0f0f0] dark:bg-[#0a0a0a]">
      {/* Page header — fixed height */}
      <div className="shrink-0 px-5 pb-2 pt-3 dark:border-white/10 ">
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
                allowClear
              />
            </div>

            <AntdSelect
              className="w-[130px]"
              value={statusFilter}
              onChange={handleFilterChange(setStatusFilter)}
              options={[
                { label: 'All Status', value: 'all' },
                ...PROJECT_STATUS_OPTIONS,
              ]}
            />

            <AntdSelect
              className="w-[140px] h-8 select-rounded-full"
              value={clientFilter}
              onChange={handleFilterChange(setClientFilter)}
              options={[
                { label: 'All Clients', value: 'all' },
                ...clients.map(c => ({ label: c.name, value: c.id }))
              ]}
            />

            <div className="flex items-center border border-[#e0e0e0] dark:border-border rounded-lg overflow-hidden bg-white/80 dark:bg-transparent shadow-sm">
              <button
                onClick={() => { setView('table'); localStorage.setItem('projects-view', 'table') }}
                className={[
                  'flex items-center justify-center h-8 w-8 transition-colors',
                  view === 'table'
                    ? 'bg-white text-[#242424] shadow-sm dark:bg-muted dark:text-foreground dark:shadow-none'
                    : 'text-[#9e9e9e] hover:text-[#616161] hover:bg-white/60 dark:text-muted-foreground dark:hover:text-foreground dark:hover:bg-transparent',
                ].join(' ')}
                title="Table view"
              >
                <LayoutList className="h-4 w-4" />
              </button>
              <button
                onClick={() => { setView('board'); localStorage.setItem('projects-view', 'board') }}
                className={[
                  'flex items-center justify-center h-8 w-8 transition-colors',
                  view === 'board'
                    ? 'bg-white text-[#242424] shadow-sm dark:bg-muted dark:text-foreground dark:shadow-none'
                    : 'text-[#9e9e9e] hover:text-[#616161] hover:bg-white/60 dark:text-muted-foreground dark:hover:text-foreground dark:hover:bg-transparent',
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
      <div className="shrink-0 grid grid-cols-3 sm:grid-cols-6 gap-2 px-5 pb-3 pt-1">
        {[
          { label: 'Planning',    count: planningCount,   value: 'planning',    hex: '#5b5fc7', bg: '#ecebfb' },
          { label: 'In Progress', count: inProgressCount, value: 'in_progress', hex: '#0f6cbd', bg: '#eaf2fb' },
          { label: 'Review',      count: reviewCount,      value: 'review',      hex: '#835b00', bg: '#fbf3d6' },
          { label: 'Completed',   count: completedCount,   value: 'completed',   hex: '#0e700e', bg: '#e3f3e4' },
          { label: 'On Hold',     count: onHoldCount,      value: 'on_hold',     hex: '#9a5b00', bg: '#fdeacb' },
          { label: 'Cancelled',   count: cancelledCount,   value: 'cancelled',   hex: '#bc2f32', bg: '#fbe1e1' },
        ].map(({ label, count, value, hex, bg }) => (
          <button
            key={value}
            onClick={() => handleFilterChange(setStatusFilter)(statusFilter === value ? 'all' : value)}
            aria-pressed={statusFilter === value}
            className="relative overflow-hidden flex items-center justify-between gap-2 px-3 py-1.5 rounded-md border border-[#e6e6e6] dark:border-white/10 bg-white dark:bg-[#1a1a1a] text-left transition-all cursor-pointer shadow-sm hover:border-[#c7c7c7] dark:hover:border-white/20"
            style={statusFilter === value
              ? {
                  borderColor: hex,
                  borderBottomWidth: '2px',
                  backgroundColor: isDark
                    ? `color-mix(in srgb, ${hex} 18%, #1a1a1a)`
                    : bg,
                }
              : undefined}
          >
            <NoiseTexture id={`stat-${value}`} className="absolute inset-0 z-0 stat-card-noise" baseFrequency={0.65} />
            <div className="relative z-[1] flex items-center gap-1.5 min-w-0">
              <span className="shrink-0 w-2 h-2 rounded-full" style={{ backgroundColor: hex }} />
              <span className="text-xs text-muted-foreground truncate">{label}</span>
            </div>
            <span className="relative z-[1] text-sm font-semibold tabular-nums" style={statusFilter === value ? { color: hex } : undefined}>{count}</span>
          </button>
        ))}
      </div>

      {/* Table or Board — fills remaining space */}
      <div className="flex-1 min-h-0 overflow-hidden px-5 pb-2">
        <div className="h-full flex flex-col bg-white dark:bg-[#1a1a1a] rounded-lg border border-[#e6e6e6] dark:border-white/10 shadow-sm overflow-hidden">
        {view === 'table' ? (
          <div
            ref={tableWrapperRef}
            className={`h-full user-table clients-table table-fill${paginatedData.length >= 10 ? ' table-stretch' : ''}`}
            style={{ '--table-body-h': `${tableScrollY}px` } as React.CSSProperties}
          >
            <ConfigProvider theme={TABLE_DENSITY_THEME}>
              <Table<Project>
                columns={columns}
                dataSource={paginatedData}
                rowKey="id" 
                size="small"
                pagination={false}
                scroll={{ x: 800, y: tableScrollY }}
                onChange={(_, filters, sorter) => {
                  const clientVal = filters['client']
                  handleFilterChange(setClientFilter)(
                    clientVal && clientVal.length > 0 ? String(clientVal[0]) : 'all'
                  )
                  const s = Array.isArray(sorter) ? sorter[0] : sorter as SorterResult<Project>
                  setSortField(s?.order ? (s.field as keyof Project) : null)
                  setSortOrder(s?.order ?? null)
                  setCurrentPage(1)
                }}
              />
            </ConfigProvider>
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
      </div>

      {view === 'table' && selectedIds.length > 0 && (
        <div className="shrink-0 flex items-center justify-between px-5 py-2 border-t border-b border-primary/30 bg-primary/5 transition-all duration-200">
          <span className="text-sm font-medium text-foreground">{selectedIds.length} selected</span>
          <div className="flex items-center gap-2">
            <AntdSelect
              size="small"
              placeholder="Change status…"
              className="w-[150px]"
              loading={bulkUpdating}
              onChange={handleBulkStatusChange}
              value={null}
              options={PROJECT_STATUS_OPTIONS}
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
        <div className="shrink-0 flex items-center justify-between px-5 pt-2 pb-4 border-border">
          <span className="text-sm text-muted-foreground">
            {filtered.length === 0
              ? '0 of 0'
              : `${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, filtered.length)} of ${filtered.length}`}
          </span>
          <Pagination
            size="small"
            className="projects-pagination"
            current={currentPage}
            pageSize={pageSize}
            total={filtered.length}
            showSizeChanger
            pageSizeOptions={[10, 20, 50, 100]}
            onChange={(page) => {
              setCurrentPage(page)
              setSelectedIds([])
            }}
            onShowSizeChange={(_, size) => {
              setPageSize(size)
              setCurrentPage(1)
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
