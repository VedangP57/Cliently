'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { timeLogSchema, type TimeLogFormValues } from '@/lib/validations/time-log'
import { ensureProfile } from '@/lib/actions/ensure-profile'
import { updateOnboardingStep } from '@/lib/actions/onboarding'

export async function createTimeLogAction(data: TimeLogFormValues) {
  const parsed = timeLogSchema.safeParse(data)
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { data: null, error: 'Unauthorized' }

  await ensureProfile(user)

  const { data: timeLog, error } = await supabase
    .from('time_logs')
    .insert({
      user_id: user.id,
      project_id: parsed.data.project_id || null,
      task_id: parsed.data.task_id || null,
      description: parsed.data.description || null,
      hours: parsed.data.hours,
      date: parsed.data.date,
      billable: parsed.data.billable,
    })
    .select()
    .single()

  if (error) return { data: null, error: error.message }

  updateOnboardingStep('has_logged_time', true).catch(() => {})

  revalidatePath('/dashboard/time')
  return { data: timeLog, error: null }
}

export async function updateTimeLogAction(id: string, data: TimeLogFormValues) {
  const parsed = timeLogSchema.safeParse(data)
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { data: null, error: 'Unauthorized' }

  const { data: timeLog, error } = await supabase
    .from('time_logs')
    .update({
      project_id: parsed.data.project_id || null,
      task_id: parsed.data.task_id || null,
      description: parsed.data.description || null,
      hours: parsed.data.hours,
      date: parsed.data.date,
      billable: parsed.data.billable,
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return { data: null, error: error.message }

  revalidatePath('/dashboard/time')
  return { data: timeLog, error: null }
}

export async function deleteTimeLogAction(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { data: null, error: 'Unauthorized' }

  const { error } = await supabase
    .from('time_logs')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { data: null, error: error.message }

  revalidatePath('/dashboard/time')
  return { data: true, error: null }
}
