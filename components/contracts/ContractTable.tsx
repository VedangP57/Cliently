'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { deleteContractAction } from '@/lib/actions/contracts'
import { formatDate } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { Plus, MoreHorizontal, Pencil, Trash2, Copy, FileSignature } from 'lucide-react'
import type { Contract } from '@/types'

interface ContractTableProps {
  contracts: Contract[]
}

export function ContractTable({ contracts }: ContractTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { toast } = useToast()

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    const result = await deleteContractAction(deleteId)
    setDeleting(false)
    setDeleteId(null)
    if (result.error) toast({ title: 'Error', description: result.error, variant: 'destructive' })
    else toast({ title: 'Contract deleted' })
  }

  function copyLink(slug: string | null) {
    if (!slug) {
      toast({ title: 'No link generated yet', variant: 'destructive' })
      return
    }
    const url = `${window.location.origin}/share/contract/${slug}`
    navigator.clipboard.writeText(url)
    toast({ title: 'Link copied to clipboard' })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button asChild>
          <Link href="/dashboard/contracts/new">
            <Plus className="mr-2 h-4 w-4" />
            New Contract
          </Link>
        </Button>
      </div>

      {contracts.length === 0 ? (
        <EmptyState
          icon={FileSignature}
          title="No contracts yet"
          description="Create your first contract to send to clients."
        >
          <Button asChild>
            <Link href="/dashboard/contracts/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Contract
            </Link>
          </Button>
        </EmptyState>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Client</TableHead>
                <TableHead className="hidden md:table-cell">Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Created</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell>
                    <Link
                      href={`/dashboard/contracts/${contract.id}`}
                      className="font-medium hover:underline"
                    >
                      {contract.title}
                    </Link>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {contract.client?.name ?? '—'}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {contract.project?.title ?? '—'}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={contract.status} />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {formatDate(contract.created_at)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/contracts/${contract.id}`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => copyLink(contract.slug)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Link
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteId(contract.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete contract"
        description="This will permanently delete this contract."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
