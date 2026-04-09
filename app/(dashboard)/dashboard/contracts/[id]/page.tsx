import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { createContractAction } from '@/lib/actions/contracts'
import { ContractEditor } from '@/components/contracts/ContractEditor'
import { PageHeader } from '@/components/shared/PageHeader'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import type { Contract, Client, Project } from '@/types'

export default async function ContractEditorPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Handle "new" route
  if (params.id === 'new') {
    const result = await createContractAction({ title: 'Untitled Contract', status: 'draft' })
    if (result.data) redirect(`/dashboard/contracts/${result.data.id}`)
    notFound()
  }

  const [contractRes, clientsRes, projectsRes] = await Promise.all([
    supabase.from('contracts').select('*').eq('id', params.id).eq('user_id', user!.id).single(),
    supabase.from('clients').select('*').eq('user_id', user!.id).order('name'),
    supabase.from('projects').select('*').eq('user_id', user!.id).order('title'),
  ])

  if (!contractRes.data) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/contracts">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <PageHeader title={contractRes.data.title} />
      </div>
      <ContractEditor
        contract={contractRes.data as Contract}
        clients={(clientsRes.data ?? []) as Client[]}
        projects={(projectsRes.data ?? []) as Project[]}
      />
    </div>
  )
}
