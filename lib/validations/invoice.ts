import { z } from 'zod'

export const invoiceSchema = z.object({
  client_id: z.string().uuid().optional().or(z.literal('')),
  project_id: z.string().uuid().optional().or(z.literal('')),
  invoice_number: z.string().optional().default(''),
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).default('draft'),
  issue_date: z.string().optional().default(''),
  due_date: z.string().optional().default(''),
  tax_rate: z.coerce.number().min(0).default(0),
  discount: z.coerce.number().min(0).default(0),
  notes: z.string().optional().default(''),
})

export type InvoiceFormValues = z.infer<typeof invoiceSchema>

export const invoiceItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, 'Description required'),
  quantity: z.coerce.number().min(0).default(1),
  rate: z.coerce.number().min(0),
  amount: z.coerce.number().min(0),
  type: z.enum(['service', 'time', 'expense']).default('service'),
})

export type InvoiceItemFormValues = z.infer<typeof invoiceItemSchema>
