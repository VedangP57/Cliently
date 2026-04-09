'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Clock,
  FileSpreadsheet,
} from 'lucide-react'

const mobileNavItems = [
  { label: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Clients', href: '/dashboard/clients', icon: Users },
  { label: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
  { label: 'Time', href: '/dashboard/time', icon: Clock },
  { label: 'Invoices', href: '/dashboard/invoices', icon: FileSpreadsheet },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card lg:hidden">
      <div className="flex items-center justify-around h-16">
        {mobileNavItems.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
