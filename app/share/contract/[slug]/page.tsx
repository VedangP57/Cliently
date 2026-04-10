import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { SignContractWidget } from '@/components/contracts/SignContractWidget'

export default async function SharedContractPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: contract } = await supabase
    .from('contracts')
    .select('*, client:clients(name), profile:profiles(full_name, company_name)')
    .eq('slug', slug)
    .single()

  if (!contract) notFound()

  const profile = contract.profile as { full_name: string | null; company_name: string | null } | null

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-8">
          {profile?.company_name && (
            <p className="text-sm font-medium text-muted-foreground mb-1">{profile.company_name}</p>
          )}
          <h1 className="text-3xl font-bold">{contract.title}</h1>
          <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
            <StatusBadge status={contract.status} />
            {(contract.client as { name: string } | null)?.name && (
              <span>{(contract.client as { name: string }).name}</span>
            )}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-8">
          <div
            className="prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: contract.content ?? '<p>No content yet.</p>' }}
          />
        </div>

        {contract.status === 'sent' && (
          <div className="mt-8 rounded-lg border bg-card p-6">
            <SignContractWidget slug={slug} />
          </div>
        )}

        {contract.status === 'signed' && (
          <div className="mt-8 rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950 p-6 text-center">
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              Signed by {contract.signed_name} on {formatDate(contract.signed_at)}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
