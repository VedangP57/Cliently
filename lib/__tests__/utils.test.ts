import { describe, expect, it, vi } from 'vitest'
import { formatCurrency, formatDate, generateSlug, getInitials, isOverdue } from '@/lib/utils'

describe('lib/utils', () => {
  describe('formatCurrency()', () => {
    it('formats amount with currency', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56')
    })

    it('handles zero', () => {
      expect(formatCurrency(0)).toBe('$0.00')
    })
  })

  describe('formatDate()', () => {
    it("returns em dash for null", () => {
      expect(formatDate(null)).toBe('—')
    })

    it('formats a valid date', () => {
      expect(formatDate('2026-04-09')).toBe('Apr 9, 2026')
    })
  })

  describe('generateSlug()', () => {
    it('returns lowercase hyphenated slug with random suffix', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.123456789)

      const slug = generateSlug('Hello World From Cliently')
      expect(slug).toBe('hello-world-from-cliently-4fzzzx')
      expect(slug).toMatch(/^[a-z0-9-]+-[a-z0-9]{6}$/)
    })
  })

  describe('isOverdue()', () => {
    it('returns false for null due date', () => {
      expect(isOverdue(null, 'sent')).toBe(false)
    })

    it('returns false for paid status', () => {
      expect(isOverdue('2020-01-01', 'paid')).toBe(false)
    })

    it('returns true for past due date with sent status', () => {
      expect(isOverdue('2000-01-01', 'sent')).toBe(true)
    })
  })

  describe('getInitials()', () => {
    it("returns '?' for null", () => {
      expect(getInitials(null)).toBe('?')
    })

    it('returns first letters and max 2 chars', () => {
      expect(getInitials('Jane Doe')).toBe('JD')
      expect(getInitials('Jane Mary Doe')).toBe('JM')
    })
  })
})
