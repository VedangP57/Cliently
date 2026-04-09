import { z } from 'zod'

export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  project_id: z.string().uuid().optional().or(z.literal('')),
  description: z.string().max(5000).optional().or(z.literal('')),
  status: z.enum(['todo', 'in_progress', 'in_review', 'done']).default('todo'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  due_date: z.string().optional().or(z.literal('')),
})

export type TaskFormValues = z.infer<typeof taskSchema>
