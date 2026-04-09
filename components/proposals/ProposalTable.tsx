'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { deleteProposalAction } from '@/lib/actions/proposals'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { Plus, MoreHorizontal, Pencil, Trash2, Eye, FileText, Copy } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import type { Proposal } from '@/types'

interface ProposalTableProps {
  proposals: Proposal[]
}

export function ProposalTable({ proposals }: ProposalTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { toast } = useToast()

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    const result = await deleteProposalAction(deleteId)
    setDeleting(false)
    setDeleteId(null)
    if (result.error) toast({ title: 'Error', description: result.error, variant: 'destructive' })
    else toast({ title: 'Proposal deleted' })
  }

  function copyLink(slug: string | null) {
    if (!slug) { toast({ title: 'No link generated yet', variant: 'destructive' }); return }
    const url = `${window.location.origin}/share/proposal/${slug}`
    navigator.clipboard.writeText(url)
    toast({ title: 'Link copied to clipboard' })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button asChild>
          <Link href="/dashboard/proposals/new">
            <Plus className="mr-2 h-4 w-4" />
            New Proposal
          </Link>
        </Button>
      </div>

      {proposals.length === 0 ? (
        <EmptyState icon={FileText} title="No proposals yet" description="Create your first proposal to send to clients.">
          <Button asChild><Link href="/dashboard/proposals/new"><Plus className="mr-2 h-4 w-4" />Create Proposal</Link></Button>
        </EmptyState>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Valid Until</TableHead>
                <TableHead className="hidden sm:table-cell text-right">Amount</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {proposals.map((proposal) => (
                <TableRow key={proposal.id}>
                  <TableCell>
                    <Link href={`/dashboard/proposals/${proposal.id}`} className="font-medium hover:underline">{proposal.title}</Link>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{proposal.client?.name ?? '—'}</TableCell>
                  <TableCell><StatusBadge status={proposal.status} /></TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">{formatDate(proposal.valid_until)}</TableCell>
                  <TableCell className="hidden sm:table-cell text-right">{proposal.total_amount ? formatCurrency(proposal.total_amount) : '—'}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Open menu</span></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild><Link href={`/dashboard/proposals/${proposal.id}`}><Pencil className="mr-2 h-4 w-4" />Edit</Link></DropdownMenuItem>
                        <DropdownMenuItem onClick={() => copyLink(proposal.slug)}><Copy className="mr-2 h-4 w-4" />Copy Link</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(proposal.id)}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)} title="Delete proposal" description="This will permanently delete this proposal." onConfirm={handleDelete} loading={deleting} />
    </div>
  )
}
