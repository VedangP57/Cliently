import { z } from 'zod'

export const contractSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  client_id: z.string().uuid().optional().or(z.literal('')),
  project_id: z.string().uuid().optional().or(z.literal('')),
  content: z.string().optional().default(''),
  status: z.enum(['draft', 'sent', 'signed', 'expired']).default('draft'),
})

export type ContractFormValues = z.input<typeof contractSchema>
