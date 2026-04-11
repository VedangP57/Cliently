import { PageHeader } from '@/components/shared/PageHeader'
import { createClient } from '@/lib/supabase/server'
import { CalendarView, type CalendarEvent } from '@/components/calendar/CalendarView'

export default async function CalendarPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const [projectsRes, tasksRes, invoicesRes] = await Promise.all([
    supabase
      .from('projects')
      .select('id, title, deadline')
      .eq('user_id', user.id)
      .not('deadline', 'is', null),
    supabase
      .from('tasks')
      .select('id, title, due_date')
      .eq('user_id', user.id)
      .not('due_date', 'is', null),
    supabase
      .from('invoices')
      .select('id, invoice_number, due_date')
      .eq('user_id', user.id)
      .not('due_date', 'is', null),
  ])

  const projectEvents: CalendarEvent[] = (projectsRes.data ?? []).map((project) => ({
    id: `project-${project.id}`,
    title: project.title,
    date: project.deadline as string,
    href: `/dashboard/projects/${project.id}`,
    type: 'project',
  }))

  const taskEvents: CalendarEvent[] = (tasksRes.data ?? []).map((task) => ({
    id: `task-${task.id}`,
    title: task.title,
    date: task.due_date as string,
    href: '/dashboard/tasks',
    type: 'task',
  }))

  const invoiceEvents: CalendarEvent[] = (invoicesRes.data ?? []).map((invoice) => ({
    id: `invoice-${invoice.id}`,
    title: invoice.invoice_number ? `Invoice ${invoice.invoice_number}` : `Invoice ${invoice.id.slice(0, 8)}`,
    date: invoice.due_date as string,
    href: `/dashboard/invoices/${invoice.id}`,
    type: 'invoice',
  }))

  return (
    <div className="space-y-3">
      <PageHeader title="Calendar" description="Track deadlines across projects, tasks, and invoices." />
      <CalendarView events={[...projectEvents, ...taskEvents, ...invoiceEvents]} />
    </div>
  )
}
