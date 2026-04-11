'use client'

import { useState } from 'react'
import {
  Button as AntdButton,
  Input,
  Select as AntdSelect,
  Segmented,
} from 'antd'
import { PageHeader } from '@/components/shared/PageHeader'
import { TaskModal } from '@/components/tasks/TaskModal'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { KanbanBoard } from '@/components/tasks/KanbanBoard'
import { TaskTable } from '@/components/tasks/TaskTable'
import { deleteTaskAction } from '@/lib/actions/tasks'
import { useToast } from '@/hooks/use-toast'
import { Plus, Search, LayoutGrid, TableProperties } from 'lucide-react'
import type { Task, Project } from '@/types'

interface TasksWrapperProps {
  initialTasks: Task[]
  projects: Project[]
}

const statusOptions = [
  { label: 'All Status', value: 'all' },
  { label: 'To Do', value: 'todo' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'In Review', value: 'in_review' },
  { label: 'Done', value: 'done' },
]

export function TasksWrapper({ initialTasks, projects }: TasksWrapperProps) {
  const [tasks, setTasks] = useState(initialTasks)
  const [view, setView] = useState<'kanban' | 'table'>('kanban')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [projectFilter, setProjectFilter] = useState<string>('all')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const { toast } = useToast()

  const filteredTasks = (tasks || []).filter((t) => {
    const matchesSearch = t?.title?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter
    const matchesProject = projectFilter === 'all' || t.project_id === projectFilter
    return matchesSearch && matchesStatus && matchesProject
  })

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    const result = await deleteTaskAction(deleteId)
    setDeleting(false)
    setDeleteId(null)
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
    } else {
      setTasks((prev) => prev.filter((t) => t.id !== deleteId))
      toast({ title: 'Task deleted' })
    }
  }

  function openEdit(task: Task) {
    setEditingTask(task)
    setModalOpen(true)
  }

  function openCreate() {
    setEditingTask(null)
    setModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        description={`${tasks.length} total task${tasks.length === 1 ? '' : 's'}`}
      >
        <div className="flex flex-wrap items-center gap-2">

          <div className="relative w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-8 rounded-full text-sm"
              allowClear
            />
          </div>

          <AntdSelect
            className="w-[130px] h-8 select-rounded-full"
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
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
            New Task
          </AntdButton>

          <Segmented
            options={[
              { value: 'kanban', icon: <span className="flex items-center justify-center mt-1"><LayoutGrid className="h-4 w-4" /></span> },
              { value: 'table', icon: <span className="flex items-center justify-center mt-1"><TableProperties className="h-4 w-4" /></span> },
            ]}
            value={view}
            onChange={(val) => setView(val as 'kanban' | 'table')}
            className="h-8 flex items-center"
          />
        </div>
      </PageHeader>

      <div className={view === 'kanban' ? 'block' : 'hidden'}>
        <KanbanBoard
          tasks={tasks}
          setTasks={setTasks}
          filteredTasks={filteredTasks}
          onEdit={openEdit}
        />
      </div>

      <div className={view === 'table' ? 'block' : 'hidden'}>
        <TaskTable
          filteredTasks={filteredTasks}
          onEdit={openEdit}
          onDelete={(id: string) => setDeleteId(id)}
        />
      </div>

      <TaskModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open)
          if (!open) {
            setEditingTask(null)
          }
        }}
        task={editingTask}
        projects={projects}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete task"
        description="This will permanently delete this task."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
