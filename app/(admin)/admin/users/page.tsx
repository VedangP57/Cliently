import { PageHeader } from '@/components/shared/PageHeader'
import dayjs from 'dayjs'
import { createAdminClient } from '@/lib/supabase/admin'
import { UserTable } from '@/components/admin/UserTable'

export default async function UserManagementPage() {
  const admin = createAdminClient()
  const { data: authUsers } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  })

  const userIds = (authUsers?.users ?? []).map((user) => user.id)
  const { data: profiles } = userIds.length
    ? await admin
        .from('profiles')
        .select('id, full_name, role, created_at')
        .in('id', userIds)
    : { data: [] as Array<{ id: string; full_name: string | null; role: 'user' | 'admin'; created_at: string }> }

  const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile]))
  const users = (authUsers?.users ?? []).map((user) => {
    const profile = profileMap.get(user.id)
    const bannedUntil = user.banned_until
    const isBanned = !!(bannedUntil && dayjs(bannedUntil).isAfter(dayjs()))
    return {
      id: user.id,
      fullName: profile?.full_name ?? user.user_metadata?.full_name ?? '—',
      email: user.email ?? '—',
      role: profile?.role ?? 'user',
      createdAt: profile?.created_at ?? user.created_at,
      isBanned,
    }
  })

  return (
    <div className="space-y-6">
      <PageHeader title="User Management" description={`${users.length} users`} />
      <UserTable users={users} />
    </div>
  )
}
