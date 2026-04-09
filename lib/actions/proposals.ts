'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { proposalSchema, type ProposalFormValues } from '@/lib/validations/proposal'
import { generateSlug } from '@/lib/utils'
import { ensureProfile } from '@/lib/actions/ensure-profile'

export async function createProposalAction(data: ProposalFormValues) {
  const parsed = proposalSchema.safeParse(data)
  if (!parsed.success) return { data: null, error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Unauthorized' }

  await ensureProfile(user)

  const { data: proposal, error } = await supabase
    .from('proposals')
    .insert({
      title: parsed.data.title,
      client_id: parsed.data.client_id || null,
      content: parsed.data.content || null,
      status: parsed.data.status,
      valid_until: parsed.data.valid_until || null,
      total_amount: parsed.data.total_amount || null,
      slug: generateSlug(parsed.data.title),
      user_id: user.id,
    })
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  revalidatePath('/dashboard/proposals')
  return { data: proposal, error: null }
}

export async function updateProposalAction(id: string, data: Partial<ProposalFormValues>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Unauthorized' }

  const updateData: Record<string, unknown> = {}
  if (data.title !== undefined) updateData.title = data.title
  if (data.client_id !== undefined) updateData.client_id = data.client_id || null
  if (data.content !== undefined) updateData.content = data.content || null
  if (data.status !== undefined) updateData.status = data.status
  if (data.valid_until !== undefined) updateData.valid_until = data.valid_until || null
  if (data.total_amount !== undefined) updateData.total_amount = data.total_amount || null

  const { data: proposal, error } = await supabase
    .from('proposals')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  revalidatePath('/dashboard/proposals')
  revalidatePath(`/dashboard/proposals/${id}`)
  return { data: proposal, error: null }
}

export async function deleteProposalAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Unauthorized' }

  const { error } = await supabase.from('proposals').delete().eq('id', id).eq('user_id', user.id)
  if (error) return { data: null, error: error.message }
  revalidatePath('/dashboard/proposals')
  return { data: true, error: null }
}

export async function generateProposalSlugAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Unauthorized' }

  const { data: proposal } = await supabase.from('proposals').select('title, slug').eq('id', id).eq('user_id', user.id).single()
  if (!proposal) return { data: null, error: 'Not found' }

  if (proposal.slug) return { data: proposal.slug, error: null }

  const slug = generateSlug(proposal.title)
  const { error } = await supabase.from('proposals').update({ slug }).eq('id', id).eq('user_id', user.id)
  if (error) return { data: null, error: error.message }

  revalidatePath(`/dashboard/proposals/${id}`)
  return { data: slug, error: null }
}

export async function acceptProposalAction(slug: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('proposals')
    .update({ status: 'accepted' })
    .eq('slug', slug)
    .eq('status', 'sent')

  if (error) return { data: null, error: error.message }
  return { data: true, error: null }
}
