import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { ContractEditor } from '@/components/contracts/ContractEditor'
import { PageHeader } from '@/components/shared/PageHeader'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { ensureProfile } from '@/lib/actions/ensure-profile'
import { generateSlug } from '@/lib/utils'
import type { Contract, Client, Project } from '@/types'

export default async function ContractEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Handle "new" route
  if (id === 'new') {
    await ensureProfile(user)
    const title = 'Untitled Contract'
    const { data: created } = await supabase
      .from('contracts')
      .insert({
        title,
        status: 'draft',
        content: '',
        slug: generateSlug(title),
        user_id: user.id,
      })
      .select('id')
      .single()

    if (created?.id) redirect(`/dashboard/contracts/${created.id}`)
    notFound()
  }

  const [contractRes, clientsRes, projectsRes] = await Promise.all([
    supabase.from('contracts').select('*').eq('id', id).eq('user_id', user.id).single(),
    supabase.from('clients').select('*').eq('user_id', user.id).order('name'),
    supabase.from('projects').select('*').eq('user_id', user.id).order('title'),
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
