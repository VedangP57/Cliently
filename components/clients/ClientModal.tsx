'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { clientSchema, type ClientFormValues } from '@/lib/validations/client'
import { createClientAction, updateClientAction } from '@/lib/actions/clients'
import { Modal, Input, Select, Button, Space, Typography } from 'antd'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import type { Client, ClientStatus } from '@/types'

const { TextArea } = Input
const { Text } = Typography
const CLIENT_STATUSES: ClientStatus[] = ['lead', 'active', 'inactive', 'archived']

interface ClientModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client?: Client | null
}

export function ClientModal({ open, onOpenChange, client }: ClientModalProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const isEditing = !!client

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema) as any,
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      website: '',
      address: '',
      status: 'lead',
      notes: '',
      tags: [],
    },
  })

  // Reset form when client changes
  useEffect(() => {
    if (client) {
      form.reset({
        name: client.name ?? '',
        email: client.email ?? '',
        phone: client.phone ?? '',
        company: client.company ?? '',
        website: client.website ?? '',
        address: client.address ?? '',
        status: client.status ?? 'lead',
        notes: client.notes ?? '',
        tags: client.tags ?? [],
      })
    } else {
      form.reset({
        name: '',
        email: '',
        phone: '',
        company: '',
        website: '',
        address: '',
        status: 'lead',
        notes: '',
        tags: [],
      })
    }
  }, [client, form])

  async function onSubmit(data: ClientFormValues) {
    setLoading(true)
    const result = isEditing
      ? await updateClientAction(client.id, data)
      : await createClientAction(data)

    setLoading(false)

    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
      return
    }

    toast({
      title: isEditing ? 'Client updated' : 'Client created',
      description: `${data.name} has been ${isEditing ? 'updated' : 'added'}.`,
    })
    router.refresh()
    form.reset()
    onOpenChange(false)
  }

  return (
    <Modal
      open={open}
      onCancel={() => onOpenChange(false)}
      title={<Typography.Title level={4} style={{ margin: 0 }}>{isEditing ? 'Edit Client' : 'New Client'}</Typography.Title>}
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
            <Text strong>Name *</Text>
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <>
                  <Input placeholder="John Doe" size="large" status={fieldState.error ? 'error' : ''} {...field} />
                  {fieldState.error && <Text type="danger" style={{ fontSize: '12px' }}>{fieldState.error.message}</Text>}
                </>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Text strong>Email</Text>
              <Controller
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <>
                    <Input type="email" placeholder="john@example.com" size="large" status={fieldState.error ? 'error' : ''} {...field} />
                    {fieldState.error && <Text type="danger" style={{ fontSize: '12px' }}>{fieldState.error.message}</Text>}
                  </>
                )}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Text strong>Phone</Text>
              <Controller
                control={form.control}
                name="phone"
                render={({ field, fieldState }) => (
                  <>
                    <Input placeholder="+1 234 567 890" size="large" status={fieldState.error ? 'error' : ''} {...field} />
                    {fieldState.error && <Text type="danger" style={{ fontSize: '12px' }}>{fieldState.error.message}</Text>}
                  </>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Text strong>Company</Text>
              <Controller
                control={form.control}
                name="company"
                render={({ field, fieldState }) => (
                  <>
                    <Input placeholder="Acme Inc." size="large" status={fieldState.error ? 'error' : ''} {...field} />
                    {fieldState.error && <Text type="danger" style={{ fontSize: '12px' }}>{fieldState.error.message}</Text>}
                  </>
                )}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Text strong>Website</Text>
              <Controller
                control={form.control}
                name="website"
                render={({ field, fieldState }) => (
                  <>
                    <Input placeholder="https://example.com" size="large" status={fieldState.error ? 'error' : ''} {...field} />
                    {fieldState.error && <Text type="danger" style={{ fontSize: '12px' }}>{fieldState.error.message}</Text>}
                  </>
                )}
              />
            </div>
          </div>

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
                  options={CLIENT_STATUSES.map((status) => ({
                    label: status.charAt(0).toUpperCase() + status.slice(1),
                    value: status,
                  }))}
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Text strong>Address</Text>
            <Controller
              control={form.control}
              name="address"
              render={({ field }) => (
                <TextArea
                  placeholder="123 Main St, City, State"
                  rows={2}
                  {...field}
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
                  rows={3}
                  {...field}
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Text strong>Tags</Text>
            <Controller
              control={form.control}
              name="tags"
              render={({ field }) => (
                <Input
                  placeholder="design, web, priority (comma-separated)"
                  size="large"
                  value={field.value.join(', ')}
                  onChange={(e) => {
                    const tags = e.target.value
                      .split(',')
                      .map((t) => t.trim())
                      .filter(Boolean)
                    field.onChange(tags)
                  }}
                />
              )}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4  border-gray-100 mt-6">
            <Space size="middle">
              <Button onClick={() => onOpenChange(false)} size="large">
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                className="bg-primary border-primary hover:bg-primary/90! hover:border-primary/90! text-primary-foreground"
              >
                {isEditing ? 'Update Client' : 'Create Client'}
              </Button>
            </Space>
          </div>
        </form>
      </div>
    </Modal>
  )
}
