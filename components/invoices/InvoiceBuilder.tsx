'use client'

import { useState, useCallback, useEffect, useMemo, useTransition } from 'react'
import { Plus, Trash2, Clock, Receipt, Copy, Save, Send, CheckCircle, Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useToast } from '@/hooks/use-toast'
import { cn, formatCurrency, SELECT_NONE, toSelectValue, fromSelectValue } from '@/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { updateInvoiceAction } from '@/lib/actions/invoices'
import {
  upsertInvoiceItemsAction,
  getUninvoicedTimeLogsAction,
  getUninvoicedExpensesAction,
} from '@/lib/actions/invoice-items'
import type { Invoice, Client, Project } from '@/types'
import type { InvoiceItemFormValues } from '@/lib/validations/invoice'

interface InvoiceBuilderProps {
  invoice: Invoice
  clients: Client[]
  projects: Project[]
}

const EMPTY_ITEM: InvoiceItemFormValues = {
  description: '',
  quantity: 1,
  rate: 0,
  amount: 0,
  type: 'service',
}

function AiDescriptionAssist({
  onUse,
  projectTitle,
  clientName,
}: {
  onUse: (description: string) => void
  projectTitle?: string
  clientName?: string
}) {
  const [open, setOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function generate() {
    if (!prompt.trim()) return
    setLoading(true)
    setError('')
    setResult('')
    try {
      const res = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim(), projectTitle, clientName }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to generate')
      } else {
        setResult(data.description)
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-10 shrink-0 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
          title="AI Assist — Generate professional description"
        >
          <Sparkles className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-sm font-medium">AI Description Generator</p>
            <p className="text-xs text-muted-foreground">
              Describe the work briefly and AI will write a professional description.
            </p>
          </div>
          <Textarea
            placeholder="e.g. designed homepage for 3 days"
            rows={2}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                generate()
              }
            }}
          />
          <Button
            type="button"
            size="sm"
            className="w-full"
            onClick={generate}
            disabled={loading || !prompt.trim()}
          >
            {loading ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Sparkles className="mr-1 h-3.5 w-3.5" />}
            Generate
          </Button>
          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
          {result && (
            <div className="space-y-2">
              <div className="rounded-md bg-muted p-2.5 text-sm">{result}</div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => {
                  onUse(result)
                  setPrompt('')
                  setResult('')
                  setOpen(false)
                }}
              >
                Use this
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default function InvoiceBuilder({ invoice, clients, projects }: InvoiceBuilderProps) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const [items, setItems] = useState<InvoiceItemFormValues[]>(() => {
    if (invoice.invoice_items && invoice.invoice_items.length > 0) {
      return invoice.invoice_items.map((item) => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount,
        type: item.type,
      }))
    }
    return [{ ...EMPTY_ITEM }]
  })

  const [clientId, setClientId] = useState(invoice.client_id ?? '')
  const [projectId, setProjectId] = useState(invoice.project_id ?? '')
  const [invoiceNumber, setInvoiceNumber] = useState(invoice.invoice_number ?? '')
  const [issueDate, setIssueDate] = useState(invoice.issue_date ?? '')
  const [dueDate, setDueDate] = useState(invoice.due_date ?? '')
  const [notes, setNotes] = useState(invoice.notes ?? '')
  const [taxRate, setTaxRate] = useState(invoice.tax_rate ?? 0)
  const [discount, setDiscount] = useState(invoice.discount ?? 0)

  const projectsForClient = useMemo(() => {
    if (!clientId) return projects
    return projects.filter((p) => p.client_id === clientId)
  }, [projects, clientId])

  useEffect(() => {
    if (!clientId || !projectId) return
    const p = projects.find((x) => x.id === projectId)
    if (p && p.client_id !== clientId) setProjectId('')
  }, [clientId, projectId, projects])

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.rate, 0)
  const taxAmount = subtotal * (taxRate / 100)
  const total = subtotal + taxAmount - discount

  const updateItem = useCallback(
    (index: number, field: keyof InvoiceItemFormValues, value: string | number) => {
      setItems((prev) => {
        const updated = [...prev]
        const item = { ...updated[index] }

        if (field === 'description' || field === 'type') {
          ;(item[field] as string) = value as string
        } else if (field === 'quantity' || field === 'rate') {
          ;(item[field] as number) = Number(value) || 0
        }

        item.amount = item.quantity * item.rate
        updated[index] = item
        return updated
      })
    },
    []
  )

  const addItem = useCallback(() => {
    setItems((prev) => [...prev, { ...EMPTY_ITEM }])
  }, [])

  const removeItem = useCallback((index: number) => {
    setItems((prev) => {
      if (prev.length <= 1) return prev
      return prev.filter((_, i) => i !== index)
    })
  }, [])

  const saveInvoice = useCallback(
    async (statusOverride?: 'sent' | 'paid') => {
      startTransition(async () => {
        const invoiceData = {
          client_id: clientId || undefined,
          project_id: projectId || undefined,
          invoice_number: invoiceNumber,
          issue_date: issueDate,
          due_date: dueDate,
          notes,
          tax_rate: taxRate,
          discount,
          ...(statusOverride ? { status: statusOverride } : {}),
        }

        const { error: invoiceError } = await updateInvoiceAction(invoice.id, invoiceData)
        if (invoiceError) {
          toast({ title: 'Error', description: invoiceError, variant: 'destructive' })
          return
        }

        const validItems = items.filter((item) => item.description.trim() !== '')
        const { error: itemsError } = await upsertInvoiceItemsAction(invoice.id, validItems)
        if (itemsError) {
          toast({ title: 'Error', description: itemsError, variant: 'destructive' })
          return
        }

        const message = statusOverride
          ? `Invoice marked as ${statusOverride}`
          : 'Invoice saved successfully'
        toast({ title: 'Success', description: message })
      })
    },
    [clientId, projectId, invoiceNumber, issueDate, dueDate, notes, taxRate, discount, items, invoice.id, toast]
  )

  const addFromTimeLogs = useCallback(async () => {
    if (!projectId) {
      toast({ title: 'Select a project', description: 'Choose a project to pull time logs from.', variant: 'destructive' })
      return
    }

    startTransition(async () => {
      const { data: logs, error } = await getUninvoicedTimeLogsAction(projectId)
      if (error || !logs) {
        toast({ title: 'Error', description: error ?? 'Failed to fetch time logs', variant: 'destructive' })
        return
      }

      if (logs.length === 0) {
        toast({ title: 'No time logs', description: 'No uninvoiced billable time logs found for this project.' })
        return
      }

      const newItems: InvoiceItemFormValues[] = logs.map((log) => ({
        description: log.description || 'Time log',
        quantity: log.hours,
        rate: 50,
        amount: log.hours * 50,
        type: 'time' as const,
      }))

      setItems((prev) => {
        const hasOnlyEmpty = prev.length === 1 && prev[0].description === '' && prev[0].rate === 0
        return hasOnlyEmpty ? newItems : [...prev, ...newItems]
      })

      toast({ title: 'Time logs added', description: `${logs.length} time log(s) added as line items.` })
    })
  }, [projectId, toast])

  const addFromExpenses = useCallback(async () => {
    if (!projectId) {
      toast({ title: 'Select a project', description: 'Choose a project to pull expenses from.', variant: 'destructive' })
      return
    }

    startTransition(async () => {
      const { data: expenses, error } = await getUninvoicedExpensesAction(projectId)
      if (error || !expenses) {
        toast({ title: 'Error', description: error ?? 'Failed to fetch expenses', variant: 'destructive' })
        return
      }

      if (expenses.length === 0) {
        toast({ title: 'No expenses', description: 'No uninvoiced billable expenses found for this project.' })
        return
      }

      const newItems: InvoiceItemFormValues[] = expenses.map((expense) => ({
        description: expense.title,
        quantity: 1,
        rate: expense.amount,
        amount: expense.amount,
        type: 'expense' as const,
      }))

      setItems((prev) => {
        const hasOnlyEmpty = prev.length === 1 && prev[0].description === '' && prev[0].rate === 0
        return hasOnlyEmpty ? newItems : [...prev, ...newItems]
      })

      toast({ title: 'Expenses added', description: `${expenses.length} expense(s) added as line items.` })
    })
  }, [projectId, toast])

  const copyShareLink = useCallback(async () => {
    if (!invoice.slug) {
      toast({ title: 'No share link', description: 'Save the invoice first to generate a share link.', variant: 'destructive' })
      return
    }

    const url = `${window.location.origin}/share/invoice/${invoice.slug}`
    await navigator.clipboard.writeText(url)
    toast({ title: 'Link copied', description: 'Share link copied to clipboard.' })
  }, [invoice.slug, toast])

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* Left Column — Line Items */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Line Items</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Table header */}
            <div className="hidden md:grid md:grid-cols-[1fr_80px_96px_96px_40px_40px] gap-2 mb-2 px-1">
              <Label className="text-xs text-muted-foreground">Description</Label>
              <Label className="text-xs text-muted-foreground">Qty</Label>
              <Label className="text-xs text-muted-foreground">Rate</Label>
              <Label className="text-xs text-muted-foreground">Amount</Label>
              <span />
              <span />
            </div>

            <div className="space-y-2">
              {items.map((item, index) => (
                <div
                  key={index}
                  className={cn(
                    'grid gap-2 items-start rounded-md p-1',
                    'grid-cols-1 md:grid-cols-[1fr_80px_96px_96px_40px_40px]'
                  )}
                >
                  <div>
                    <Label className="text-xs text-muted-foreground md:hidden">Description</Label>
                    <Input
                      placeholder="Item description"
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground md:hidden">Qty</Label>
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      className="w-full md:w-20"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground md:hidden">Rate</Label>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      className="w-full md:w-24"
                      value={item.rate}
                      onChange={(e) => updateItem(index, 'rate', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground md:hidden">Amount</Label>
                    <Input
                      readOnly
                      className="w-full md:w-24 bg-muted"
                      value={formatCurrency(item.quantity * item.rate)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-muted-foreground hover:text-destructive"
                    onClick={() => removeItem(index)}
                    disabled={items.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <AiDescriptionAssist
                    onUse={(desc) => updateItem(index, 'description', desc)}
                    projectTitle={projects.find((p) => p.id === projectId)?.title}
                    clientName={clients.find((c) => c.id === clientId)?.name}
                  />
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="mr-1 h-4 w-4" />
                Add Line Item
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addFromTimeLogs}
                disabled={isPending}
              >
                <Clock className="mr-1 h-4 w-4" />
                Add from Time Logs
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addFromExpenses}
                disabled={isPending}
              >
                <Receipt className="mr-1 h-4 w-4" />
                Add from Expenses
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Totals */}
        <Card>
          <CardContent className="pt-6">
            <div className="ml-auto w-full max-w-xs space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <Label htmlFor="taxRate" className="text-muted-foreground whitespace-nowrap">
                  Tax (%)
                </Label>
                <Input
                  id="taxRate"
                  type="number"
                  min={0}
                  step={0.01}
                  className="w-24 text-right"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tax Amount</span>
                <span className="font-medium">{formatCurrency(taxAmount)}</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <Label htmlFor="discount" className="text-muted-foreground whitespace-nowrap">
                  Discount ($)
                </Label>
                <Input
                  id="discount"
                  type="number"
                  min={0}
                  step={0.01}
                  className="w-24 text-right"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between text-base font-semibold">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column — Sidebar */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Client</Label>
              <Select
                value={toSelectValue(clientId)}
                onValueChange={(v) => {
                  const nextClientId = fromSelectValue(v)
                  setClientId(nextClientId)
                  setProjectId((currentProjectId) => {
                    if (!nextClientId) return currentProjectId
                    const p = projects.find((x) => x.id === currentProjectId)
                    if (!p || p.client_id !== nextClientId) return ''
                    return currentProjectId
                  })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SELECT_NONE}>No client</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Project</Label>
              <Select
                value={toSelectValue(projectId)}
                onValueChange={(v) => setProjectId(fromSelectValue(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SELECT_NONE}>No project</SelectItem>
                  {projectsForClient.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Invoice #</Label>
              <Input
                id="invoiceNumber"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="issueDate">Issue Date</Label>
              <Input
                id="issueDate"
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Payment instructions, thank you note..."
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <div>
                <StatusBadge status={invoice.status} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-2">
            <Button
              className="w-full"
              onClick={() => saveInvoice()}
              disabled={isPending}
            >
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => saveInvoice('sent')}
              disabled={isPending}
            >
              <Send className="mr-2 h-4 w-4" />
              Mark as Sent
            </Button>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => saveInvoice('paid')}
              disabled={isPending}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark as Paid
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
