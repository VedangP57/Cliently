'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { expenseSchema, type ExpenseFormValues } from '@/lib/validations/expense'
import { ensureProfile } from '@/lib/actions/ensure-profile'

export async function createExpenseAction(data: ExpenseFormValues) {
  const parsed = expenseSchema.safeParse(data)
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { data: null, error: 'Unauthorized' }

  await ensureProfile(user)

  const { data: expense, error } = await supabase
    .from('expenses')
    .insert({
      title: parsed.data.title,
      amount: parsed.data.amount,
      category: parsed.data.category,
      project_id: parsed.data.project_id || null,
      date: parsed.data.date,
      billable: parsed.data.billable,
      receipt_url: parsed.data.receipt_url || null,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) return { data: null, error: error.message }

  revalidatePath('/dashboard/expenses')
  return { data: expense, error: null }
}

export async function updateExpenseAction(id: string, data: ExpenseFormValues) {
  const parsed = expenseSchema.safeParse(data)
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { data: null, error: 'Unauthorized' }

  const { data: expense, error } = await supabase
    .from('expenses')
    .update({
      title: parsed.data.title,
      amount: parsed.data.amount,
      category: parsed.data.category,
      project_id: parsed.data.project_id || null,
      date: parsed.data.date,
      billable: parsed.data.billable,
      receipt_url: parsed.data.receipt_url || null,
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return { data: null, error: error.message }

  revalidatePath('/dashboard/expenses')
  return { data: expense, error: null }
}

export async function deleteExpenseAction(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { data: null, error: 'Unauthorized' }

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { data: null, error: error.message }

  revalidatePath('/dashboard/expenses')
  return { data: true, error: null }
}
