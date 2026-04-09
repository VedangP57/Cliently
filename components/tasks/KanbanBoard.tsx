'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { TaskCard } from '@/components/tasks/TaskCard'
import { TaskModal } from '@/components/tasks/TaskModal'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import {
  updateTaskStatusAction,
  deleteTaskAction,
} from '@/lib/actions/tasks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Plus, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Task, Project, TaskStatus } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { GripVertical } from 'lucide-react'
import { StatusBadge } from '@/components/shared/StatusBadge'

const columns: { id: TaskStatus; label: string }[] = [
  { id: 'todo', label: 'To Do' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'in_review', label: 'In Review' },
  { id: 'done', label: 'Done' },
]

interface KanbanBoardProps {
  initialTasks: Task[]
  projects: Project[]
}

function DroppableColumn({
  id,
  label,
  children,
  count,
}: {
  id: string
  label: string
  children: React.ReactNode
  count: number
}) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col rounded-lg bg-muted/50 p-3 min-h-[400px]',
        isOver && 'ring-2 ring-primary/30'
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">{label}</h3>
        <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
          {count}
        </span>
      </div>
      <div className="flex-1 space-y-2">{children}</div>
    </div>
  )
}

export function KanbanBoard({ initialTasks, projects }: KanbanBoardProps) {
  const [tasks, setTasks] = useState(initialTasks)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [search, setSearch] = useState('')
  const [projectFilter, setProjectFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { toast } = useToast()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title
      .toLowerCase()
      .includes(search.toLowerCase())
    const matchesProject =
      projectFilter === 'all' || t.project_id === projectFilter
    return matchesSearch && matchesProject
  })

  const getColumnTasks = useCallback(
    (status: TaskStatus) =>
      filteredTasks
        .filter((t) => t.status === status)
        .sort((a, b) => a.position - b.position),
    [filteredTasks]
  )

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id)
    if (task) setActiveTask(task)
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeTaskItem = tasks.find((t) => t.id === activeId)
    if (!activeTaskItem) return

    // Determine target column
    const isOverColumn = columns.some((c) => c.id === overId)
    const targetStatus: TaskStatus = isOverColumn
      ? (overId as TaskStatus)
      : (tasks.find((t) => t.id === overId)?.status ?? activeTaskItem.status)

    if (activeTaskItem.status !== targetStatus) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === activeId ? { ...t, status: targetStatus } : t
        )
      )
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null)
    const { active } = event
    const activeId = active.id as string
    const task = tasks.find((t) => t.id === activeId)

    if (!task) return

    const columnTasks = tasks
      .filter((t) => t.status === task.status && t.id !== task.id)
      .sort((a, b) => a.position - b.position)

    const newPosition = columnTasks.length

    await updateTaskStatusAction(activeId, task.status, newPosition)
  }

  function openEdit(task: Task) {
    setEditingTask(task)
    setModalOpen(true)
  }

  function openCreate() {
    setEditingTask(null)
    setModalOpen(true)
  }

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

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {columns.map((column) => {
            const columnTasks = getColumnTasks(column.id)
            return (
              <DroppableColumn
                key={column.id}
                id={column.id}
                label={column.label}
                count={columnTasks.length}
              >
                <SortableContext
                  items={columnTasks.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onClick={() => openEdit(task)}
                    />
                  ))}
                </SortableContext>
              </DroppableColumn>
            )
          })}
        </div>

        <DragOverlay>
          {activeTask && (
            <Card className="shadow-xl rotate-2 cursor-grabbing">
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  <GripVertical className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div className="flex-1 space-y-1.5">
                    <p className="text-sm font-medium">{activeTask.title}</p>
                    <StatusBadge status={activeTask.priority} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </DragOverlay>
      </DndContext>

      <TaskModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open)
          if (!open) setEditingTask(null)
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
