'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ExpenseModal } from '@/components/expenses/ExpenseModal'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { deleteExpenseAction } from '@/lib/actions/expenses'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Receipt,
  ExternalLink,
} from 'lucide-react'
import type { Expense, Project } from '@/types'

interface ExpenseTableProps {
  expenses: Expense[]
  projects: Project[]
}

export function ExpenseTable({ expenses, projects }: ExpenseTableProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [projectFilter, setProjectFilter] = useState<string>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { toast } = useToast()

  const filtered = expenses.filter((e) => {
    const matchesCategory =
      categoryFilter === 'all' || e.category === categoryFilter
    const matchesProject =
      projectFilter === 'all' || e.project_id === projectFilter
    return matchesCategory && matchesProject
  })

  const totalAmount = filtered.reduce((sum, e) => sum + e.amount, 0)

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    const result = await deleteExpenseAction(deleteId)
    setDeleting(false)
    setDeleteId(null)
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
    } else {
      toast({ title: 'Expense deleted' })
    }
  }

  function openEdit(expense: Expense) {
    setEditingExpense(expense)
    setModalOpen(true)
  }

  function openCreate() {
    setEditingExpense(null)
    setModalOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 flex-1">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="software">Software</SelectItem>
              <SelectItem value="hardware">Hardware</SelectItem>
              <SelectItem value="travel">Travel</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="meals">Meals</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Expense
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No expenses found"
          description={
            expenses.length === 0
              ? 'Get started by adding your first expense.'
              : 'Try adjusting your filters.'
          }
        >
          {expenses.length === 0 && (
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          )}
        </EmptyState>
      ) : (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="hidden md:table-cell">Project</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Billable</TableHead>
                  <TableHead className="hidden sm:table-cell">Receipt</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(expense.date)}
                    </TableCell>
                    <TableCell className="font-medium">{expense.title}</TableCell>
                    <TableCell>
                      <StatusBadge status={expense.category} />
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {expense.project?.title ?? '—'}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(expense.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={expense.billable ? 'default' : 'secondary'}>
                        {expense.billable ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {expense.receipt_url ? (
                        <a
                          href={expense.receipt_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline dark:text-blue-400"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
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
                          <DropdownMenuItem onClick={() => openEdit(expense)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteId(expense.id)}
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

          <div className="flex justify-end">
            <div className="rounded-lg border bg-muted/50 px-4 py-2 text-sm">
              <span className="text-muted-foreground">Total: </span>
              <span className="font-semibold">{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </>
      )}

      <ExpenseModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open)
          if (!open) setEditingExpense(null)
        }}
        expense={editingExpense}
        projects={projects}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete expense"
        description="This will permanently delete this expense and cannot be undone."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
