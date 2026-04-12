import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notFound, redirect } from 'next/navigation'
import InvoiceBuilder from '@/components/invoices/InvoiceBuilder'
import { PageHeader } from '@/components/shared/PageHeader'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { ensureProfile } from '@/lib/actions/ensure-profile'
import { generateSlug } from '@/lib/utils'
import type { Invoice, Client, Project } from '@/types'

export default async function InvoiceBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  if (id === 'new') {
    await ensureProfile(user)
    const now = new Date()
    const ts = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`
    const invoiceNumber = `INV-${ts}`

    const { data: created, error: createError } = await supabase
      .from('invoices')
      .insert({
        user_id: user.id,
        status: 'draft',
        tax_rate: 0,
        discount: 0,
        invoice_number: invoiceNumber,
        issue_date: null,
        due_date: null,
        notes: null,
        slug: generateSlug('invoice'),
      })
      .select('id')
      .single()

    if (createError) {
      console.error('Invoice create error:', createError.message)
    }

    if (created?.id) redirect(`/dashboard/invoices/${created.id}`)
    notFound()
  }

  const [invoiceRes, clientsRes, projectsRes] = await Promise.all([
    supabase.from('invoices').select('*, invoice_items(*)').eq('id', id).eq('user_id', user.id).single(),
    supabase.from('clients').select('*').eq('user_id', user.id).order('name'),
    supabase.from('projects').select('*').eq('user_id', user.id).order('title'),
  ])

  if (!invoiceRes.data) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/invoices"><ArrowLeft className="h-4 w-4" /><span className="sr-only">Back</span></Link>
        </Button>
        <PageHeader title={invoiceRes.data.invoice_number || 'New Invoice'} />
      </div>
      <InvoiceBuilder
        invoice={invoiceRes.data as Invoice}
        clients={(clientsRes.data ?? []) as Client[]}
        projects={(projectsRes.data ?? []) as Project[]}
      />
    </div>
  )
}
