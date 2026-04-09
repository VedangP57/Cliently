'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { contractSchema, type ContractFormValues } from '@/lib/validations/contract'
import { generateSlug } from '@/lib/utils'
import { ensureProfile } from '@/lib/actions/ensure-profile'

export async function createContractAction(data: ContractFormValues) {
  const parsed = contractSchema.safeParse(data)
  if (!parsed.success) return { data: null, error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Unauthorized' }

  await ensureProfile(user)

  const { data: contract, error } = await supabase
    .from('contracts')
    .insert({
      title: parsed.data.title,
      client_id: parsed.data.client_id || null,
      project_id: parsed.data.project_id || null,
      content: parsed.data.content || null,
      status: parsed.data.status,
      slug: generateSlug(parsed.data.title),
      user_id: user.id,
    })
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  revalidatePath('/dashboard/contracts')
  return { data: contract, error: null }
}

export async function updateContractAction(id: string, data: Partial<ContractFormValues>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Unauthorized' }

  const updateData: Record<string, unknown> = {}
  if (data.title !== undefined) updateData.title = data.title
  if (data.client_id !== undefined) updateData.client_id = data.client_id || null
  if (data.project_id !== undefined) updateData.project_id = data.project_id || null
  if (data.content !== undefined) updateData.content = data.content || null
  if (data.status !== undefined) updateData.status = data.status

  const { data: contract, error } = await supabase
    .from('contracts')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  revalidatePath('/dashboard/contracts')
  revalidatePath(`/dashboard/contracts/${id}`)
  return { data: contract, error: null }
}

export async function deleteContractAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Unauthorized' }

  const { error } = await supabase.from('contracts').delete().eq('id', id).eq('user_id', user.id)
  if (error) return { data: null, error: error.message }
  revalidatePath('/dashboard/contracts')
  return { data: true, error: null }
}

export async function generateContractSlugAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Unauthorized' }

  const { data: contract } = await supabase
    .from('contracts')
    .select('title, slug')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!contract) return { data: null, error: 'Not found' }
  if (contract.slug) return { data: contract.slug, error: null }

  const slug = generateSlug(contract.title)
  const { error } = await supabase
    .from('contracts')
    .update({ slug })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { data: null, error: error.message }
  revalidatePath(`/dashboard/contracts/${id}`)
  return { data: slug, error: null }
}

export async function signContractAction(slug: string, signedName: string) {
  if (!signedName.trim()) return { data: null, error: 'Name is required' }

  const supabase = await createClient()
  const { data: contract, error } = await supabase
    .from('contracts')
    .update({
      signed_name: signedName.trim(),
      signed_at: new Date().toISOString(),
      status: 'signed',
    })
    .eq('slug', slug)
    .eq('status', 'sent')
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  if (!contract) return { data: null, error: 'Contract not found or already signed' }
  return { data: true, error: null }
}
