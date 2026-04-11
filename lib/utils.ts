import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import dayjs from 'dayjs'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
}

export function formatDate(date: string | null, format = 'MMM D, YYYY') {
  if (!date) return '—'
  return dayjs(date).format(format)
}

export function generateSlug(title: string) {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') +
    '-' +
    Math.random().toString(36).substring(2, 8)
  )
}

export function isOverdue(dueDate: string | null, status: string) {
  if (!dueDate || status === 'paid' || status === 'cancelled') return false
  return dayjs(dueDate).isBefore(dayjs(), 'day')
}

export function getInitials(name: string | null) {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/** Radix Select forbids `SelectItem value=""` (empty string clears the root value). Use this sentinel for optional fields. */
export const SELECT_NONE = '__none__' as const

export function toSelectValue(optional: string | null | undefined) {
  return optional === '' || optional === undefined || optional === null ? SELECT_NONE : optional
}

export function fromSelectValue(value: string) {
  return value === SELECT_NONE ? '' : value
}
