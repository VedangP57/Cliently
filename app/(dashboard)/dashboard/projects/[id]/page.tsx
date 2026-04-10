import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  CheckSquare,
  Clock,
} from 'lucide-react'
import type { Task, TimeLog } from '@/types'

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: project } = await supabase
    .from('projects')
    .select('*, client:clients(name)')
    .eq('id', id)
    .eq('user_id', user!.id)
    .single()

  if (!project) notFound()

  const [tasksRes, timeLogsRes, expensesRes] = await Promise.all([
    supabase
      .from('tasks')
      .select('*')
      .eq('project_id', id)
      .eq('user_id', user!.id)
      .order('position'),
    supabase
      .from('time_logs')
      .select('*')
      .eq('project_id', id)
      .eq('user_id', user!.id)
      .order('date', { ascending: false }),
    supabase
      .from('expenses')
      .select('*')
      .eq('project_id', id)
      .eq('user_id', user!.id)
      .order('date', { ascending: false }),
  ])

  const tasks = (tasksRes.data ?? []) as Task[]
  const timeLogs = (timeLogsRes.data ?? []) as TimeLog[]
  const expenses = expensesRes.data ?? []

  const totalTasks = tasks.length
  const doneTasks = tasks.filter((t) => t.status === 'done').length
  const progress =
    totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0
  const totalHours = timeLogs.reduce((sum, t) => sum + t.hours, 0)

  const clientData = project.client as { name: string } | null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/projects">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to projects</span>
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{project.title}</h1>
            <StatusBadge status={project.status} />
          </div>
          {clientData && (
            <p className="text-sm text-muted-foreground">{clientData.name}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <CheckSquare className="h-4 w-4" />
              Tasks Progress
            </div>
            <p className="text-2xl font-bold mb-2">
              {doneTasks}/{totalTasks}
            </p>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              Hours Tracked
            </div>
            <p className="text-2xl font-bold">{totalHours.toFixed(1)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4" />
              Budget
            </div>
            <p className="text-2xl font-bold">
              {project.budget ? formatCurrency(project.budget) : '—'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Calendar className="h-4 w-4" />
              Deadline
            </div>
            <p className="text-2xl font-bold">
              {formatDate(project.deadline)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tasks">
        <TabsList>
          <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
          <TabsTrigger value="time">Time Logs ({timeLogs.length})</TabsTrigger>
          <TabsTrigger value="expenses">
            Expenses ({expenses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-4">
          {tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No tasks yet. Create tasks from the Tasks page.
            </p>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Due Date
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">
                        {task.title}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={task.status} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={task.priority} />
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {formatDate(task.due_date)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="time" className="mt-4">
          {timeLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No time logged yet.
            </p>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Hours</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-muted-foreground">
                        {formatDate(log.date)}
                      </TableCell>
                      <TableCell>{log.description ?? '—'}</TableCell>
                      <TableCell className="text-right font-medium">
                        {log.hours.toFixed(1)}h
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="expenses" className="mt-4">
          {expenses.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No expenses yet.
            </p>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map(
                    (exp: {
                      id: string
                      date: string
                      title: string
                      category: string
                      amount: number
                    }) => (
                      <TableRow key={exp.id}>
                        <TableCell className="text-muted-foreground">
                          {formatDate(exp.date)}
                        </TableCell>
                        <TableCell>{exp.title}</TableCell>
                        <TableCell>
                          <StatusBadge status={exp.category} />
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(exp.amount)}
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
