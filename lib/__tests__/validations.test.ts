import { describe, expect, it } from 'vitest'
import { clientSchema } from '@/lib/validations/client'
import { invoiceSchema } from '@/lib/validations/invoice'
import { projectSchema } from '@/lib/validations/project'
import { taskSchema } from '@/lib/validations/task'

describe('zod validations', () => {
  describe('clientSchema', () => {
    it('passes with valid data', () => {
      const parsed = clientSchema.safeParse({ name: 'Acme Client' })
      expect(parsed.success).toBe(true)
    })

    it('fails without name', () => {
      const parsed = clientSchema.safeParse({ name: '' })
      expect(parsed.success).toBe(false)
    })

    it('trims whitespace around name', () => {
      const parsed = clientSchema.parse({ name: '   Acme Client   ' })
      expect(parsed.name).toBe('Acme Client')
    })
  })

  describe('projectSchema', () => {
    it('passes with valid data', () => {
      const parsed = projectSchema.safeParse({ title: 'Website Redesign' })
      expect(parsed.success).toBe(true)
    })

    it('fails without title', () => {
      const parsed = projectSchema.safeParse({ title: '' })
      expect(parsed.success).toBe(false)
    })
  })

  describe('taskSchema', () => {
    it('accepts valid status enums', () => {
      const statuses = ['todo', 'in_progress', 'in_review', 'done'] as const

      for (const status of statuses) {
        const parsed = taskSchema.safeParse({ title: 'Task', status })
        expect(parsed.success).toBe(true)
      }
    })

    it('rejects invalid status enum', () => {
      const parsed = taskSchema.safeParse({ title: 'Task', status: 'blocked' })
      expect(parsed.success).toBe(false)
    })
  })

  describe('invoiceSchema', () => {
    it('coerces tax_rate string to number', () => {
      const parsed = invoiceSchema.parse({ tax_rate: '18.5' })
      expect(parsed.tax_rate).toBe(18.5)
    })

    it('applies defaults when optional fields are omitted', () => {
      const parsed = invoiceSchema.parse({})
      expect(parsed.status).toBe('draft')
      expect(parsed.discount).toBe(0)
      expect(parsed.invoice_number).toBe('')
    })
  })
})
