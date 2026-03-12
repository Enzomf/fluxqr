import { render, screen, userEvent } from '@/test/utils'
import { EmptyState } from './empty-state'

describe('EmptyState', () => {
  // LIST-03 business rule: heading must be exactly "No QR codes yet"
  it('renders "No QR codes yet" heading (LIST-03)', () => {
    render(<EmptyState />)
    expect(screen.getByRole('heading', { name: /no qr codes yet/i })).toBeInTheDocument()
  })

  it('renders "Create your first QR code" button', () => {
    render(<EmptyState />)
    expect(screen.getByRole('button', { name: /create your first qr code/i })).toBeInTheDocument()
  })

  it('calls onAction callback when button is clicked', async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()
    render(<EmptyState onAction={onAction} />)

    await user.click(screen.getByRole('button', { name: /create your first qr code/i }))

    expect(onAction).toHaveBeenCalledTimes(1)
  })

  it('renders without error when onAction is not provided', () => {
    expect(() => render(<EmptyState />)).not.toThrow()
  })

  it('does not throw when button is clicked without onAction', async () => {
    const user = userEvent.setup()
    render(<EmptyState />)

    await expect(
      user.click(screen.getByRole('button', { name: /create your first qr code/i }))
    ).resolves.not.toThrow()
  })
})
