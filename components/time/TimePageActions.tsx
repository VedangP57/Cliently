'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
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
      <Button onClick={() => setOpen(true)} className="gap-2">
        <Plus className="h-4 w-4" />
        Log Time
      </Button>
      <ManualLogModal
        open={open}
        onOpenChange={setOpen}
        projects={projects}
        tasks={tasks}
      />
    </>
  )
}
