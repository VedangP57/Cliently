'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { InvoiceItemFormValues } from '@/lib/validations/invoice'

export async function upsertInvoiceItemsAction(invoiceId: string, items: InvoiceItemFormValues[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Unauthorized' }

  // Verify invoice ownership
  const { data: invoice } = await supabase
    .from('invoices')
    .select('id')
    .eq('id', invoiceId)
    .eq('user_id', user.id)
    .single()

  if (!invoice) return { data: null, error: 'Invoice not found' }

  // Delete existing items
  await supabase.from('invoice_items').delete().eq('invoice_id', invoiceId)

  // Insert new items
  if (items.length > 0) {
    const { error } = await supabase
      .from('invoice_items')
      .insert(
        items.map((item) => ({
          invoice_id: invoiceId,
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.quantity * item.rate,
          type: item.type,
        }))
      )

    if (error) return { data: null, error: error.message }
  }

  revalidatePath(`/dashboard/invoices/${invoiceId}`)
  return { data: true, error: null }
}

export async function getUninvoicedTimeLogsAction(projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('time_logs')
    .select('*')
    .eq('project_id', projectId)
    .eq('user_id', user.id)
    .eq('billable', true)
    .eq('invoiced', false)
    .order('date')

  if (error) return { data: null, error: error.message }
  return { data, error: null }
}

export async function getUninvoicedExpensesAction(projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('project_id', projectId)
    .eq('user_id', user.id)
    .eq('billable', true)
    .eq('invoiced', false)
    .order('date')

  if (error) return { data: null, error: error.message }
  return { data, error: null }
}
