import React from 'react'
import { render, screen } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import { SlugInput } from './slug-input'

// Input uses @base-ui which crashes in jsdom (browser detection at import time).
// Mock with a plain <input> that preserves name, value, onChange, className, placeholder.
vi.mock('@/components/ui/input', () => ({
  Input: ({ className, type, name, value, onChange, placeholder, defaultValue, ...props }: React.ComponentProps<'input'>) => (
    <input
      type={type ?? 'text'}
      name={name}
      value={value}
      onChange={onChange}
      className={className}
      placeholder={placeholder}
      defaultValue={defaultValue}
      {...props}
    />
  ),
}))

// Mock useSlugCheck hook — controls the returned status in each test
vi.mock('@/hooks/use-slug-check', () => ({
  useSlugCheck: vi.fn().mockReturnValue('idle'),
}))

import { useSlugCheck } from '@/hooks/use-slug-check'

describe('SlugInput', () => {
  beforeEach(() => {
    vi.mocked(useSlugCheck).mockReturnValue('idle')
  })

  it('renders input with name="slug"', () => {
    render(<SlugInput />)
    expect(screen.getByRole('textbox')).toHaveAttribute('name', 'slug')
  })

  it('renders with defaultValue when provided', () => {
    render(<SlugInput defaultValue="my-qr-code" />)
    expect(screen.getByRole('textbox')).toHaveValue('my-qr-code')
  })

  it('shows "Available" when useSlugCheck returns "available"', () => {
    vi.mocked(useSlugCheck).mockReturnValue('available')
    render(<SlugInput />)
    expect(screen.getByText('Available')).toBeInTheDocument()
  })

  it('shows "Already taken" when useSlugCheck returns "taken"', () => {
    vi.mocked(useSlugCheck).mockReturnValue('taken')
    render(<SlugInput />)
    expect(screen.getByText('Already taken')).toBeInTheDocument()
  })

  it('shows "Invalid format" when useSlugCheck returns "invalid"', () => {
    vi.mocked(useSlugCheck).mockReturnValue('invalid')
    render(<SlugInput />)
    expect(screen.getByText('Invalid format')).toBeInTheDocument()
  })

  it('shows "Checking..." when useSlugCheck returns "checking"', () => {
    vi.mocked(useSlugCheck).mockReturnValue('checking')
    render(<SlugInput />)
    expect(screen.getByText('Checking...')).toBeInTheDocument()
  })

  it('shows no status indicator when useSlugCheck returns "idle"', () => {
    vi.mocked(useSlugCheck).mockReturnValue('idle')
    render(<SlugInput />)
    expect(screen.queryByText('Available')).not.toBeInTheDocument()
    expect(screen.queryByText('Already taken')).not.toBeInTheDocument()
    expect(screen.queryByText('Invalid format')).not.toBeInTheDocument()
    expect(screen.queryByText('Checking...')).not.toBeInTheDocument()
  })

  it('renders error text when error prop is provided', () => {
    render(<SlugInput error={['Slug is already taken']} />)
    expect(screen.getByText('Slug is already taken')).toBeInTheDocument()
  })

  it('normalizes input: typing "My Slug" produces "my-slug" (lowercase + spaces to hyphens)', async () => {
    const user = userEvent.setup()
    render(<SlugInput />)
    const input = screen.getByRole('textbox')

    await user.type(input, 'My Slug')

    expect(input).toHaveValue('my-slug')
  })

  it('normalizes uppercase input to lowercase', async () => {
    const user = userEvent.setup()
    render(<SlugInput />)
    const input = screen.getByRole('textbox')

    await user.type(input, 'UPPERCASE')

    expect(input).toHaveValue('uppercase')
  })
})
