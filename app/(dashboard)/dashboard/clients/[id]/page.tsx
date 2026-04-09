import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ClientDetailContent } from '@/components/clients/ClientDetailContent'
import type { Client, Project, Invoice } from '@/types'

export default async function ClientDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user!.id)
    .single()

  if (!client) notFound()

  const [projectsRes, invoicesRes] = await Promise.all([
    supabase
      .from('projects')
      .select('*')
      .eq('client_id', params.id)
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('invoices')
      .select('*, invoice_items(amount)')
      .eq('client_id', params.id)
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false }),
  ])

  return (
    <ClientDetailContent
      client={client as Client}
      projects={(projectsRes.data ?? []) as Project[]}
      invoices={(invoicesRes.data ?? []) as Invoice[]}
    />
  )
}
