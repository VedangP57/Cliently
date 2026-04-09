'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dayjs from 'dayjs'
import { useToast } from '@/hooks/use-toast'
import { updateUserRoleAction, toggleUserBanAction } from '@/lib/actions/admin'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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

export function UserTable({ users }: UserTableProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)

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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Enabled</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.fullName}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Select
                    value={user.role}
                    onValueChange={(value) => changeRole(user.id, value as 'user' | 'admin')}
                    disabled={updatingUserId === user.id}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  {user.role === 'admin' && <Badge>Admin</Badge>}
                </div>
              </TableCell>
              <TableCell>{dayjs(user.createdAt).format('MMM D, YYYY')}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Switch
                    checked={!user.isBanned}
                    onCheckedChange={() => toggleBan(user.id, user.isBanned)}
                    disabled={updatingUserId === user.id}
                  />
                  <span className="text-xs text-muted-foreground">
                    {user.isBanned ? 'Disabled' : 'Enabled'}
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {users.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="py-6 text-center text-sm text-muted-foreground">
                No users found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
