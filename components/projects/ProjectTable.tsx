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
  Typography, 
  Space 
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
  Pencil,
  Trash2,
  Eye,
} from 'lucide-react'
import type { Project, Client } from '@/types'
import type { ColumnsType } from 'antd/es/table'
import { PageHeader } from '@/components/shared/PageHeader'

const { Text } = Typography

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
  const { toast } = useToast()
  const router = useRouter()

  const filtered = projects.filter((p) => {
    const matchesSearch = p.title
      .toLowerCase()
      .includes(search.toLowerCase())
    const matchesStatus =
        statusFilter === 'all' || p.status === statusFilter
    const matchesClient =
        clientFilter === 'all' || p.client_id === clientFilter
    return matchesSearch && matchesStatus && matchesClient
  })

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
      render: (text, record) => (
        <Link
          href={`/dashboard/projects/${record.id}`}
          className="font-medium hover:underline text-[#0f172a]"
        >
          {text}
        </Link>
      ),
    },
    {
      title: 'Client',
      key: 'client',
      align: 'center',
      responsive: ['md'],
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
      responsive: ['sm'],
      render: (date) => <span className="text-muted-foreground">{formatDate(date)}</span>,
    },
    {
      title: 'Budget',
      dataIndex: 'budget',
      key: 'budget',
      align: 'center',
      responsive: ['lg'],
      render: (budget) => budget ? formatCurrency(budget) : '—',
    },
    {
      title: 'Action',
      key: 'actions',
      width: 140,
      align: 'center',
      render: (_, record) => (
        <div className="flex items-center justify-center gap-1.5">
          <Tooltip title="View Project">
            <AntdButton
              type="primary"
              size="small"
              className="flex items-center justify-center rounded-md bg-blue-500 hover:bg-blue-600! border-none shadow-none"
              icon={<Eye className="h-3.5 w-3.5" />}
              onClick={() => router.push(`/dashboard/projects/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Edit Project">
            <AntdButton
              type="primary"
              size="small"
              className="flex items-center justify-center rounded-md bg-amber-500 hover:bg-amber-600! border-none shadow-none"
              icon={<Pencil className="h-3.5 w-3.5" />}
              onClick={() => openEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Project">
            <AntdButton
              type="primary"
              size="small"
              className="flex items-center justify-center rounded-md bg-red-500 hover:bg-red-600! border-none shadow-none"
              icon={<Trash2 className="h-3.5 w-3.5" />}
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
        title="Projects"
        description={`${projects.length} total projects`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
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
            onChange={setClientFilter}
            options={[
              { label: 'All Clients', value: 'all' },
              ...clients.map(c => ({ label: c.name, value: c.id }))
            ]}
          />

          <AntdButton 
            type="primary" 
            onClick={openCreate} 
            className="h-8 rounded-full bg-[#0f172a] hover:bg-[#1e293b]! border-none flex items-center gap-2 px-4 text-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            New Project
          </AntdButton>
        </div>
      </PageHeader>

      <div className="user-table">
        <Table<Project>
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          bordered
          size="small"
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            position: ['bottomCenter'],
            className: 'ant-pagination-mini',
            hideOnSinglePage: true,
          } as any}
          scroll={{ x: 800 }}
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
