'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button as AntdButton, Tooltip } from 'antd'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { SquarePen, Trash, ExternalLink, Calendar } from 'lucide-react'
import type { Project, Client } from '@/types'

const STATUS_COLUMNS: { key: Project['status']; label: string }[] = [
  { key: 'planning', label: 'Planning' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'review', label: 'Review' },
  { key: 'completed', label: 'Completed' },
  { key: 'on_hold', label: 'On Hold' },
  { key: 'cancelled', label: 'Cancelled' },
]

const STATUS_ACCENT: Record<Project['status'], string> = {
  planning:    '#5b5fc7',
  in_progress: '#0f6cbd',
  review:      '#835b00',
  completed:   '#0e700e',
  on_hold:     '#9a5b00',
  cancelled:   '#bc2f32',
}

interface ProjectBoardViewProps {
  projects: Project[]
  clients: Client[]
  onEdit: (project: Project) => void
  onDelete: (id: string) => void
}

export function ProjectBoardView({ projects, clients, onEdit, onDelete }: ProjectBoardViewProps) {
  const router = useRouter()

  return (
    <div className="board-view flex gap-4 overflow-x-auto overflow-y-hidden h-full pb-2 px-5">
      {STATUS_COLUMNS.map(({ key, label }) => {
        const colProjects = projects.filter(p => p.status === key)
        return (
          <div key={key} className="min-w-[260px] max-w-[260px] flex flex-col gap-2" role="group" aria-label={label}>
            <div className="flex items-center gap-2 px-1 shrink-0">
              <StatusBadge status={key} />
              <span className="text-xs text-muted-foreground font-medium">{colProjects.length}</span>
            </div>
            <div className="board-col-scroll flex-1 min-h-0 flex flex-col gap-2 overflow-y-auto">
              {colProjects.length === 0 && (
                <div className="text-xs text-muted-foreground text-center py-6 border border-dashed border-border rounded-lg">
                  No projects
                </div>
              )}
              {colProjects.map(project => {
                const client = clients.find(c => c.id === project.client_id)
                return (
                  <div key={project.id} className="relative shrink-0 bg-[#f0f0f0] dark:bg-[#0a0a0a] border border-[#e6e6e6] dark:border-white/10 rounded-lg p-3 shadow-none overflow-hidden">
                    <div className="absolute left-0 top-3 bottom-3 w-[2px] rounded-sm opacity-90" style={{ backgroundColor: STATUS_ACCENT[project.status] }} />
                    <Link
                      href={`/dashboard/projects/${project.id}`}
                      className="font-medium text-sm hover:underline text-[#5e5cc5] dark:text-[#a5a3e0]! block mb-1 leading-snug"
                    >
                      {project.title}
                    </Link>
                    {client && (
                      <p className="text-xs text-muted-foreground mb-2">{client.name}</p>
                    )}
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-2">
                      {project.deadline && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(project.deadline)}
                        </span>
                      )}
                      {project.budget && <span>{formatCurrency(project.budget)}</span>}
                    </div>
                    <div className="flex items-center gap-0.5">
                      <Tooltip title="View">
                        <AntdButton
                          type="text" size="small"
                          className="h-7 w-7 flex items-center justify-center text-blue-500! hover:bg-transparent"
                          icon={<ExternalLink className="h-3 w-3" />}
                          onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                        />
                      </Tooltip>
                      <Tooltip title="Edit">
                        <AntdButton
                          type="text" size="small"
                          className="h-7 w-7 flex items-center justify-center text-amber-500! hover:bg-transparent"
                          icon={<SquarePen className="h-3 w-3" />}
                          onClick={() => onEdit(project)}
                        />
                      </Tooltip>
                      <Tooltip title="Delete">
                        <AntdButton
                          type="text" size="small"
                          className="h-7 w-7 flex items-center justify-center text-red-500! hover:bg-transparent"
                          icon={<Trash className="h-3 w-3" />}
                          onClick={() => onDelete(project.id)}
                        />
                      </Tooltip>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
