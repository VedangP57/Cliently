'use client'

import { useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2, Clock } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { ManualLogModal } from '@/components/time/ManualLogModal'
import { deleteTimeLogAction } from '@/lib/actions/time-logs'
import { useToast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils'
import type { TimeLog, Project, Task } from '@/types'

interface TimeLogTableProps {
  timeLogs: TimeLog[]
  projects: Project[]
  tasks: Task[]
}

export function TimeLogTable({ timeLogs, projects, tasks }: TimeLogTableProps) {
  const [filterProjectId, setFilterProjectId] = useState('all')
  const [editLog, setEditLog] = useState<TimeLog | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { toast } = useToast()

  const filtered = useMemo(() => {
    if (filterProjectId === 'all') return timeLogs
    return timeLogs.filter((log) => log.project_id === filterProjectId)
  }, [timeLogs, filterProjectId])

  const totalHours = useMemo(
    () => filtered.reduce((sum, log) => sum + log.hours, 0),
    [filtered]
  )

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    const result = await deleteTimeLogAction(deleteId)
    setDeleting(false)

    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
      return
    }

    toast({ title: 'Deleted', description: 'Time log has been deleted.' })
    setDeleteId(null)
  }

  function handleEdit(log: TimeLog) {
    setEditLog(log)
    setEditOpen(true)
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center gap-3">
        <Select value={filterProjectId} onValueChange={setFilterProjectId}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="All projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All projects</SelectItem>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No time logs"
          description="Start the timer or log time manually to track your work."
        />
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead className="hidden md:table-cell">Task</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Hours</TableHead>
                  <TableHead className="text-center">Billable</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(log.date)}
                    </TableCell>
                    <TableCell>
                      {log.project?.title ?? (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {log.task?.title ?? (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {log.description || (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {log.hours.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center">
                      {log.billable ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Yes
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                          No
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(log)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(log.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Total */}
          <div className="flex justify-end">
            <div className="rounded-md border px-4 py-2 text-sm font-medium">
              Total: <span className="font-mono font-bold">{totalHours.toFixed(2)}</span> hours
            </div>
          </div>
        </>
      )}

      {/* Edit modal */}
      <ManualLogModal
        open={editOpen}
        onOpenChange={setEditOpen}
        timeLog={editLog}
        projects={projects}
        tasks={tasks}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null) }}
        title="Delete time log"
        description="Are you sure you want to delete this time log? This action cannot be undone."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
