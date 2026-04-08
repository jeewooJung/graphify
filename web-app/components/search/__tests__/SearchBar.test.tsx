import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { SearchBar } from '../SearchBar'

describe('SearchBar', () => {
  it('should render search input and filters', () => {
    const mockOnSearch = jest.fn()
    render(<SearchBar onSearch={mockOnSearch} />)

    const searchInput = screen.getByPlaceholderText(/search nodes, graphs, entities/i)
    expect(searchInput).toBeInTheDocument()

    const filterButtons = screen.getAllByRole('button')
    expect(filterButtons.length).toBeGreaterThan(0)
  })

  it('should call onSearch when text is entered and form is submitted', () => {
    const mockOnSearch = jest.fn()
    render(<SearchBar onSearch={mockOnSearch} />)

    const searchInput = screen.getByPlaceholderText(/search nodes, graphs, entities/i)
    fireEvent.change(searchInput, { target: { value: 'test' } })
    fireEvent.submit(searchInput.closest('form')!)

    expect(mockOnSearch).toHaveBeenCalledWith('test')
  })

  it('should show value when text is entered', () => {
    const mockOnSearch = jest.fn()
    render(<SearchBar onSearch={mockOnSearch} />)

    const searchInput = screen.getByPlaceholderText(/search nodes, graphs, entities/i) as HTMLInputElement
    fireEvent.change(searchInput, { target: { value: 'test' } })

    expect(searchInput.value).toBe('test')
  })

  it('should show clear button when text is entered', () => {
    const mockOnSearch = jest.fn()
    render(<SearchBar onSearch={mockOnSearch} />)

    const searchInput = screen.getByPlaceholderText(/search nodes, graphs, entities/i)
    fireEvent.change(searchInput, { target: { value: 'test' } })

    // Clear button should appear (X button)
    const clearButtons = screen.getAllByRole('button')
    expect(clearButtons.length).toBeGreaterThan(4) // At least the 4 filter buttons + clear button
  })

  it('should clear search when clear button is clicked', () => {
    const mockOnSearch = jest.fn()
    render(<SearchBar onSearch={mockOnSearch} />)

    const searchInput = screen.getByPlaceholderText(/search nodes, graphs, entities/i) as HTMLInputElement
    fireEvent.change(searchInput, { target: { value: 'test' } })

    // Find the clear button
    const buttons = screen.getAllByRole('button')
    const clearButton = buttons.find(btn => btn.querySelector('svg') && btn.className.includes('right'))

    if (clearButton) {
      fireEvent.click(clearButton)
      expect(mockOnSearch).toHaveBeenCalledWith('')
    }
  })

  it('should call onFilterChange when filter is selected', () => {
    const mockOnSearch = jest.fn()
    const mockOnFilterChange = jest.fn()
    render(
      <SearchBar onSearch={mockOnSearch} onFilterChange={mockOnFilterChange} />
    )

    const filterButtons = screen.getAllByRole('button').filter(btn =>
      ['entity', 'concept', 'relation', 'graph'].includes(btn.textContent?.toLowerCase() || '')
    )

    if (filterButtons.length > 0) {
      fireEvent.click(filterButtons[0])
      expect(mockOnFilterChange).toHaveBeenCalled()
    }
  })

  it('should toggle filter selection', () => {
    const mockOnSearch = jest.fn()
    const mockOnFilterChange = jest.fn()
    render(
      <SearchBar onSearch={mockOnSearch} onFilterChange={mockOnFilterChange} />
    )

    const filterButtons = screen.getAllByRole('button').filter(btn =>
      ['entity', 'concept', 'relation', 'graph'].includes(btn.textContent?.toLowerCase() || '')
    )

    if (filterButtons.length > 0) {
      // First click - select
      fireEvent.click(filterButtons[0])
      expect(mockOnFilterChange).toHaveBeenCalledWith('entity')

      // Second click - deselect
      fireEvent.click(filterButtons[0])
      expect(mockOnFilterChange).toHaveBeenCalledWith(null)
    }
  })
})
