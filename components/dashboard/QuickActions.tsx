'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, FolderKanban, Clock, Receipt } from 'lucide-react'

const actions = [
  { label: 'New Client', href: '/dashboard/clients', icon: Users },
  { label: 'New Project', href: '/dashboard/projects', icon: FolderKanban },
  { label: 'Log Time', href: '/dashboard/time', icon: Clock },
  { label: 'Add Expense', href: '/dashboard/expenses', icon: Receipt },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className="h-auto flex-col gap-2 py-4"
            asChild
          >
            <Link href={action.href}>
              <action.icon className="h-5 w-5" />
              <span className="text-xs">{action.label}</span>
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}
