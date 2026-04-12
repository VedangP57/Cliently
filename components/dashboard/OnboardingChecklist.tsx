'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { dismissOnboarding } from '@/lib/actions/onboarding'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  X,
  Rocket,
  User,
  Users,
  FolderKanban,
  Clock,
  FileSpreadsheet,
} from 'lucide-react'
import type { OnboardingProgress } from '@/types'

interface OnboardingChecklistProps {
  progress: OnboardingProgress
}

const STEPS = [
  {
    key: 'has_completed_profile' as const,
    label: 'Complete your profile',
    description: 'Add your name and avatar',
    href: '/dashboard/settings',
    icon: User,
  },
  {
    key: 'has_added_client' as const,
    label: 'Add your first client',
    description: 'Start managing your clients',
    href: '/dashboard/clients',
    icon: Users,
  },
  {
    key: 'has_created_project' as const,
    label: 'Create a project',
    description: 'Organize your work into projects',
    href: '/dashboard/projects',
    icon: FolderKanban,
  },
  {
    key: 'has_logged_time' as const,
    label: 'Log your time',
    description: 'Track time spent on work',
    href: '/dashboard/time',
    icon: Clock,
  },
  {
    key: 'has_created_invoice' as const,
    label: 'Create an invoice',
    description: 'Bill your clients for work done',
    href: '/dashboard/invoices',
    icon: FileSpreadsheet,
  },
]

export function OnboardingChecklist({ progress }: OnboardingChecklistProps) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [showCongrats, setShowCongrats] = useState(false)

  const completedCount = STEPS.filter((s) => progress[s.key]).length
  const totalSteps = STEPS.length
  const allDone = completedCount === totalSteps
  const progressPercent = (completedCount / totalSteps) * 100

  const handleDismiss = useCallback(async () => {
    setDismissed(true)
    await dismissOnboarding()
    router.refresh()
  }, [router])

  useEffect(() => {
    if (allDone && expanded) {
      setShowCongrats(true)
      const timer = setTimeout(() => {
        handleDismiss()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [allDone, expanded, handleDismiss])

  if (dismissed) return null

  // Collapsed state — small floating button
  if (!expanded) {
    return (
      <div className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50">
        <Button
          onClick={() => setExpanded(true)}
          className="h-12 rounded-full bg-[#5e5cc5] hover:bg-[#4d4bb0] text-white shadow-lg gap-2 px-5"
        >
          <Rocket className="h-4 w-4" />
          <span>Getting Started</span>
          <span className="ml-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
            {completedCount}/{totalSteps}
          </span>
        </Button>
      </div>
    )
  }

  // Congrats state
  if (showCongrats) {
    return (
      <div className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50 w-80">
        <Card className="shadow-xl border-[#5e5cc5]/20">
          <CardContent className="pt-6 pb-6 text-center space-y-2">
            <div className="text-4xl">🎉</div>
            <h3 className="text-lg font-semibold">All done!</h3>
            <p className="text-sm text-muted-foreground">
              You&apos;re all set up and ready to go. Great job!
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Expanded state
  return (
    <div className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50 w-80">
      <Card className="shadow-xl border-[#5e5cc5]/20">
        <CardHeader className="pb-3 pt-4 px-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold leading-none">
                Get started with Cliently
              </h3>
              <p className="text-xs text-muted-foreground">
                Complete these steps to get the most out of your account
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={() => setExpanded(false)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Progress value={progressPercent} className="h-2" />
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
              {completedCount}/{totalSteps}
            </span>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <div className="space-y-1">
            {STEPS.map((step) => {
              const done = progress[step.key]
              return (
                <div
                  key={step.key}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors',
                    done
                      ? 'opacity-60'
                      : 'hover:bg-accent cursor-pointer'
                  )}
                  onClick={() => {
                    if (!done) router.push(step.href)
                  }}
                  role={done ? undefined : 'link'}
                >
                  {done ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        'text-sm font-medium leading-tight',
                        done && 'line-through'
                      )}
                    >
                      {step.label}
                    </p>
                    <p className="text-xs text-muted-foreground leading-tight mt-0.5">
                      {step.description}
                    </p>
                  </div>
                  {!done && (
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                </div>
              )
            })}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-3 text-xs text-muted-foreground"
            onClick={handleDismiss}
          >
            Dismiss
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
