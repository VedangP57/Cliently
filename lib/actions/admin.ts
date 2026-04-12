'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const updateRoleSchema = z.object({
  targetUserId: z.string().uuid(),
  role: z.enum(['user', 'admin']),
})

const toggleBanSchema = z.object({
  targetUserId: z.string().uuid(),
  ban: z.boolean(),
})

async function assertAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, error: 'Unauthorized' as const }
  }

  // Use admin client to bypass RLS infinite recursion on profiles table
  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return { ok: false, error: 'Forbidden' as const }
  }

  return { ok: true as const }
}

export async function updateUserRoleAction(input: unknown) {
  const parsed = updateRoleSchema.safeParse(input)
  if (!parsed.success) {
    return { data: null, error: 'Invalid input' }
  }

  const adminCheck = await assertAdmin()
  if (!adminCheck.ok) {
    return { data: null, error: adminCheck.error }
  }

  const admin = createAdminClient()
  const { targetUserId, role } = parsed.data

  const { data, error } = await admin
    .from('profiles')
    .update({ role })
    .eq('id', targetUserId)
    .select('id, role')
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/users')
  return { data, error: null }
}

export async function toggleUserBanAction(input: unknown) {
  const parsed = toggleBanSchema.safeParse(input)
  if (!parsed.success) {
    return { data: null, error: 'Invalid input' }
  }

  const adminCheck = await assertAdmin()
  if (!adminCheck.ok) {
    return { data: null, error: adminCheck.error }
  }

  const admin = createAdminClient()
  const { targetUserId, ban } = parsed.data

  const { data, error } = await admin.auth.admin.updateUserById(targetUserId, {
    ban_duration: ban ? '876000h' : 'none',
  })

  if (error) {
    return { data: null, error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/users')
  return { data, error: null }
}
