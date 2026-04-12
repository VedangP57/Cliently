'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dayjs from 'dayjs'
import {
  Table,
  Tooltip,
  Input,
  Select as AntdSelect,
  Button as AntdButton,
  Tag,
  Switch as AntdSwitch,
  type TableProps,
} from 'antd'
import { useToast } from '@/hooks/use-toast'
import { updateUserRoleAction, toggleUserBanAction } from '@/lib/actions/admin'
import { Search, Users } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'

interface AdminUserRow {
  id: string
  fullName: string
  email: string
  role: 'user' | 'admin'
  createdAt: string
  isBanned: boolean
}

interface UserTableProps {
  users: AdminUserRow[]
}

type RoleFilter = 'all' | 'user' | 'admin'

const ROLE_OPTIONS = [
  { label: 'All Roles', value: 'all' },
  { label: 'User', value: 'user' },
  { label: 'Admin', value: 'admin' },
]

export function UserTable({ users }: UserTableProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')

  const filtered = users
    .filter((u) => {
      const matchesSearch =
        u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      const matchesRole = roleFilter === 'all' || u.role === roleFilter
      return matchesSearch && matchesRole
    })
    .sort((a, b) => a.fullName.localeCompare(b.fullName))

  async function changeRole(targetUserId: string, role: 'user' | 'admin') {
    setUpdatingUserId(targetUserId)
    const result = await updateUserRoleAction({ targetUserId, role })
    setUpdatingUserId(null)

    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
      return
    }

    toast({ title: 'Role updated' })
    router.refresh()
  }

  async function toggleBan(targetUserId: string, currentState: boolean) {
    setUpdatingUserId(targetUserId)
    const result = await toggleUserBanAction({ targetUserId, ban: !currentState })
    setUpdatingUserId(null)

    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
      return
    }

    toast({ title: !currentState ? 'Account disabled' : 'Account enabled' })
    router.refresh()
  }

  const columns: TableProps<AdminUserRow>['columns'] = [
    {
      title: 'Name',
      dataIndex: 'fullName',
      key: 'fullName',
      align: 'center',
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      align: 'center',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      align: 'center',
      render: (role, record) => (
        <AntdSelect
          value={role}
          onChange={(value) => changeRole(record.id, value)}
          disabled={updatingUserId === record.id}
          className="w-28"
          options={[
            { label: 'User', value: 'user' },
            { label: 'Admin', value: 'admin' },
          ]}
        />
      ),
    },
    {
      title: 'Status',
      key: 'status',
      align: 'center',
      render: (_, record) => (
        <Tag color={record.isBanned ? 'red' : 'green'}>
          {record.isBanned ? 'Disabled' : 'Active'}
        </Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      align: 'center',
      render: (val) => dayjs(val).format('MMM D, YYYY'),
    },
    {
      title: 'Enabled',
      key: 'enabled',
      align: 'center',
      width: 100,
      render: (_, record) => (
        <Tooltip title={record.isBanned ? 'Enable account' : 'Disable account'}>
          <AntdSwitch
            checked={!record.isBanned}
            onChange={() => toggleBan(record.id, record.isBanned)}
            loading={updatingUserId === record.id}
            size="small"
          />
        </Tooltip>
      ),
    },
  ]

  if (filtered.length === 0 && users.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No users found"
        description="No registered users yet."
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-8 rounded-full text-sm"
            allowClear
          />
        </div>

        <AntdSelect
          className="w-[130px] h-8 select-rounded-full"
          value={roleFilter}
          onChange={(value: RoleFilter) => setRoleFilter(value)}
          options={ROLE_OPTIONS}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description="Try adjusting your search or filter."
        />
      ) : (
        <div className="user-table">
          <Table<AdminUserRow>
            columns={columns}
            dataSource={filtered}
            rowKey="id"
            bordered
            size="small"
            pagination={{
              pageSize: 10,
              showSizeChanger: false,
              hideOnSinglePage: true,
              placement: 'bottomCenter',
              className: 'ant-pagination-mini',
            } as any}
            scroll={{ x: 700 }}
          />
        </div>
      )}
    </div>
  )
}
