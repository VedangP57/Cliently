import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatCurrency, formatDate } from '@/lib/utils'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { AcceptProposalButton } from '@/components/proposals/AcceptProposalButton'

export default async function SharedProposalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: proposal } = await supabase
    .from('proposals')
    .select('*, client:clients(name), profile:profiles(full_name, company_name)')
    .eq('slug', slug)
    .single()

  if (!proposal) notFound()

  const profile = proposal.profile as { full_name: string | null; company_name: string | null } | null

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-8">
          {profile?.company_name && (
            <p className="text-sm font-medium text-muted-foreground mb-1">{profile.company_name}</p>
          )}
          <h1 className="text-3xl font-bold">{proposal.title}</h1>
          <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
            <StatusBadge status={proposal.status} />
            {proposal.valid_until && <span>Valid until {formatDate(proposal.valid_until)}</span>}
            {proposal.total_amount && <span>{formatCurrency(proposal.total_amount)}</span>}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-8">
          <div
            className="prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: proposal.content ?? '<p>No content yet.</p>' }}
          />
        </div>

        {proposal.status === 'sent' && (
          <div className="mt-8 rounded-lg border bg-card p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Accept this proposal?</h3>
            <p className="text-sm text-muted-foreground mb-4">Click below to accept the terms of this proposal.</p>
            <AcceptProposalButton slug={slug} />
          </div>
        )}

        {proposal.status === 'accepted' && (
          <div className="mt-8 rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950 p-6 text-center">
            <p className="text-sm font-medium text-green-800 dark:text-green-200">This proposal has been accepted.</p>
          </div>
        )}
      </div>
    </div>
  )
}
