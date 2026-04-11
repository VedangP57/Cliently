'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Card,
  Button as AntdButton,
  Input,
  Select as AntdSelect,
  Typography,
} from 'antd'
import { Play, Pause, Square, Timer } from 'lucide-react'
import { createTimeLogAction } from '@/lib/actions/time-logs'
import { useToast } from '@/hooks/use-toast'
import dayjs from 'dayjs'
import { SELECT_NONE, toSelectValue, fromSelectValue } from '@/lib/utils'
import type { Project, Task } from '@/types'

const { Title, Text } = Typography

type TimerState = 'idle' | 'running' | 'paused'

interface TimerWidgetProps {
  projects: Project[]
  tasks: Task[]
}

export function TimerWidget({ projects, tasks }: TimerWidgetProps) {
  const [timerState, setTimerState] = useState<TimerState>('idle')
  const [elapsed, setElapsed] = useState(0) // seconds
  const [projectId, setProjectId] = useState('')
  const [taskId, setTaskId] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const { toast } = useToast()

  const filteredTasks = tasks.filter(
    (t) => !projectId || t.project_id === projectId
  )

  const clearInterval_ = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => clearInterval_()
  }, [clearInterval_])

  function handleStart() {
    setTimerState('running')
    intervalRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1)
    }, 1000)
  }

  function handlePause() {
    setTimerState('paused')
    clearInterval_()
  }

  function handleResume() {
    setTimerState('running')
    intervalRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1)
    }, 1000)
  }

  async function handleStop() {
    clearInterval_()

    if (elapsed < 1) {
      setTimerState('idle')
      setElapsed(0)
      return
    }

    setSaving(true)
    const hours = Math.round((elapsed / 3600) * 100) / 100 // round to 2 decimals

    const result = await createTimeLogAction({
      project_id: projectId,
      task_id: taskId,
      description,
      hours: hours > 0 ? hours : 0.01,
      date: dayjs().format('YYYY-MM-DD'),
      billable: true,
    })

    setSaving(false)

    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
      return
    }

    toast({
      title: 'Time logged',
      description: `${formatTime(elapsed)} logged successfully.`,
    })

    setTimerState('idle')
    setElapsed(0)
    setProjectId('')
    setTaskId('')
    setDescription('')
  }

  function formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  return (
    <Card
      className="shadow-sm border-muted/20"
      classNames={{ header: 'pb-3', body: 'p-6' }}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
        {/* Timer display */}
        <div className="shrink-0 text-center lg:text-left">
          <p className="text-5xl font-mono font-bold tabular-nums tracking-wider text-primary">
            {formatTime(elapsed)}
          </p>
        </div>

        {/* Form elements */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:flex-1">
          <div className="space-y-1">
            <Text className="text-xs text-muted-foreground uppercase tracking-wider font-semibold px-1">Project</Text>
            <AntdSelect
              className="w-full h-9 select-rounded-full"
              placeholder="Select project"
              value={toSelectValue(projectId)}
              onChange={(v) => {
                setProjectId(fromSelectValue(v))
                setTaskId('')
              }}
              options={[
                { label: 'No project', value: SELECT_NONE },
                ...projects.map((p) => ({ label: p.title, value: p.id })),
              ]}
            />
          </div>

          <div className="space-y-1">
            <Text className="text-xs text-muted-foreground uppercase tracking-wider font-semibold px-1">Task</Text>
            <AntdSelect
              className="w-full h-9 select-rounded-full"
              placeholder="Select task"
              value={toSelectValue(taskId)}
              onChange={(v) => setTaskId(fromSelectValue(v))}
              options={[
                { label: 'No task', value: SELECT_NONE },
                ...filteredTasks.map((t) => ({ label: t.title, value: t.id })),
              ]}
            />
          </div>

          <div className="space-y-1">
            <Text className="text-xs text-muted-foreground uppercase tracking-wider font-semibold px-1">Description</Text>
            <Input
              className="h-9 rounded-full px-4 text-sm"
              placeholder="What are you working on?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 shrink-0 pt-2 lg:pt-0">
          {timerState === 'idle' && (
            <AntdButton
              type="primary"
              onClick={handleStart}
              className="h-10 rounded-full bg-primary hover:bg-primary/90! border-none flex items-center gap-2 px-6 font-medium"
            >
              <Play className="h-4.5 w-4.5 fill-current" />
              Start
            </AntdButton>
          )}
          {timerState === 'running' && (
            <>
              <AntdButton
                onClick={handlePause}
                className="h-10 rounded-full flex items-center gap-2 px-5 font-medium border-muted/30"
              >
                <Pause className="h-4.5 w-4.5" />
                Pause
              </AntdButton>
              <AntdButton
                onClick={handleStop}
                danger
                type="primary"
                className="h-10 rounded-full flex items-center gap-2 px-5 font-medium"
                disabled={saving}
              >
                <Square className="h-4 w-4 fill-current" />
                Stop
              </AntdButton>
            </>
          )}
          {timerState === 'paused' && (
            <>
              <AntdButton
                type="primary"
                onClick={handleResume}
                className="h-10 rounded-full bg-primary hover:bg-primary/90! border-none flex items-center gap-2 px-6 font-medium"
              >
                <Play className="h-4.5 w-4.5 fill-current" />
                Resume
              </AntdButton>
              <AntdButton
                onClick={handleStop}
                danger
                type="primary"
                className="h-10 rounded-full flex items-center gap-2 px-5 font-medium"
                disabled={saving}
              >
                <Square className="h-4 w-4 fill-current" />
                Stop
              </AntdButton>
            </>
          )}
        </div>
      </div>
    </Card>
  )
}
