import { createClient } from '@/lib/supabase/server'

import { InvoiceTable } from '@/components/invoices/InvoiceTable'
import type { Invoice } from '@/types'

export default async function InvoicesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('invoices')
    .select('*, client:clients(name), invoice_items(amount)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const invoices = (data ?? []).map((inv) => ({
    ...inv,
    client: inv.client as { name: string } | null ? { name: (inv.client as { name: string })?.name } : undefined,
  })) as Invoice[]

  return <InvoiceTable invoices={invoices} />
}
