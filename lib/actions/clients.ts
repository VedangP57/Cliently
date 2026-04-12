'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { clientSchema, type ClientFormValues } from '@/lib/validations/client'
import { ensureProfile } from '@/lib/actions/ensure-profile'
import { updateOnboardingStep } from '@/lib/actions/onboarding'

export async function createClientAction(data: ClientFormValues) {
  const parsed = clientSchema.safeParse(data)
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { data: null, error: 'Unauthorized' }

  // Ensure profile row exists (uses Admin client to bypass RLS)
  await ensureProfile(user)

  const { data: client, error } = await supabase
    .from('clients')
    .insert({
      ...parsed.data,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      company: parsed.data.company || null,
      website: parsed.data.website || null,
      address: parsed.data.address || null,
      notes: parsed.data.notes || null,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) return { data: null, error: error.message }

  updateOnboardingStep('has_added_client', true).catch(() => {})

  revalidatePath('/dashboard/clients')
  return { data: client, error: null }
}

export async function updateClientAction(id: string, data: ClientFormValues) {
  const parsed = clientSchema.safeParse(data)
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { data: null, error: 'Unauthorized' }

  const { data: client, error } = await supabase
    .from('clients')
    .update({
      ...parsed.data,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      company: parsed.data.company || null,
      website: parsed.data.website || null,
      address: parsed.data.address || null,
      notes: parsed.data.notes || null,
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return { data: null, error: error.message }

  revalidatePath('/dashboard/clients')
  revalidatePath(`/dashboard/clients/${id}`)
  return { data: client, error: null }
}

export async function deleteClientAction(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { data: null, error: 'Unauthorized' }

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { data: null, error: error.message }

  revalidatePath('/dashboard/clients')
  return { data: true, error: null }
}

export async function deleteClientsAction(ids: string[]) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { data: null, error: 'Unauthorized' }

  const { error } = await supabase
    .from('clients')
    .delete()
    .in('id', ids)
    .eq('user_id', user.id)

  if (error) return { data: null, error: error.message }

  revalidatePath('/dashboard/clients')
  return { data: true, error: null }
}
