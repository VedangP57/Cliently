import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/PageHeader'
import { ProposalTable } from '@/components/proposals/ProposalTable'
import type { Proposal } from '@/types'

export default async function ProposalsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('proposals')
    .select('*, client:clients(name)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const proposals = (data ?? []).map((p) => ({
    ...p,
    client: p.client as { name: string } | null ? { name: (p.client as { name: string })?.name } : undefined,
  })) as Proposal[]

  return (
    <div className="space-y-6">
      <PageHeader title="Proposals" description={`${proposals.length} proposals`} />
      <ProposalTable proposals={proposals} />
    </div>
  )
}
