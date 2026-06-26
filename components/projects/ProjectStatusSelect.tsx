'use client'

import { Dropdown } from 'antd'
import type { MenuProps } from 'antd'
import { Check, ChevronDown } from 'lucide-react'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { cn } from '@/lib/utils'
import type { Project } from '@/types'

const PROJECT_STATUS_OPTIONS = [
  { label: 'Planning', value: 'planning' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Review', value: 'review' },
  { label: 'Completed', value: 'completed' },
  { label: 'On Hold', value: 'on_hold' },
  { label: 'Cancelled', value: 'cancelled' },
] as const

const STATUS_ACCENT: Record<Project['status'], string> = {
  planning: '#5b5fc7',
  in_progress: '#0f6cbd',
  review: '#c9a227',
  completed: '#0e700e',
  on_hold: '#c47a17',
  cancelled: '#bc2f32',
}

interface ProjectStatusSelectProps {
  status: Project['status']
  loading?: boolean
  onChange: (status: string) => void
}

export function ProjectStatusSelect({ status, loading, onChange }: ProjectStatusSelectProps) {
  const menuItems: MenuProps['items'] = PROJECT_STATUS_OPTIONS.map((opt) => ({
    key: opt.value,
    label: (
      <div
        className={cn(
          'flex items-center gap-2.5 min-w-[148px]',
          opt.value === status && 'font-medium'
        )}
      >
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: STATUS_ACCENT[opt.value] }}
        />
        <span className="flex-1 text-sm text-foreground">{opt.label}</span>
        {opt.value === status && (
          <Check className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
        )}
      </div>
    ),
  }))

  return (
    <Dropdown
      trigger={['click']}
      disabled={loading}
      classNames={{ root: 'project-status-dropdown' }}
      menu={{
        items: menuItems,
        selectedKeys: [status],
        onClick: ({ key }) => onChange(key),
      }}
    >
      <button
        type="button"
        aria-label="Change project status"
        className={cn(
          'group inline-flex items-center gap-1 rounded-md',
          'outline-none ring-0 focus:outline-none focus-visible:ring-0',
          loading ? 'cursor-wait opacity-50' : 'cursor-pointer'
        )}
      >
        <StatusBadge
          status={status}
          className="!rounded-md px-2 py-0.5 text-[11px] font-medium shadow-none transition-opacity group-hover:opacity-90"
        />
        <ChevronDown
          className="h-3 w-3 text-muted-foreground/70 transition-transform group-hover:text-muted-foreground group-data-[state=open]:rotate-180"
          aria-hidden
        />
      </button>
    </Dropdown>
  )
}
