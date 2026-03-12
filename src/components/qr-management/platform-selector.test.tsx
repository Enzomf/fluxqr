import React from 'react'
import { render, screen } from '@/test/utils'
import { PlatformSelector } from './platform-selector'

// Select uses @base-ui which crashes in jsdom (browser detection at import time).
// Mock with lightweight React implementations that preserve the test-relevant API.
vi.mock('@/components/ui/select', () => ({
  Select: ({ children, disabled, name, defaultValue, onValueChange }: {
    children: React.ReactNode
    disabled?: boolean
    name?: string
    defaultValue?: string
    onValueChange?: (value: string) => void
  }) => (
    <div data-testid="select-root" data-disabled={disabled} data-name={name} data-default-value={defaultValue}>
      {children}
    </div>
  ),
  SelectTrigger: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <button role="combobox" className={className}>{children}</button>
  ),
  SelectValue: ({ placeholder }: { placeholder?: string }) => (
    <span>{placeholder}</span>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="select-content">{children}</div>
  ),
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <div data-value={value}>{children}</div>
  ),
}))

// Tooltip uses @base-ui as well
vi.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}))

describe('PlatformSelector', () => {
  it('renders the select trigger element', () => {
    render(<PlatformSelector />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('shows placeholder text "Select a platform" when no default value', () => {
    render(<PlatformSelector />)
    expect(screen.getByText('Select a platform')).toBeInTheDocument()
  })

  it('EDIT-02: renders tooltip text "Platform cannot be changed after creation" when disabled', () => {
    render(<PlatformSelector disabled />)
    expect(
      screen.getByText('Platform cannot be changed after creation')
    ).toBeInTheDocument()
  })

  it('EDIT-02: does NOT render tooltip text when not disabled', () => {
    render(<PlatformSelector />)
    expect(
      screen.queryByText('Platform cannot be changed after creation')
    ).not.toBeInTheDocument()
  })

  it('applies opacity-50 class to trigger when disabled', () => {
    render(<PlatformSelector disabled />)
    const trigger = screen.getByRole('combobox')
    expect(trigger).toHaveClass('opacity-50')
  })

  it('renders error message when error prop is provided', () => {
    render(<PlatformSelector error={['Platform is required']} />)
    expect(screen.getByText('Platform is required')).toBeInTheDocument()
  })

  it('does NOT render error message when no error prop', () => {
    render(<PlatformSelector />)
    expect(screen.queryByText('Platform is required')).not.toBeInTheDocument()
  })
})
