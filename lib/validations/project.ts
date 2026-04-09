import { z } from 'zod'

export const projectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  client_id: z.string().uuid().optional().or(z.literal('')),
  description: z.string().max(5000).optional().or(z.literal('')),
  status: z
    .enum(['planning', 'in_progress', 'review', 'completed', 'on_hold', 'cancelled'])
    .default('planning'),
  deadline: z.string().optional().or(z.literal('')),
  budget: z.coerce.number().min(0).optional().or(z.literal(0)),
  notes: z.string().max(2000).optional().or(z.literal('')),
})

export type ProjectFormValues = z.infer<typeof projectSchema>
