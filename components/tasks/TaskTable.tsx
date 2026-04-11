'use client'

import {
  Table,
  Button as AntdButton,
  Tooltip,
} from 'antd'
import { StatusBadge } from '@/components/shared/StatusBadge'
import {
  SquarePen,
  Trash,
} from 'lucide-react'
import type { Task } from '@/types'
import type { ColumnsType } from 'antd/es/table'

interface TaskTableProps {
  filteredTasks: Task[]
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

export function TaskTable({ filteredTasks, onEdit, onDelete }: TaskTableProps) {
  const columns: ColumnsType<Task> = [
    {
      title: 'No.',
      key: 'index',
      width: 70,
      align: 'center',
      render: (_, __, index) => <span className="text-muted-foreground">{index + 1}</span>,
    },
    {
      title: <div className="text-center w-full">Title</div>,
      dataIndex: 'title',
      key: 'title',
      width: 300,
      align: 'center',
      render: (title) => <span className="font-medium text-center truncate block mx-auto max-w-[280px]" title={title}>{title}</span>,
    },
    {
      title: <div className="text-center w-full">Status</div>,
      dataIndex: 'status',
      key: 'status',
      width: 140,
      align: 'center',
      render: (status) => <div className="flex justify-center"><StatusBadge status={status} /></div>,
    },
    {
      title: <div className="text-center w-full">Priority</div>,
      dataIndex: 'priority',
      key: 'priority',
      width: 140,
      align: 'center',
      render: (priority) => <div className="flex justify-center"><StatusBadge status={priority} /></div>,
    },
    {
      title: <div className="text-center w-full">Project</div>,
      key: 'project',
      width: 250,
      align: 'center',
      render: (_, record) => {
        return <span className="text-muted-foreground text-center truncate block mx-auto max-w-[230px]" title={record.project?.title}>{record.project?.title ?? '—'}</span>
      },
    },
    {
      title: <div className="text-center w-full">Action</div>,
      key: 'actions',
      width: 120,
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
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <AntdButton
              type="text"
              size="small"
              className="flex items-center justify-center h-8 w-8 rounded-lg text-red-500! hover:text-red-600! hover:bg-transparent"
              icon={<Trash className="h-3.5 w-3.5" />}
              onClick={() => onDelete(record.id)}
            />
          </Tooltip>
        </div>
      ),
    },
  ]

  return (
    <div className="user-table">
      <Table<Task>
        columns={columns}
        dataSource={filteredTasks}
        rowKey="id"
        bordered
        size="middle"
        pagination={{
          defaultPageSize: 50,
          showSizeChanger: true,
          pageSizeOptions: ['20', '30', '50', '100'],
          placement: ['bottomRight'] as any,
          className: 'ant-pagination-mini !mt-4',
          hideOnSinglePage: false,
        }}
        scroll={{ x: 1020, y: 'calc(100vh - 215px)' }}
      />
    </div>
  )
}
