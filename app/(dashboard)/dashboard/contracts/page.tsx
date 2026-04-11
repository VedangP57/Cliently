import { createClient } from '@/lib/supabase/server'

import { ContractTable } from '@/components/contracts/ContractTable'
import type { Contract } from '@/types'

export default async function ContractsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('contracts')
    .select('*, client:clients(name), project:projects(title)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const contracts = (data ?? []).map((c) => ({
    ...c,
    client: c.client as { name: string } | null ? { name: (c.client as { name: string })?.name } : undefined,
    project: c.project as { title: string } | null ? { title: (c.project as { title: string })?.title } : undefined,
  })) as Contract[]

  return <ContractTable contracts={contracts} />
}
