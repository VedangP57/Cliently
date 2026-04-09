'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { timeLogSchema, type TimeLogFormValues } from '@/lib/validations/time-log'
import { createTimeLogAction, updateTimeLogAction } from '@/lib/actions/time-logs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import dayjs from 'dayjs'
import { SELECT_NONE, toSelectValue, fromSelectValue } from '@/lib/utils'
import type { Project, Task, TimeLog } from '@/types'

interface ManualLogModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  timeLog?: TimeLog | null
  projects: Project[]
  tasks: Task[]
}

export function ManualLogModal({
  open,
  onOpenChange,
  timeLog,
  projects,
  tasks,
}: ManualLogModalProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const isEditing = !!timeLog

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<TimeLogFormValues>({
    resolver: zodResolver(timeLogSchema) as any,
    defaultValues: {
      project_id: timeLog?.project_id ?? '',
      task_id: timeLog?.task_id ?? '',
      description: timeLog?.description ?? '',
      hours: timeLog?.hours ?? 1,
      date: timeLog?.date ?? dayjs().format('YYYY-MM-DD'),
      billable: timeLog?.billable ?? true,
    },
  })

  const selectedProjectId = form.watch('project_id')
  const filteredTasks = tasks.filter(
    (t) => !selectedProjectId || t.project_id === selectedProjectId
  )

  useEffect(() => {
    if (open) {
      form.reset({
        project_id: timeLog?.project_id ?? '',
        task_id: timeLog?.task_id ?? '',
        description: timeLog?.description ?? '',
        hours: timeLog?.hours ?? 1,
        date: timeLog?.date ?? dayjs().format('YYYY-MM-DD'),
        billable: timeLog?.billable ?? true,
      })
    }
  }, [open, timeLog, form])

  async function onSubmit(data: TimeLogFormValues) {
    setLoading(true)
    const result = isEditing
      ? await updateTimeLogAction(timeLog.id, data)
      : await createTimeLogAction(data)

    setLoading(false)

    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
      return
    }

    toast({
      title: isEditing ? 'Time log updated' : 'Time logged',
      description: `${data.hours}h has been ${isEditing ? 'updated' : 'logged'}.`,
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Time Log' : 'Log Time Manually'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the time log entry.' : 'Add a manual time entry.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="project_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project</FormLabel>
                  <Select
                    value={toSelectValue(field.value)}
                    onValueChange={(v) => {
                      field.onChange(fromSelectValue(v))
                      form.setValue('task_id', '')
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={SELECT_NONE}>No project</SelectItem>
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="task_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task</FormLabel>
                  <Select
                    value={toSelectValue(field.value)}
                    onValueChange={(v) => field.onChange(fromSelectValue(v))}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select task" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={SELECT_NONE}>No task</SelectItem>
                      {filteredTasks.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hours</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.25"
                        min="0.01"
                        placeholder="1.5"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What did you work on?"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="billable"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <FormLabel className="text-sm font-medium">Billable</FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Include this time in invoices
                    </p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Update' : 'Log Time'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
