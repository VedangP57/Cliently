import { z } from 'zod'

export const timeLogSchema = z.object({
  project_id: z
    .string()
    .uuid('Invalid project')
    .or(z.literal(''))
    .default(''),
  task_id: z
    .string()
    .uuid('Invalid task')
    .or(z.literal(''))
    .default(''),
  description: z.string().max(1000).default(''),
  hours: z.coerce.number().positive('Hours must be greater than 0'),
  date: z.string().min(1, 'Date is required'),
  billable: z.boolean().default(true),
})

export type TimeLogFormValues = z.infer<typeof timeLogSchema>
