'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { projectSchema, type ProjectFormValues } from '@/lib/validations/project'
import { createProjectAction, updateProjectAction } from '@/lib/actions/projects'
import { Modal, Input, Select, Button, Space, Typography, ConfigProvider } from 'antd'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import type { Project, Client, ProjectStatus } from '@/types'
import { NoiseTexture } from '@/components/ui/noise-texture'

const { TextArea } = Input
const { Text } = Typography
const PROJECT_STATUSES: ProjectStatus[] = ['planning', 'in_progress', 'review', 'completed', 'on_hold', 'cancelled']

interface ProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project?: Project | null
  clients: Client[]
}

export function ProjectModal({
  open,
  onOpenChange,
  project,
  clients,
}: ProjectModalProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const isEditing = !!project

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema) as any,
    defaultValues: {
      title: '',
      client_id: '',
      description: '',
      status: 'planning',
      deadline: '',
      budget: 0,
      notes: '',
    },
  })

  // Reset form when project changes
  useEffect(() => {
    if (project) {
      form.reset({
        title: project.title ?? '',
        client_id: project.client_id ?? '',
        description: project.description ?? '',
        status: project.status ?? 'planning',
        deadline: project.deadline ?? '',
        budget: project.budget ?? 0,
        notes: project.notes ?? '',
      })
    } else {
      form.reset({
        title: '',
        client_id: '',
        description: '',
        status: 'planning',
        deadline: '',
        budget: 0,
        notes: '',
      })
    }
  }, [project, form])

  async function onSubmit(data: ProjectFormValues) {
    setLoading(true)
    const result = isEditing
      ? await updateProjectAction(project.id, data)
      : await createProjectAction(data)

    setLoading(false)

    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
      return
    }

    toast({
      title: isEditing ? 'Project updated' : 'Project created',
      description: `"${data.title}" has been ${isEditing ? 'updated' : 'created'}.`,
    })
    router.refresh()
    form.reset()
    onOpenChange(false)
  }

  return (
    <ConfigProvider theme={{ components: { Modal: { contentBg: 'transparent' } } }}>
    <Modal
      open={open}
      onCancel={() => onOpenChange(false)}
      title={<Typography.Title level={4} style={{ margin: 0 }}>{isEditing ? 'Edit Project' : 'New Project'}</Typography.Title>}
      footer={null}
      destroyOnHidden
      width={600}
      centered
      transitionName=""
      maskTransitionName=""
      modalRender={(node) => (
        <div className="project-modal-wrapper relative overflow-hidden rounded-lg">
          <NoiseTexture id="project-modal" className="absolute inset-0 z-0" baseFrequency={0.62} />
          <div className="relative z-[1]">{node}</div>
        </div>
      )}
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
                  <Input placeholder="Website Redesign" size="large" status={fieldState.error ? 'error' : ''} {...field} />
                  {fieldState.error && <Text type="danger" style={{ fontSize: '12px' }}>{fieldState.error.message}</Text>}
                </>
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Text strong>Client</Text>
            <Controller
              control={form.control}
              name="client_id"
              render={({ field }) => (
                <Select
                  className="w-full"
                  size="large"
                  placeholder="Select a client"
                  value={field.value || undefined}
                  onChange={field.onChange}
                  options={[
                    { label: 'No Client', value: '' },
                    ...clients.map((c) => ({
                      label: c.name,
                      value: c.id,
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
                  placeholder="Project description..."
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
                    options={PROJECT_STATUSES.map((status) => ({
                      label: status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                      value: status,
                    }))}
                  />
                )}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Text strong>Deadline</Text>
              <Controller
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <Input type="date" size="large" {...field} />
                )}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Text strong>Budget ($)</Text>
            <Controller
              control={form.control}
              name="budget"
              render={({ field }) => (
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  size="large"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Text strong>Notes</Text>
            <Controller
              control={form.control}
              name="notes"
              render={({ field }) => (
                <TextArea
                  placeholder="Additional notes..."
                  rows={2}
                  {...field}
                />
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
                {isEditing ? 'Update Project' : 'Create Project'}
              </Button>
            </Space>
          </div>
        </form>
      </div>
    </Modal>
    </ConfigProvider>
  )
}
