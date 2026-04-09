import { z } from 'zod'

export const proposalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  client_id: z.string().uuid().optional().or(z.literal('')),
  content: z.string().optional().default(''),
  status: z.enum(['draft', 'sent', 'accepted', 'rejected', 'expired']).default('draft'),
  valid_until: z.string().optional().or(z.literal('')),
  total_amount: z.coerce.number().min(0).optional().default(0),
})

export type ProposalFormValues = z.infer<typeof proposalSchema>
