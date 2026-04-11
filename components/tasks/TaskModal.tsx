'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { taskSchema, type TaskFormValues } from '@/lib/validations/task'
import { createTaskAction, updateTaskAction } from '@/lib/actions/tasks'
import { Modal, Input, Select, Button, Space, Typography } from 'antd'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import type { Task, Project } from '@/types'

const { TextArea } = Input
const { Text } = Typography

interface TaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: Task | null
  projects: Project[]
  defaultStatus?: string
}

export function TaskModal({
  open,
  onOpenChange,
  task,
  projects,
  defaultStatus,
}: TaskModalProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const isEditing = !!task

  const form = useForm<TaskFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(taskSchema) as any,
    defaultValues: {
      title: '',
      project_id: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      due_date: '',
    },
  })

  // Reset form when task changes
  useEffect(() => {
    if (open) {
      if (task) {
        form.reset({
          title: task.title ?? '',
          project_id: task.project_id ?? '',
          description: task.description ?? '',
          status: task.status ?? 'todo',
          priority: task.priority ?? 'medium',
          due_date: task.due_date ?? '',
        })
      } else {
        form.reset({
          title: '',
          project_id: '',
          description: '',
          status: (defaultStatus as TaskFormValues['status']) ?? 'todo',
          priority: 'medium',
          due_date: '',
        })
      }
    }
  }, [task, form, open, defaultStatus])

  async function onSubmit(data: TaskFormValues) {
    setLoading(true)
    const result = isEditing
      ? await updateTaskAction(task.id, data)
      : await createTaskAction(data)

    setLoading(false)

    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
      return
    }

    toast({
      title: isEditing ? 'Task updated' : 'Task created',
      description: `"${data.title}" has been ${isEditing ? 'updated' : 'created'}.`,
    })
    form.reset()
    onOpenChange(false)
    router.refresh()
  }

  return (
    <Modal
      open={open}
      onCancel={() => onOpenChange(false)}
      title={<Typography.Title level={4} style={{ margin: 0 }}>{isEditing ? 'Edit Task' : 'New Task'}</Typography.Title>}
      footer={null}
      destroyOnHidden
      width={600}
      centered
      transitionName=""
      maskTransitionName=""
    >
      <div className="mt-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <Text strong>Title *</Text>
            <Controller
              control={form.control}
              name="title"
              render={({ field, fieldState }) => (
                <>
                  <Input placeholder="Task title" size="large" status={fieldState.error ? 'error' : ''} {...field} />
                  {fieldState.error && <Text type="danger" style={{ fontSize: '12px' }}>{fieldState.error.message}</Text>}
                </>
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Text strong>Project</Text>
            <Controller
              control={form.control}
              name="project_id"
              render={({ field }) => (
                <Select
                  className="w-full"
                  size="large"
                  placeholder="Select a project"
                  value={field.value || undefined}
                  onChange={field.onChange}
                  options={[
                    { label: 'No Project', value: '' },
                    ...projects.map((p) => ({
                      label: p.title,
                      value: p.id,
                    })),
                  ]}
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Text strong>Description</Text>
            <Controller
              control={form.control}
              name="description"
              render={({ field }) => (
                <TextArea
                  placeholder="Task details..."
                  rows={3}
                  {...field}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Text strong>Status</Text>
              <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                  <Select
                    className="w-full"
                    size="large"
                    value={field.value}
                    onChange={field.onChange}
                    options={[
                      { label: 'To Do', value: 'todo' },
                      { label: 'In Progress', value: 'in_progress' },
                      { label: 'In Review', value: 'in_review' },
                      { label: 'Done', value: 'done' },
                    ]}
                  />
                )}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Text strong>Priority</Text>
              <Controller
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <Select
                    className="w-full"
                    size="large"
                    value={field.value}
                    onChange={field.onChange}
                    options={[
                      { label: 'Low', value: 'low' },
                      { label: 'Medium', value: 'medium' },
                      { label: 'High', value: 'high' },
                      { label: 'Urgent', value: 'urgent' },
                    ]}
                  />
                )}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Text strong>Due Date</Text>
            <Controller
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <Input type="date" size="large" {...field} />
              )}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 mt-6">
            <Space size="middle">
              <Button onClick={() => onOpenChange(false)} size="large" className="rounded-full">
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                className="bg-primary border-primary hover:bg-primary/90! hover:border-primary/90! text-primary-foreground rounded-full"
              >
                {isEditing ? 'Update Task' : 'Create Task'}
              </Button>
            </Space>
          </div>
        </form>
      </div>
    </Modal>
  )
}
