import { z } from 'zod'

export const profileSettingsSchema = z.object({
  full_name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  avatar_url: z.string().url().nullable().optional(),
})

export const businessSettingsSchema = z.object({
  company_name: z.string().trim().min(2, 'Company name must be at least 2 characters').max(120).nullable().optional(),
  company_logo: z.string().url().nullable().optional(),
  address: z.string().trim().max(500).nullable().optional(),
})

export const defaultsSettingsSchema = z.object({
  tax_rate: z.number().min(0, 'Tax rate cannot be negative').max(100, 'Tax rate must be 100 or less'),
  payment_terms: z.string().trim().min(2, 'Payment terms are required').max(100),
  invoice_notes: z.string().trim().max(2000).nullable().optional(),
})

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(6, 'Current password is required'),
    new_password: z.string().min(8, 'New password must be at least 8 characters'),
    confirm_password: z.string().min(8, 'Confirm your new password'),
  })
  .refine((values) => values.new_password === values.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

export type ProfileSettingsValues = z.infer<typeof profileSettingsSchema>
export type BusinessSettingsValues = z.infer<typeof businessSettingsSchema>
export type DefaultsSettingsValues = z.infer<typeof defaultsSettingsSchema>
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>
