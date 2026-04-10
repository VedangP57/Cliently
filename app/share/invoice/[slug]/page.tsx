import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatCurrency, formatDate } from '@/lib/utils'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Separator } from '@/components/ui/separator'

export default async function SharedInvoicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: invoice } = await supabase
    .from('invoices')
    .select('*, client:clients(name, email, address), invoice_items(*), profile:profiles(full_name, company_name, address, payment_terms, invoice_notes)')
    .eq('slug', slug)
    .single()

  if (!invoice) notFound()

  const items = (invoice.invoice_items ?? []) as { id: string; description: string; quantity: number; rate: number; amount: number; type: string }[]
  const profile = invoice.profile as { full_name: string | null; company_name: string | null; address: string | null; payment_terms: string | null; invoice_notes: string | null } | null
  const client = invoice.client as { name: string; email: string | null; address: string | null } | null

  const subtotal = items.reduce((s, i) => s + i.amount, 0)
  const taxAmount = subtotal * ((invoice.tax_rate ?? 0) / 100)
  const total = subtotal + taxAmount - (invoice.discount ?? 0)

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-lg border bg-card p-8 shadow-sm">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-bold">{profile?.company_name ?? profile?.full_name ?? 'Invoice'}</h1>
              {profile?.address && <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{profile.address}</p>}
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold">INVOICE</h2>
              <p className="text-sm text-muted-foreground">{invoice.invoice_number}</p>
              <StatusBadge status={invoice.status} className="mt-2" />
            </div>
          </div>

          {/* Client + Dates */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Bill To</p>
              <p className="font-medium">{client?.name ?? '—'}</p>
              {client?.email && <p className="text-sm text-muted-foreground">{client.email}</p>}
              {client?.address && <p className="text-sm text-muted-foreground whitespace-pre-line">{client.address}</p>}
            </div>
            <div className="text-right">
              <div className="space-y-1 text-sm">
                <div><span className="text-muted-foreground">Issue Date:</span> {formatDate(invoice.issue_date)}</div>
                <div><span className="text-muted-foreground">Due Date:</span> {formatDate(invoice.due_date)}</div>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="rounded border overflow-hidden mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-3 font-medium">Description</th>
                  <th className="text-right p-3 font-medium w-20">Qty</th>
                  <th className="text-right p-3 font-medium w-24">Rate</th>
                  <th className="text-right p-3 font-medium w-24">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="p-3">{item.description}</td>
                    <td className="p-3 text-right">{item.quantity}</td>
                    <td className="p-3 text-right">{formatCurrency(item.rate)}</td>
                    <td className="p-3 text-right">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
              {(invoice.tax_rate ?? 0) > 0 && (
                <div className="flex justify-between"><span className="text-muted-foreground">Tax ({invoice.tax_rate}%)</span><span>{formatCurrency(taxAmount)}</span></div>
              )}
              {(invoice.discount ?? 0) > 0 && (
                <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span>-{formatCurrency(invoice.discount)}</span></div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-base"><span>Total</span><span>{formatCurrency(total)}</span></div>
            </div>
          </div>

          {/* Notes */}
          {(invoice.notes || profile?.payment_terms || profile?.invoice_notes) && (
            <div className="border-t pt-6 space-y-2 text-sm text-muted-foreground">
              {profile?.payment_terms && <p><span className="font-medium text-foreground">Payment Terms:</span> {profile.payment_terms}</p>}
              {invoice.notes && <p>{invoice.notes}</p>}
              {profile?.invoice_notes && <p>{profile.invoice_notes}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
