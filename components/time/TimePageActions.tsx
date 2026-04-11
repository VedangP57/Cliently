'use client'

import { useState } from 'react'
import { Button as AntdButton } from 'antd'
import { Plus } from 'lucide-react'
import { ManualLogModal } from '@/components/time/ManualLogModal'
import type { Project, Task } from '@/types'

interface TimePageActionsProps {
  projects: Project[]
  tasks: Task[]
}

export function TimePageActions({ projects, tasks }: TimePageActionsProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <AntdButton
        type="primary"
        onClick={() => setOpen(true)}
        className="h-8 rounded-full bg-primary hover:bg-primary/90! border-none flex items-center gap-2 px-4 text-sm text-primary-foreground"
      >
        <Plus className="h-3.5 w-3.5" />
        Log Time
      </AntdButton>
      <ManualLogModal
        open={open}
        onOpenChange={setOpen}
        projects={projects}
        tasks={tasks}
      />
    </>
  )
}
