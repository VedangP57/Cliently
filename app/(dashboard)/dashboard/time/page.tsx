import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { TimerWidget } from '@/components/time/TimerWidget'
import { TimeLogTable } from '@/components/time/TimeLogTable'
import { TimePageActions } from '@/components/time/TimePageActions'

export default async function TimeTrackingPage() {
  const supabase = await createClient()

  const [timeLogsRes, projectsRes, tasksRes] = await Promise.all([
    supabase
      .from('time_logs')
      .select('*, project:projects(*), task:tasks(*)')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false }),
    supabase
      .from('projects')
      .select('*')
      .order('title'),
    supabase
      .from('tasks')
      .select('*')
      .order('title'),
  ])

  const timeLogs = timeLogsRes.data ?? []
  const projects = projectsRes.data ?? []
  const tasks = tasksRes.data ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Time Tracking"
        description="Track time with the timer or log hours manually."
      >
        <TimePageActions projects={projects} tasks={tasks} />
      </PageHeader>

      <TimerWidget projects={projects} tasks={tasks} />

      <TimeLogTable timeLogs={timeLogs} projects={projects} tasks={tasks} />
    </div>
  )
}
