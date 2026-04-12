'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { invoiceSchema, type InvoiceFormValues } from '@/lib/validations/invoice'
import { generateSlug } from '@/lib/utils'
import { ensureProfile } from '@/lib/actions/ensure-profile'
import { updateOnboardingStep } from '@/lib/actions/onboarding'

export async function createInvoiceAction(data: InvoiceFormValues) {
  const parsed = invoiceSchema.safeParse(data)
  if (!parsed.success) return { data: null, error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Unauthorized' }

  await ensureProfile(user)

  const invoiceNumber = await generateInvoiceNumber(supabase, user.id)

  const { data: invoice, error } = await supabase
    .from('invoices')
    .insert({
      client_id: parsed.data.client_id || null,
      project_id: parsed.data.project_id || null,
      invoice_number: parsed.data.invoice_number || invoiceNumber,
      status: parsed.data.status,
      issue_date: parsed.data.issue_date || null,
      due_date: parsed.data.due_date || null,
      tax_rate: parsed.data.tax_rate,
      discount: parsed.data.discount,
      notes: parsed.data.notes || null,
      slug: generateSlug('invoice'),
      user_id: user.id,
    })
    .select()
    .single()

  if (error) return { data: null, error: error.message }

  updateOnboardingStep('has_created_invoice', true).catch(() => {})

  revalidatePath('/dashboard/invoices')
  return { data: invoice, error: null }
}

export async function updateInvoiceAction(id: string, data: Partial<InvoiceFormValues>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Unauthorized' }

  const updateData: Record<string, unknown> = {}
  if (data.client_id !== undefined) updateData.client_id = data.client_id || null
  if (data.project_id !== undefined) updateData.project_id = data.project_id || null
  if (data.invoice_number !== undefined) updateData.invoice_number = data.invoice_number || null
  if (data.status !== undefined) updateData.status = data.status
  if (data.issue_date !== undefined) updateData.issue_date = data.issue_date || null
  if (data.due_date !== undefined) updateData.due_date = data.due_date || null
  if (data.tax_rate !== undefined) updateData.tax_rate = data.tax_rate
  if (data.discount !== undefined) updateData.discount = data.discount
  if (data.notes !== undefined) updateData.notes = data.notes || null

  const { data: invoice, error } = await supabase
    .from('invoices')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  revalidatePath('/dashboard/invoices')
  revalidatePath(`/dashboard/invoices/${id}`)
  return { data: invoice, error: null }
}

export async function deleteInvoiceAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Unauthorized' }

  const { error } = await supabase.from('invoices').delete().eq('id', id).eq('user_id', user.id)
  if (error) return { data: null, error: error.message }
  revalidatePath('/dashboard/invoices')
  return { data: true, error: null }
}

async function generateInvoiceNumber(supabase: ReturnType<typeof Object>, userId: string): Promise<string> {
  const sb = supabase as Awaited<ReturnType<typeof createClient>>
  const { count } = await sb
    .from('invoices')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  const num = (count ?? 0) + 1
  return `INV-${String(num).padStart(4, '0')}`
}
