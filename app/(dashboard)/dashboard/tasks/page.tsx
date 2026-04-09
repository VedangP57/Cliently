import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { KanbanBoard } from '@/components/tasks/KanbanBoard'
import type { Task, Project } from '@/types'

export default async function TasksPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [tasksRes, projectsRes] = await Promise.all([
    supabase
      .from('tasks')
      .select('*, project:projects(title)')
      .eq('user_id', user!.id)
      .order('position'),
    supabase
      .from('projects')
      .select('*')
      .eq('user_id', user!.id)
      .in('status', ['planning', 'in_progress', 'review'])
      .order('title'),
  ])

  const tasks = (tasksRes.data ?? []).map((t) => ({
    ...t,
    project: t.project as { title: string } | null
      ? { ...({} as Project), title: (t.project as { title: string })?.title ?? '' }
      : undefined,
  })) as Task[]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        description="Drag tasks between columns to update their status."
      />
      <KanbanBoard
        initialTasks={tasks}
        projects={(projectsRes.data ?? []) as Project[]}
      />
    </div>
  )
}
