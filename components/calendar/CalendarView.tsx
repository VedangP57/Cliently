'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

export type CalendarEventType = 'project' | 'task' | 'invoice'

export interface CalendarEvent {
  id: string
  title: string
  date: string
  href: string
  type: CalendarEventType
  time?: string
  description?: string
}

interface CalendarViewProps {
  events: CalendarEvent[]
}

const eventStyles: Record<CalendarEventType, string> = {
  project: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
  task: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200',
  invoice: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
}

const eventBorders: Record<CalendarEventType, string> = {
  project: 'border-l-blue-500',
  task: 'border-l-yellow-500',
  invoice: 'border-l-red-500',
}

const eventLabels: Record<CalendarEventType, string> = {
  project: 'Project deadline',
  task: 'Task due',
  invoice: 'Invoice due',
}

function buildMonthCells(monthStart: dayjs.Dayjs) {
  const firstCell = monthStart.startOf('week')
  return Array.from({ length: 42 }, (_, index) => firstCell.add(index, 'day'))
}

export function CalendarView({ events }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(dayjs().startOf('month'))
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'))

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    for (const event of events) {
      const key = dayjs(event.date).format('YYYY-MM-DD')
      const list = map.get(key) ?? []
      list.push(event)
      map.set(key, list)
    }
    return map
  }, [events])

  const monthCells = useMemo(() => buildMonthCells(currentMonth), [currentMonth])
  const selectedEvents = eventsByDate.get(selectedDate) ?? []

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px] lg:grid-rows-1 lg:h-[calc(100vh-110px)]">
      <Card className="flex flex-col min-h-0 h-full">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <CardTitle>{currentMonth.format('MMMM YYYY')}</CardTitle>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth((prev) => prev.subtract(1, 'month'))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => {
                setCurrentMonth(dayjs().startOf('month'))
                setSelectedDate(dayjs().format('YYYY-MM-DD'))
              }}>
                Today
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth((prev) => prev.add(1, 'month'))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-7 text-center text-xs font-medium text-muted-foreground">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="py-1">
                {day}
              </div>
            ))}
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {monthCells.map((cellDate) => {
              const key = cellDate.format('YYYY-MM-DD')
              const dayEvents = eventsByDate.get(key) ?? []
              const isCurrentMonth = cellDate.month() === currentMonth.month()
              const isSelected = selectedDate === key
              const isToday = key === dayjs().format('YYYY-MM-DD')

              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => setSelectedDate(key)}
                  className={cn(
                    'min-h-24 rounded-md border p-1 text-left transition-colors sm:min-h-28',
                    isSelected && 'border-primary ring-2 ring-primary/20',
                    !isCurrentMonth && 'bg-muted/40 text-muted-foreground',
                    isToday && 'border-primary/60'
                  )}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className={cn('text-xs font-medium sm:text-sm', isToday && 'text-primary')}>
                      {cellDate.date()}
                    </span>
                    {dayEvents.length > 0 && (
                      <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                        {dayEvents.length}
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className={cn(
                          'truncate rounded px-1.5 py-0.5 text-[10px] font-medium sm:text-[11px]',
                          eventStyles[event.type]
                        )}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[10px] text-muted-foreground">+{dayEvents.length - 2} more</div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="flex flex-col min-h-0 h-full">
        <CardHeader>
          <CardTitle className="text-base">{dayjs(selectedDate).format('dddd, MMM D')}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 space-y-3 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {selectedEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No events for this day.</p>
          ) : (
            selectedEvents.map((event) => (
              <Link
                key={event.id}
                href={event.href}
                className={cn(
                  'block rounded-md border border-l-[3px] p-3 transition-colors hover:bg-muted/50',
                  eventBorders[event.type]
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{event.title}</p>
                    {event.description && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{event.description}</p>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <Badge className={cn('text-[10px]', eventStyles[event.type])}>{eventLabels[event.type]}</Badge>
                      {event.time && (
                        <span className="text-xs text-muted-foreground">{event.time}</span>
                      )}
                    </div>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground mt-0.5" />
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
