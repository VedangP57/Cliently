'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { projectSchema, type ProjectFormValues } from '@/lib/validations/project'
import { ensureProfile } from '@/lib/actions/ensure-profile'
import { updateOnboardingStep } from '@/lib/actions/onboarding'

export async function createProjectAction(data: ProjectFormValues) {
  const parsed = projectSchema.safeParse(data)
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { data: null, error: 'Unauthorized' }

  await ensureProfile(user)

  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      title: parsed.data.title,
      client_id: parsed.data.client_id || null,
      description: parsed.data.description || null,
      status: parsed.data.status,
      deadline: parsed.data.deadline || null,
      budget: parsed.data.budget || null,
      notes: parsed.data.notes || null,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) return { data: null, error: error.message }

  updateOnboardingStep('has_created_project', true).catch(() => {})

  revalidatePath('/dashboard/projects')
  return { data: project, error: null }
}

export async function updateProjectAction(id: string, data: ProjectFormValues) {
  const parsed = projectSchema.safeParse(data)
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { data: null, error: 'Unauthorized' }

  const { data: project, error } = await supabase
    .from('projects')
    .update({
      title: parsed.data.title,
      client_id: parsed.data.client_id || null,
      description: parsed.data.description || null,
      status: parsed.data.status,
      deadline: parsed.data.deadline || null,
      budget: parsed.data.budget || null,
      notes: parsed.data.notes || null,
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return { data: null, error: error.message }

  revalidatePath('/dashboard/projects')
  revalidatePath(`/dashboard/projects/${id}`)
  return { data: project, error: null }
}

export async function deleteProjectAction(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { data: null, error: 'Unauthorized' }

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { data: null, error: error.message }

  revalidatePath('/dashboard/projects')
  return { data: true, error: null }
}

export async function bulkUpdateStatusAction(ids: string[], status: string) {
  if (!ids.length) return { error: null }

  const validStatuses = ['planning', 'in_progress', 'review', 'completed', 'on_hold', 'cancelled']
  if (!validStatuses.includes(status)) return { error: 'Invalid status' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('projects')
    .update({ status })
    .in('id', ids)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/projects')
  return { error: null }
}

export async function bulkDeleteProjectsAction(ids: string[]) {
  if (!ids.length) return { error: null }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('projects')
    .delete()
    .in('id', ids)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/projects')
  return { error: null }
}
