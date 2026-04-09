import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { ProposalEditor } from '@/components/proposals/ProposalEditor'
import { PageHeader } from '@/components/shared/PageHeader'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { ensureProfile } from '@/lib/actions/ensure-profile'
import { generateSlug } from '@/lib/utils'
import type { Proposal, Client } from '@/types'

export default async function ProposalEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Handle "new" route
  if (id === 'new') {
    await ensureProfile(user)
    const title = 'Untitled Proposal'
    const { data: created } = await supabase
      .from('proposals')
      .insert({
        title,
        status: 'draft',
        content: '',
        total_amount: 0,
        slug: generateSlug(title),
        user_id: user.id,
      })
      .select('id')
      .single()

    if (created?.id) redirect(`/dashboard/proposals/${created.id}`)
    notFound()
  }

  const [proposalRes, clientsRes] = await Promise.all([
    supabase.from('proposals').select('*').eq('id', id).eq('user_id', user.id).single(),
    supabase.from('clients').select('*').eq('user_id', user.id).order('name'),
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
