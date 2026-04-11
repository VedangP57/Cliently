'use client'

import { useEffect, useState } from 'react'
import {
  Modal,
  Form,
  Input,
  Select as AntdSelect,
  InputNumber,
  DatePicker,
  Switch,
  Button as AntdButton,
  Typography,
} from 'antd'
import { createTimeLogAction, updateTimeLogAction } from '@/lib/actions/time-logs'
import { useToast } from '@/hooks/use-toast'
import dayjs from 'dayjs'
import { SELECT_NONE, toSelectValue, fromSelectValue } from '@/lib/utils'
import type { Project, Task, TimeLog } from '@/types'
import { Loader2 } from 'lucide-react'

const { Text } = Typography

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
  const [projectId, setProjectId] = useState<string>('')
  const { toast } = useToast()
  const [form] = Form.useForm()
  const isEditing = !!timeLog

  const filteredTasks = tasks.filter(
    (t) => !projectId || t.project_id === projectId
  )

  useEffect(() => {
    if (open) {
      if (timeLog) {
        setProjectId(timeLog.project_id ?? '')
        form.setFieldsValue({
          project_id: toSelectValue(timeLog.project_id),
          task_id: toSelectValue(timeLog.task_id),
          description: timeLog.description ?? '',
          hours: timeLog.hours ?? 1,
          date: timeLog.date ? dayjs(timeLog.date) : dayjs(),
          billable: timeLog.billable ?? true,
        })
      } else {
        setProjectId('')
        form.resetFields()
        form.setFieldsValue({
          date: dayjs(),
          hours: 1,
          billable: true,
          project_id: SELECT_NONE,
          task_id: SELECT_NONE,
        })
      }
    }
  }, [open, timeLog, form])

  async function onFinish(values: any) {
    setLoading(true)
    const formattedData = {
      project_id: fromSelectValue(values.project_id),
      task_id: fromSelectValue(values.task_id),
      description: values.description,
      hours: values.hours,
      date: values.date.format('YYYY-MM-DD'),
      billable: values.billable,
    }

    const result = isEditing
      ? await updateTimeLogAction(timeLog.id, formattedData)
      : await createTimeLogAction(formattedData)

    setLoading(false)

    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
      return
    }

    toast({
      title: isEditing ? 'Time log updated' : 'Time logged',
      description: `${values.hours}h has been ${isEditing ? 'updated' : 'logged'}.`,
    })

    onOpenChange(false)
  }

  return (
    <Modal
      open={open}
      onCancel={() => onOpenChange(false)}
      title={
        <div className="flex flex-col gap-1 pb-2">
          <span className="text-lg font-semibold">{isEditing ? 'Edit Time Log' : 'Log Time Manually'}</span>
          <Text className="text-xs text-muted-foreground font-normal">
            {isEditing ? 'Update the time log entry.' : 'Add a manual time entry.'}
          </Text>
        </div>
      }
      footer={null}
      destroyOnHidden
      centered
      className="premium-modal"
      width={500}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          hours: 1,
          date: dayjs(),
          billable: true,
        }}
        className="pt-4"
      >
        <Form.Item
          name="project_id"
          label={<span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Project</span>}
        >
          <AntdSelect
            className="h-10 select-rounded-full"
            placeholder="Select project"
            onChange={(v) => {
              setProjectId(fromSelectValue(v))
              form.setFieldValue('task_id', SELECT_NONE)
            }}
            options={[
              { label: 'No project', value: SELECT_NONE },
              ...projects.map((p) => ({ label: p.title, value: p.id })),
            ]}
          />
        </Form.Item>

        <Form.Item
          name="task_id"
          label={<span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Task</span>}
        >
          <AntdSelect
            className="h-10 select-rounded-full"
            placeholder="Select task"
            options={[
              { label: 'No task', value: SELECT_NONE },
              ...filteredTasks.map((t) => ({ label: t.title, value: t.id })),
            ]}
          />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="date"
            label={<span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</span>}
            rules={[{ required: true, message: 'Please select a date' }]}
          >
            <DatePicker className="w-full h-10 rounded-full" format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item
            name="hours"
            label={<span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hours</span>}
            rules={[{ required: true, message: 'Required' }]}
          >
            <InputNumber
              className="w-full h-10 rounded-full flex items-center"
              min={0.01}
              step={0.25}
              placeholder="1.5"
            />
          </Form.Item>
        </div>

        <Form.Item
          name="description"
          label={<span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</span>}
        >
          <Input.TextArea
            placeholder="What did you work on?"
            autoSize={{ minRows: 3, maxRows: 5 }}
            className="rounded-xl px-4 py-3"
          />
        </Form.Item>

        <Form.Item
          name="billable"
          valuePropName="checked"
          className="mb-6"
        >
          <div className="flex items-center justify-between rounded-2xl border border-muted/30 p-4 bg-muted/5">
            <div className="space-y-0.5">
              <Text className="text-sm font-semibold block">Billable</Text>
              <Text className="text-xs text-muted-foreground block">Include this time in invoices</Text>
            </div>
            <Switch />
          </div>
        </Form.Item>

        <div className="flex justify-end gap-3 pt-2">
          <AntdButton
            className="h-10 rounded-full px-6 border-muted/50 font-medium"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </AntdButton>
          <AntdButton
            type="primary"
            htmlType="submit"
            className="h-10 rounded-full px-8 bg-primary hover:bg-primary/90! border-none font-medium flex items-center gap-2"
            loading={loading}
          >
            {isEditing ? 'Update Entry' : 'Log Time'}
          </AntdButton>
        </div>
      </Form>
    </Modal>
  )
}
