'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { deleteInvoiceAction } from '@/lib/actions/invoices'
import { formatCurrency, formatDate, isOverdue } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { Plus, MoreHorizontal, Pencil, Trash2, Copy, FileSpreadsheet } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import type { Invoice } from '@/types'

interface InvoiceTableProps {
  invoices: Invoice[]
}

export function InvoiceTable({ invoices }: InvoiceTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { toast } = useToast()

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    const result = await deleteInvoiceAction(deleteId)
    setDeleting(false)
    setDeleteId(null)
    if (result.error) toast({ title: 'Error', description: result.error, variant: 'destructive' })
    else toast({ title: 'Invoice deleted' })
  }

  function copyLink(slug: string | null) {
    if (!slug) { toast({ title: 'No link available', variant: 'destructive' }); return }
    navigator.clipboard.writeText(`${window.location.origin}/share/invoice/${slug}`)
    toast({ title: 'Link copied' })
  }

  function getDisplayStatus(invoice: Invoice) {
    if (isOverdue(invoice.due_date, invoice.status) && invoice.status === 'sent') return 'overdue'
    return invoice.status
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button asChild>
          <Link href="/dashboard/invoices/new"><Plus className="mr-2 h-4 w-4" />New Invoice</Link>
        </Button>
      </div>

      {invoices.length === 0 ? (
        <EmptyState icon={FileSpreadsheet} title="No invoices yet" description="Create your first invoice to get paid.">
          <Button asChild><Link href="/dashboard/invoices/new"><Plus className="mr-2 h-4 w-4" />Create Invoice</Link></Button>
        </EmptyState>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead className="hidden md:table-cell">Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Issue Date</TableHead>
                <TableHead className="hidden sm:table-cell">Due Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => {
                const amount = (invoice.invoice_items ?? []).reduce((s, item) => s + item.amount, 0)
                const displayStatus = getDisplayStatus(invoice)
                return (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <Link href={`/dashboard/invoices/${invoice.id}`} className="font-medium hover:underline text-[#5e5cc5] dark:text-[#a5a3e0]!">{invoice.invoice_number ?? '—'}</Link>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{invoice.client?.name ?? '—'}</TableCell>
                    <TableCell><StatusBadge status={displayStatus} /></TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">{formatDate(invoice.issue_date)}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">{formatDate(invoice.due_date)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(amount)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Menu</span></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild><Link href={`/dashboard/invoices/${invoice.id}`}><Pencil className="mr-2 h-4 w-4" />Edit</Link></DropdownMenuItem>
                          <DropdownMenuItem onClick={() => copyLink(invoice.slug)}><Copy className="mr-2 h-4 w-4" />Copy Link</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(invoice.id)}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)} title="Delete invoice" description="This will permanently delete this invoice." onConfirm={handleDelete} loading={deleting} />
    </div>
  )
}
