'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Play, Pause, Square, Timer } from 'lucide-react'
import { createTimeLogAction } from '@/lib/actions/time-logs'
import { useToast } from '@/hooks/use-toast'
import dayjs from 'dayjs'
import { SELECT_NONE, toSelectValue, fromSelectValue } from '@/lib/utils'
import type { Project, Task } from '@/types'

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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Timer className="h-5 w-5" />
          Timer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          {/* Timer display */}
          <div className="flex-shrink-0 text-center lg:text-left">
            <p className="text-4xl font-mono font-bold tabular-nums tracking-wider">
              {formatTime(elapsed)}
            </p>
          </div>

          {/* Controls row */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:flex-1">
            <div>
              <Label className="text-xs text-muted-foreground">Project</Label>
              <Select
                value={toSelectValue(projectId)}
                onValueChange={(v) => {
                  setProjectId(fromSelectValue(v))
                  setTaskId('')
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SELECT_NONE}>No project</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Task</Label>
              <Select
                value={toSelectValue(taskId)}
                onValueChange={(v) => setTaskId(fromSelectValue(v))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select task" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SELECT_NONE}>No task</SelectItem>
                  {filteredTasks.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Description</Label>
              <Input
                className="mt-1"
                placeholder="What are you working on?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 flex-shrink-0">
            {timerState === 'idle' && (
              <Button onClick={handleStart} className="gap-2">
                <Play className="h-4 w-4" />
                Start
              </Button>
            )}
            {timerState === 'running' && (
              <>
                <Button onClick={handlePause} variant="outline" className="gap-2">
                  <Pause className="h-4 w-4" />
                  Pause
                </Button>
                <Button onClick={handleStop} variant="destructive" className="gap-2" disabled={saving}>
                  <Square className="h-4 w-4" />
                  Stop
                </Button>
              </>
            )}
            {timerState === 'paused' && (
              <>
                <Button onClick={handleResume} className="gap-2">
                  <Play className="h-4 w-4" />
                  Resume
                </Button>
                <Button onClick={handleStop} variant="destructive" className="gap-2" disabled={saving}>
                  <Square className="h-4 w-4" />
                  Stop
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
