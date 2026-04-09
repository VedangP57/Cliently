import { render, screen } from '@testing-library/react'
import { Search } from 'lucide-react'
import { describe, expect, it } from 'vitest'
import { EmptyState } from '@/components/shared/EmptyState'

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(<EmptyState icon={Search} title="No clients yet" description="Create your first client." />)

    expect(screen.getByText('No clients yet')).toBeInTheDocument()
    expect(screen.getByText('Create your first client.')).toBeInTheDocument()
  })

  it('renders children when provided', () => {
    render(
      <EmptyState icon={Search} title="No clients yet" description="Create your first client.">
        <button type="button">Add Client</button>
      </EmptyState>
    )

    expect(screen.getByRole('button', { name: 'Add Client' })).toBeInTheDocument()
  })
})
