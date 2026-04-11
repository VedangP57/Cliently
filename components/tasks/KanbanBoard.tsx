// Force Turbopack Cache Invalidation
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
import { updateTaskStatusAction } from '@/lib/actions/tasks'
import { cn } from '@/lib/utils'
import type { Task, TaskStatus } from '@/types'
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
  tasks: Task[]
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>
  filteredTasks: Task[]
  onEdit: (task: Task) => void
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
        'flex flex-col rounded-lg bg-muted/50 p-3 min-h-[400px] lg:min-h-0',
        isOver && 'ring-2 ring-primary/30'
      )}
    >
      <div className="flex items-center justify-between mb-3 shrink-0">
        <h3 className="text-sm font-semibold">{label}</h3>
        <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
          {count}
        </span>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">{children}</div>
    </div>
  )
}

export function KanbanBoard({ tasks, setTasks, filteredTasks, onEdit }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

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

  return (
    <DndContext
      id="kanban-board-dnd"
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-1 lg:h-[calc(100vh-145px)]">
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
                    onClick={() => onEdit(task)}
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
  )
}
