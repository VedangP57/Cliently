'use client'

import { useState, useMemo } from 'react'
import {
  Table,
  Select as AntdSelect,
  Button as AntdButton,
  Tooltip,
  Typography,
} from 'antd'
import { Pencil, Trash2, Clock, SquarePen, Trash } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { ManualLogModal } from '@/components/time/ManualLogModal'
import { deleteTimeLogAction } from '@/lib/actions/time-logs'
import { useToast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils'
import type { TimeLog, Project, Task } from '@/types'
import type { ColumnsType } from 'antd/es/table'

const { Text } = Typography

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

  const columns: ColumnsType<TimeLog> = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      align: 'center',
      render: (date) => <span className="text-muted-foreground whitespace-nowrap">{formatDate(date)}</span>,
    },
    {
      title: 'Project',
      key: 'project',
      width: 180,
      align: 'center',
      render: (_, record) => record.project?.title ? (
        <Tooltip title={record.project.title}>
          <span className="font-medium truncate block max-w-[160px] mx-auto">
            {record.project.title}
          </span>
        </Tooltip>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
    },
    {
      title: 'Task',
      key: 'task',
      width: 180,
      align: 'center',
      responsive: ['md'],
      render: (_, record) => record.task?.title ? (
        <Tooltip title={record.task.title}>
          <span className="text-muted-foreground truncate block max-w-[160px] mx-auto">
            {record.task.title}
          </span>
        </Tooltip>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 180,
      align: 'center',
      render: (description) => description ? (
        <Tooltip title={description}>
          <span className="text-muted-foreground truncate block max-w-[160px] mx-auto">
            {description}
          </span>
        </Tooltip>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
    },
    {
      title: 'Hours',
      dataIndex: 'hours',
      key: 'hours',
      width: 100,
      align: 'center',
      render: (hours) => <span className="font-mono font-bold text-primary">{hours.toFixed(2)}</span>,
    },
    {
      title: 'Billable',
      dataIndex: 'billable',
      key: 'billable',
      width: 100,
      align: 'center',
      render: (billable) => (
        <div className="flex justify-center">
          {billable ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              Yes
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold bg-muted text-muted-foreground">
              No
            </span>
          )}
        </div>
      ),
    },
    {
      title: 'Action',
      key: 'actions',
      width: 100,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <div className="flex items-center justify-center gap-1">
          <Tooltip title="Edit">
            <AntdButton
              type="text"
              size="small"
              className="flex items-center justify-center h-8 w-8 rounded-lg text-amber-500! hover:text-amber-600! hover:bg-transparent"
              icon={<SquarePen className="h-3.5 w-3.5" />}
              onClick={() => handleEdit(record)}
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
      {/* Filter and Total Summary */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 pt-6">
          <Text className="text-xs text-muted-foreground uppercase tracking-wider font-semibold px-1">Filter by Project</Text>
          <AntdSelect
            className="w-[200px] h-8 select-rounded-full"
            value={filterProjectId}
            onChange={setFilterProjectId}
            options={[
              { label: 'All Projects', value: 'all' },
              ...projects.map((p) => ({ label: p.title, value: p.id })),
            ]}
          />
        </div>

        {filtered.length > 0 && (
          <div className="h-8 flex items-center px-4 rounded-full bg-primary/5 border border-primary/10 text-primary text-sm font-medium">
            Total:{' '}
            <span className="font-mono font-bold ml-1.5">{totalHours.toFixed(2)}</span>
            <span className="ml-1 text-xs opacity-80 uppercase tracking-tight">hrs</span>
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No time logs"
          description={filterProjectId === 'all' ? 'Start the timer or log time manually to track your work.' : 'No time logs found for the selected project.'}
        />
      ) : (
        <div className="user-table">
          <Table<TimeLog>
            columns={columns}
            dataSource={filtered}
            rowKey="id"
            bordered
            size="middle"
            pagination={{
              defaultPageSize: 20,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '30', '50'],
              placement: ['bottomRight'] as any,
              className: 'ant-pagination-mini !mt-4',
            }}
            scroll={{ x: 1000, y: 'calc(100vh - 430px)' }}
          />
        </div>
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
