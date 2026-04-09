'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  CheckSquare,
  FileText,
  FileSignature,
  Clock,
  Receipt,
  FileSpreadsheet,
  Calendar,
  BarChart3,
  Settings,
} from 'lucide-react'

const navItems = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Clients', href: '/dashboard/clients', icon: Users },
  { label: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
  { label: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
  { label: 'Proposals', href: '/dashboard/proposals', icon: FileText },
  { label: 'Contracts', href: '/dashboard/contracts', icon: FileSignature },
  { label: 'Time', href: '/dashboard/time', icon: Clock },
  { label: 'Expenses', href: '/dashboard/expenses', icon: Receipt },
  { label: 'Invoices', href: '/dashboard/invoices', icon: FileSpreadsheet },
  { label: 'Calendar', href: '/dashboard/calendar', icon: Calendar },
  { label: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function MobileSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center h-16 px-4 border-b">
        <Link href="/dashboard" className="font-bold text-xl">
          Cliently
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
