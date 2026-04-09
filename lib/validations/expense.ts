import { z } from 'zod'

export const expenseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  category: z
    .enum(['software', 'hardware', 'travel', 'marketing', 'meals', 'other'])
    .default('other'),
  project_id: z.string().uuid().or(z.literal('')).default(''),
  date: z.string().min(1, 'Date is required'),
  billable: z.boolean().default(true),
  receipt_url: z.string().url('Invalid URL').or(z.literal('')).default(''),
})

export type ExpenseFormValues = z.infer<typeof expenseSchema>
