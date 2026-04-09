import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StatusBadge } from '@/components/shared/StatusBadge'

describe('StatusBadge', () => {
  const cases = [
    { status: 'active', expectedClass: 'bg-green-100 text-green-800' },
    { status: 'paid', expectedClass: 'bg-green-100 text-green-800' },
    { status: 'overdue', expectedClass: 'bg-red-100 text-red-800' },
    { status: 'urgent', expectedClass: 'bg-red-100 text-red-700' },
  ] as const

  it.each(cases)('renders correct text for "$status"', ({ status }) => {
    render(<StatusBadge status={status} />)
    expect(screen.getByText(status)).toBeInTheDocument()
  })

  it.each(cases)('applies correct class for "$status"', ({ status, expectedClass }) => {
    render(<StatusBadge status={status} />)
    const badge = screen.getByText(status)
    expect(badge).toHaveClass(...expectedClass.split(' '))
  })
})
