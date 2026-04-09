'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ClientModal } from '@/components/clients/ClientModal'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { deleteClientAction } from '@/lib/actions/clients'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Building2,
  FolderKanban,
  FileSpreadsheet,
  DollarSign,
  AlertCircle,
} from 'lucide-react'
import type { Client, Project, Invoice } from '@/types'

interface ClientDetailContentProps {
  client: Client
  projects: Project[]
  invoices: Invoice[]
}

export function ClientDetailContent({
  client,
  projects,
  invoices,
}: ClientDetailContentProps) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const { toast } = useToast()

  const totalInvoiced = invoices.reduce((sum, inv) => {
    const items = (inv.invoice_items ?? []) as { amount: number }[]
    return sum + items.reduce((s, item) => s + item.amount, 0)
  }, 0)

  const totalPaid = invoices
    .filter((i) => i.status === 'paid')
    .reduce((sum, inv) => {
      const items = (inv.invoice_items ?? []) as { amount: number }[]
      return sum + items.reduce((s, item) => s + item.amount, 0)
    }, 0)

  const outstanding = totalInvoiced - totalPaid

  async function handleDelete() {
    setDeleting(true)
    const result = await deleteClientAction(client.id)
    setDeleting(false)
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
    } else {
      toast({ title: 'Client deleted' })
      router.push('/dashboard/clients')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/clients">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to clients</span>
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{client.name}</h1>
            <StatusBadge status={client.status} />
          </div>
          {client.company && (
            <p className="text-sm text-muted-foreground">{client.company}</p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </div>

      {/* Contact Info + Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 space-y-2">
            {client.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate">{client.email}</span>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                {client.phone}
              </div>
            )}
            {client.website && (
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate">{client.website}</span>
              </div>
            )}
            {client.address && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate">{client.address}</span>
              </div>
            )}
            {!client.email && !client.phone && !client.website && !client.address && (
              <p className="text-sm text-muted-foreground">No contact info</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <FolderKanban className="h-4 w-4" />
              Projects
            </div>
            <p className="text-2xl font-bold">{projects.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4" />
              Total Paid
            </div>
            <p className="text-2xl font-bold">{formatCurrency(totalPaid)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <AlertCircle className="h-4 w-4" />
              Outstanding
            </div>
            <p className="text-2xl font-bold">{formatCurrency(outstanding)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="projects">
        <TabsList>
          <TabsTrigger value="projects">Projects ({projects.length})</TabsTrigger>
          <TabsTrigger value="invoices">Invoices ({invoices.length})</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="mt-4">
          {projects.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No projects yet for this client.
            </p>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Deadline</TableHead>
                    <TableHead className="hidden sm:table-cell text-right">Budget</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell>
                        <Link
                          href={`/dashboard/projects/${project.id}`}
                          className="font-medium hover:underline"
                        >
                          {project.title}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={project.status} />
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {formatDate(project.deadline)}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-right">
                        {project.budget ? formatCurrency(project.budget) : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="invoices" className="mt-4">
          {invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No invoices yet for this client.
            </p>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Issue Date</TableHead>
                    <TableHead className="hidden sm:table-cell">Due Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => {
                    const amount = (invoice.invoice_items ?? []).reduce(
                      (s: number, item: { amount: number }) => s + item.amount,
                      0
                    )
                    return (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <Link
                            href={`/dashboard/invoices/${invoice.id}`}
                            className="font-medium hover:underline"
                          >
                            {invoice.invoice_number ?? '—'}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={invoice.status} />
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground">
                          {formatDate(invoice.issue_date)}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground">
                          {formatDate(invoice.due_date)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(amount)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="notes" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {client.notes || 'No notes added.'}
              </p>
              {client.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {client.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ClientModal
        open={editOpen}
        onOpenChange={setEditOpen}
        client={client}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete client"
        description={`This will permanently delete "${client.name}" and cannot be undone.`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
