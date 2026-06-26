import { createClient } from '@/lib/supabase/server'
import { ClientTable } from '@/components/clients/ClientTable'
import type { Client } from '@/types'

export default async function ClientsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const clients = (data ?? []) as Client[]

  return (
    <div className="-m-4 lg:-m-6 min-h-full bg-[#3E3E3E] p-4 lg:p-6">
      <ClientTable clients={clients} />
    </div>
  )
}
