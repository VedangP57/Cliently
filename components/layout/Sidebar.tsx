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
  ChevronsLeft,
  ChevronsRight,
  LogOut,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { Avatar, Button, Dropdown, Tooltip } from 'antd'
import type { MenuProps } from 'antd'
import { logoutAction } from '@/lib/actions/auth'
import { getInitials } from '@/lib/utils'
import { NoiseTexture } from '@/components/ui/noise-texture'

type NavItem = { label: string; href: string; icon: LucideIcon }
type NavGroup = { label: string; items: NavItem[] }

const dashboardNavGroups: NavGroup[] = [
  {
    label: 'Workspace',
    items: [{ label: 'Overview', href: '/dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Clients', href: '/dashboard/clients', icon: Users },
      { label: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
      { label: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
    ],
  },
  {
    label: 'Documents',
    items: [
      { label: 'Proposals', href: '/dashboard/proposals', icon: FileText },
      { label: 'Contracts', href: '/dashboard/contracts', icon: FileSignature },
    ],
  },
  {
    label: 'Finance',
    items: [
      { label: 'Time', href: '/dashboard/time', icon: Clock },
      { label: 'Expenses', href: '/dashboard/expenses', icon: Receipt },
      { label: 'Invoices', href: '/dashboard/invoices', icon: FileSpreadsheet },
    ],
  },
  {
    label: 'Insights',
    items: [
      { label: 'Calendar', href: '/dashboard/calendar', icon: Calendar },
      { label: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
    ],
  },
]

const adminNavGroups: NavGroup[] = [
  {
    label: 'Administration',
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      { label: 'Users', href: '/admin/users', icon: Users },
      { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    ],
  },
]

interface SidebarProps {
  user: {
    full_name: string | null
    email: string
    avatar_url: string | null
  }
  variant?: 'dashboard' | 'admin'
}

function isNavActive(pathname: string, href: string) {
  return href === '/dashboard' || href === '/admin'
    ? pathname === href
    : pathname.startsWith(href)
}

export function Sidebar({ user, variant = 'dashboard' }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const navGroups = variant === 'admin' ? adminNavGroups : dashboardNavGroups
  const homeHref = variant === 'admin' ? '/admin' : '/dashboard'
  const settingsHref = variant === 'admin' ? '/admin/settings' : '/dashboard/settings'

  useEffect(() => {
    setMounted(true)
  }, [])

  const menuItems: MenuProps['items'] = [
    {
      key: 'settings',
      icon: <Settings className="h-4 w-4" />,
      label: <Link href={settingsHref}>Settings</Link>,
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogOut className="h-4 w-4" />,
      label: 'Log out',
      onClick: async () => { await logoutAction() },
    },
    { type: 'divider' },
    {
      key: 'email',
      label: user.email,
      disabled: true,
    },
  ]

  function renderNavLink(item: NavItem) {
    const isActive = mounted && isNavActive(pathname, item.href)
    const Icon = item.icon

    const link = (
      <Link
        href={item.href}
        suppressHydrationWarning
        className={cn(
          'sidebar-nav-link group relative flex items-center gap-3 rounded-lg py-2 text-[13px] transition-all duration-200 cursor-pointer no-underline outline-none focus-visible:ring-2 focus-visible:ring-[#5e5cc5]/30',
          isActive
            ? 'sidebar-active bg-gradient-to-r from-[#5e5cc5]/[0.14] to-[#5e5cc5]/[0.03] px-3 font-semibold dark:from-[#5e5cc5]/[0.22] dark:to-[#5e5cc5]/[0.05]'
            : 'px-3 font-normal hover:bg-[#f5f5f5] dark:hover:bg-white/[0.05]',
          collapsed && 'justify-center px-2.5',
          collapsed && isActive && 'bg-[#5e5cc5]/[0.15] dark:bg-[#5e5cc5]/30'
        )}
        title={collapsed ? item.label : undefined}
      >
        <span
          className={cn(
            'flex shrink-0 items-center justify-center rounded-md transition-all duration-200',
            isActive
              ? 'h-7 w-7 bg-gradient-to-br from-[#7473d4] to-[#4543aa] text-white shadow-[0_2px_8px_rgba(94,92,197,0.5)] dark:from-[#7c7adb] dark:to-[#4a48b0] dark:shadow-[0_2px_12px_rgba(94,92,197,0.6)]'
              : 'h-[18px] w-[18px] text-[#737373] group-hover:text-[#404040] dark:text-white/50 dark:group-hover:text-white/80'
          )}
        >
          <Icon className={cn(isActive ? 'h-4 w-4' : 'h-[18px] w-[18px]')} strokeWidth={isActive ? 2.25 : 1.75} />
        </span>
        {!collapsed && (
          <span className={cn('sidebar-nav-label truncate', isActive ? 'dark:text-white' : 'dark:text-white/65')}>{item.label}</span>
        )}
      </Link>
    )

    if (collapsed) {
      return (
        <Tooltip key={item.href} title={item.label} placement="right">
          {link}
        </Tooltip>
      )
    }

    return <div key={item.href}>{link}</div>
  }

  return (
    <aside
      className={cn(
        'sidebar-root relative z-10 hidden lg:flex flex-col shrink-0 self-stretch overflow-hidden rounded-xl border border-[#e2e8f0] bg-white my-4 ml-4 transition-[width,box-shadow] duration-300 ease-out',
        collapsed ? 'w-[72px]' : 'w-[252px]'
      )}
    >
      {/* Noise texture — subtle grain over the whole panel */}
      <NoiseTexture
        id="sidebar"
        className="absolute inset-0 z-0"
        baseFrequency={0.62}
      />

      {/* All content sits above the noise layer */}
      <div className="relative z-[1] flex flex-1 min-h-0 flex-col">

      {/* Brand header */}
      <div
        className={cn(
          'flex h-[60px] shrink-0 items-center border-b border-[#e0e0e0] dark:border-[#333]',
          collapsed ? 'justify-center px-0' : 'justify-between gap-2 px-3'
        )}
      >
        {collapsed ? (
          <Tooltip title="Expand sidebar" placement="right">
            <button
              type="button"
              aria-label="Expand sidebar"
              onClick={() => setCollapsed(false)}
              className="flex h-9 w-9 mt-2 items-center justify-center rounded-lg bg-gradient-to-br from-[#5e5cc5] to-[#4a48b0] text-white shadow-sm outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#5e5cc5]/40 cursor-pointer"
            >
              <ChevronsRight className="h-4 w-4" strokeWidth={2.25} />
            </button>
          </Tooltip>
        ) : (
          <>
            <Link
              href={homeHref}
              className="flex min-w-0 flex-1 items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-[#5e5cc5]/40 rounded-lg"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#5e5cc5] to-[#4a48b0] text-white shadow-sm">
                <Sparkles className="h-4 w-4" strokeWidth={2.25} />
              </span>
              <div className="min-w-0 leading-tight">
                <span className="block truncate text-[18px] font-bold tracking-tight text-[#18181b] dark:text-white">
                  Cliently
                </span>
                {variant === 'admin' && (
                  <span className="block truncate text-[10px] font-medium uppercase tracking-wider text-[#71717a] dark:text-white/40">
                    Admin
                  </span>
                )}
              </div>
            </Link>

            <Tooltip title="Collapse sidebar">
              <Button
                type="text"
                size="small"
                aria-label="Collapse sidebar"
                icon={<ChevronsLeft className="h-4 w-4" />}
                onClick={() => setCollapsed(true)}
                className="sidebar-collapse-btn !flex !h-8 !w-8 !shrink-0 !items-center !justify-center !rounded-lg !border !border-[#e2e2e2] !bg-black/[0.04] hover:!bg-black/[0.08] dark:!border-white/[0.09] dark:!bg-white/[0.06] dark:hover:!bg-white/[0.10]"
              />
            </Tooltip>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav flex-1 overflow-y-auto overflow-x-hidden px-2 py-3">
        {navGroups.map((group, groupIndex) => (
          <div key={group.label} className={cn(groupIndex > 0 && 'mt-1')}>
            {!collapsed && (
              <p className="mb-1 px-3 pt-4 first:pt-1 text-[11px] font-medium uppercase tracking-[0.06em] text-[#a3a3a3] dark:text-white/30">
                {group.label}
              </p>
            )}
            {collapsed && groupIndex > 0 && (
              <div className="mx-2 my-2 border-t border-[#e0e0e0] dark:border-[#333]" />
            )}
            <div className="space-y-0.5">
              {group.items.map(renderNavLink)}
            </div>
          </div>
        ))}

        {/* Settings — pinned above footer */}
        <div className={cn('mt-3 pt-1', collapsed && 'mx-0')}>
          {!collapsed && (
            <p className="mb-1 px-3 pt-4 text-[11px] font-medium uppercase tracking-[0.06em] text-[#a3a3a3] dark:text-white/30">
              System
            </p>
          )}
          {renderNavLink({ label: 'Settings', href: settingsHref, icon: Settings })}
        </div>
      </nav>

      {/* User footer */}
      <div className="shrink-0 p-2">
        <div
          className={cn(
            'flex items-center gap-2 rounded-xl border border-[#e8e8e8]/80 bg-black/[0.03] p-1.5 dark:border-white/[0.07] dark:bg-white/[0.04]',
            collapsed ? 'justify-center' : ''
          )}
        >
          <div className={cn(collapsed ? '' : 'flex-1 min-w-0')}>
            <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="topLeft">
              <Button
                type="text"
                className={cn(
                  '!rounded-lg dark:!text-white dark:hover:!bg-white/10',
                  collapsed
                    ? '!h-9 !w-9 !px-0 flex items-center justify-center'
                    : '!min-h-10 !h-auto !w-full flex items-center !justify-start !px-1.5 !py-1 min-w-0'
                )}
              >
                <Avatar
                  src={user.avatar_url ?? undefined}
                  size={32}
                  className="shrink-0 ring-2 ring-white dark:ring-[#1a1a1a]"
                >
                  {user.full_name ? getInitials(user.full_name) : '?'}
                </Avatar>
                {!collapsed && (
                  <div className="ml-2 flex min-w-0 flex-1 flex-col items-start text-left">
                    <span className="w-full truncate text-[13px] font-semibold leading-tight text-[#1e293b] dark:text-white">
                      {user.full_name ?? 'User'}
                    </span>
                    <span className="w-full truncate text-[11px] leading-tight text-[#64748b] dark:text-white/50">
                      {user.email}
                    </span>
                  </div>
                )}
              </Button>
            </Dropdown>
          </div>

          {!collapsed && (
            <div className="shrink-0 pr-0.5">
              <ThemeToggle />
            </div>
          )}
        </div>
      </div>

      </div>{/* end z-[1] wrapper */}
    </aside>
  )
}
