import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { createInvoiceAction } from '@/lib/actions/invoices'
import InvoiceBuilder from '@/components/invoices/InvoiceBuilder'
import { PageHeader } from '@/components/shared/PageHeader'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import type { Invoice, Client, Project } from '@/types'

export default async function InvoiceBuilderPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (params.id === 'new') {
    const result = await createInvoiceAction({ status: 'draft', tax_rate: 0, discount: 0, invoice_number: '', issue_date: '', due_date: '', notes: '' })
    if (result.data) redirect(`/dashboard/invoices/${result.data.id}`)
    notFound()
  }

  const [invoiceRes, clientsRes, projectsRes] = await Promise.all([
    supabase.from('invoices').select('*, invoice_items(*)').eq('id', params.id).eq('user_id', user!.id).single(),
    supabase.from('clients').select('*').eq('user_id', user!.id).order('name'),
    supabase.from('projects').select('*').eq('user_id', user!.id).order('title'),
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
