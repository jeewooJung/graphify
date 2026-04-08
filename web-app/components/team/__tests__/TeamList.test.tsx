import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { TeamList } from '../TeamList'

// Mock the Badge component
jest.mock('@/components/ui', () => ({
  Badge: ({ children, ...props }: any) => <span {...props}>{children}</span>,
}))

describe('TeamList', () => {
  const mockMembers = [
    {
      id: '1',
      name: 'Alice',
      email: 'alice@test.com',
      role: 'admin' as const,
      joinedDate: '2024-01-01',
      status: 'active' as const,
    },
    {
      id: '2',
      name: 'Bob',
      email: 'bob@test.com',
      role: 'editor' as const,
      joinedDate: '2024-02-01',
      status: 'active' as const,
    },
  ]

  it('should render team members', () => {
    render(<TeamList members={mockMembers} />)

    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('alice@test.com')).toBeInTheDocument()
    expect(screen.getByText('bob@test.com')).toBeInTheDocument()
  })

  it('should show loading state', () => {
    render(<TeamList members={[]} loading={true} />)

    expect(screen.getByText(/loading team members/i)).toBeInTheDocument()
  })

  it('should show empty state', () => {
    render(<TeamList members={[]} />)

    expect(screen.getByText(/no team members yet/i)).toBeInTheDocument()
  })

  it('should call onEditMember when edit button is clicked', () => {
    const mockOnEdit = jest.fn()
    render(<TeamList members={mockMembers} onEditMember={mockOnEdit} />)

    const buttons = screen.getAllByRole('button')
    // Find edit button (it should be before delete button for each member)
    const editButtons = buttons.slice(0, mockMembers.length)

    if (editButtons.length > 0) {
      fireEvent.click(editButtons[0])
      expect(mockOnEdit).toHaveBeenCalledWith('1')
    }
  })

  it('should call onRemoveMember when delete button is clicked', () => {
    const mockOnRemove = jest.fn()
    render(<TeamList members={mockMembers} onRemoveMember={mockOnRemove} />)

    const buttons = screen.getAllByRole('button')
    // Find delete button (should be after edit button for first member)
    if (buttons.length > 1) {
      fireEvent.click(buttons[1])
      expect(mockOnRemove).toHaveBeenCalledWith('1')
    }
  })

  it('should display role badges', () => {
    render(<TeamList members={mockMembers} />)

    expect(screen.getByText('admin')).toBeInTheDocument()
    expect(screen.getByText('editor')).toBeInTheDocument()
  })

  it('should display joined dates', () => {
    render(<TeamList members={mockMembers} />)

    expect(screen.getByText('2024-01-01')).toBeInTheDocument()
    expect(screen.getByText('2024-02-01')).toBeInTheDocument()
  })

  it('should render table headers', () => {
    render(<TeamList members={mockMembers} />)

    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Role')).toBeInTheDocument()
    expect(screen.getByText('Joined')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
  })
})
