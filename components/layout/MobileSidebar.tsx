'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
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
  LogOut,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { logoutAction } from '@/lib/actions/auth'
import { getInitials } from '@/lib/utils'

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

interface MobileSidebarProps {
  user: {
    full_name: string | null
    email: string
    avatar_url: string | null
  }
}

export function MobileSidebar({ user }: MobileSidebarProps) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="flex h-full flex-col bg-[#F8FAFD] dark:bg-[#0a0a0a]">
      <div className="flex items-center h-16 px-4 border-b">
        <Link href="/dashboard" className="font-bold text-xl">
          Cliently
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = mounted && (
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)
          )
          return (
            <Link
              key={item.href}
              href={item.href}
              suppressHydrationWarning
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[#5e5cc5] text-white'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
      <div className="border-t p-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="min-h-12 h-auto w-full min-w-0 justify-start rounded-lg px-2 py-1.5">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={user.avatar_url ?? undefined} alt={user.full_name ?? 'User'} />
                    <AvatarFallback>
                      {user.full_name ? getInitials(user.full_name) : <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-1 flex min-w-0 flex-col items-start pr-1">
                    <span className="w-full truncate text-sm font-medium leading-tight">{user.full_name ?? 'User'}</span>
                    <span className="w-full truncate text-xs text-muted-foreground leading-tight">{user.email}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 translate-x-2">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <form action={logoutAction} className="w-full">
                  <DropdownMenuItem asChild>
                    <button type="submit" className="flex w-full items-center gap-2">
                      <LogOut className="h-4 w-4" />
                      Log out
                    </button>
                  </DropdownMenuItem>
                </form>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                  {user.email}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="shrink-0">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  )
}
