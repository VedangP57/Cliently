'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { taskSchema, type TaskFormValues } from '@/lib/validations/task'
import type { TaskStatus } from '@/types'
import { ensureProfile } from '@/lib/actions/ensure-profile'

export async function createTaskAction(data: TaskFormValues) {
  const parsed = taskSchema.safeParse(data)
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { data: null, error: 'Unauthorized' }

  await ensureProfile(user)

  // Get the max position for the target status column
  const { data: maxPos } = await supabase
    .from('tasks')
    .select('position')
    .eq('user_id', user.id)
    .eq('status', parsed.data.status)
    .order('position', { ascending: false })
    .limit(1)
    .single()

  const position = (maxPos?.position ?? -1) + 1

  const { data: task, error } = await supabase
    .from('tasks')
    .insert({
      title: parsed.data.title,
      project_id: parsed.data.project_id || null,
      description: parsed.data.description || null,
      status: parsed.data.status,
      priority: parsed.data.priority,
      due_date: parsed.data.due_date || null,
      position,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) return { data: null, error: error.message }

  revalidatePath('/dashboard/tasks')
  return { data: task, error: null }
}

export async function updateTaskAction(id: string, data: TaskFormValues) {
  const parsed = taskSchema.safeParse(data)
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { data: null, error: 'Unauthorized' }

  const { data: task, error } = await supabase
    .from('tasks')
    .update({
      title: parsed.data.title,
      project_id: parsed.data.project_id || null,
      description: parsed.data.description || null,
      status: parsed.data.status,
      priority: parsed.data.priority,
      due_date: parsed.data.due_date || null,
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return { data: null, error: error.message }

  revalidatePath('/dashboard/tasks')
  return { data: task, error: null }
}

export async function updateTaskStatusAction(
  id: string,
  status: TaskStatus,
  position: number
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { data: null, error: 'Unauthorized' }

  const { error } = await supabase
    .from('tasks')
    .update({ status, position })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { data: null, error: error.message }

  revalidatePath('/dashboard/tasks')
  return { data: true, error: null }
}

export async function deleteTaskAction(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { data: null, error: 'Unauthorized' }

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { data: null, error: error.message }

  revalidatePath('/dashboard/tasks')
  return { data: true, error: null }
}
