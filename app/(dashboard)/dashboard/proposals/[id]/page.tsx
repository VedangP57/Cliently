import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { createProposalAction } from '@/lib/actions/proposals'
import { ProposalEditor } from '@/components/proposals/ProposalEditor'
import { PageHeader } from '@/components/shared/PageHeader'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import type { Proposal, Client } from '@/types'

export default async function ProposalEditorPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Handle "new" route
  if (params.id === 'new') {
    const result = await createProposalAction({ title: 'Untitled Proposal', status: 'draft', content: '', total_amount: 0 })
    if (result.data) redirect(`/dashboard/proposals/${result.data.id}`)
    notFound()
  }

  const [proposalRes, clientsRes] = await Promise.all([
    supabase.from('proposals').select('*').eq('id', params.id).eq('user_id', user!.id).single(),
    supabase.from('clients').select('*').eq('user_id', user!.id).order('name'),
  ])

  if (!proposalRes.data) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/proposals"><ArrowLeft className="h-4 w-4" /><span className="sr-only">Back</span></Link>
        </Button>
        <PageHeader title={proposalRes.data.title} />
      </div>
      <ProposalEditor proposal={proposalRes.data as Proposal} clients={(clientsRes.data ?? []) as Client[]} />
    </div>
  )
}
