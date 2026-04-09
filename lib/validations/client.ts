import { z } from 'zod'

export const clientSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email').or(z.literal('')).default(''),
  phone: z.string().max(30).default(''),
  company: z.string().max(100).default(''),
  website: z.string().url('Invalid URL').or(z.literal('')).default(''),
  address: z.string().max(500).default(''),
  status: z.enum(['active', 'inactive', 'lead', 'archived']).default('lead'),
  notes: z.string().max(2000).default(''),
  tags: z.array(z.string()).default([]),
})

export type ClientFormValues = z.infer<typeof clientSchema>
