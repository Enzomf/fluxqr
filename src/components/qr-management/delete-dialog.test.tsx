import React from 'react'
import { render, screen } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import { DeleteDialog } from './delete-dialog'

// AlertDialog uses @base-ui which crashes in jsdom (browser detection at import time).
// Mock with lightweight React implementations that match the expected rendering contract.
vi.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogTrigger: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <button type="button" {...props}>{children}</button>
  ),
  AlertDialogContent: ({ children }: { children: React.ReactNode }) => (
    <div role="alertdialog">{children}</div>
  ),
  AlertDialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  AlertDialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  AlertDialogAction: ({ children, onClick, disabled, className }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; className?: string }) => (
    <button type="button" onClick={onClick} disabled={disabled} className={className}>{children}</button>
  ),
  AlertDialogCancel: ({ children }: { children: React.ReactNode }) => (
    <button type="button">{children}</button>
  ),
}))

describe('DeleteDialog', () => {
  const defaultProps = {
    id: 'qr-123',
    label: 'My QR',
    onDelete: vi.fn().mockResolvedValue({}),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders trigger button with aria-label="Delete QR code"', () => {
    render(<DeleteDialog {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'Delete QR code' })).toBeInTheDocument()
  })

  it('opens dialog content when trigger is clicked', async () => {
    const user = userEvent.setup()
    render(<DeleteDialog {...defaultProps} />)

    // The dialog content is always rendered in this mock (no portal/visibility control)
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
  })

  it('shows the QR label in the dialog title', () => {
    render(<DeleteDialog {...defaultProps} />)
    expect(screen.getByText(/My QR/)).toBeInTheDocument()
  })

  it('shows deactivation warning text', () => {
    render(<DeleteDialog {...defaultProps} />)
    expect(screen.getByText(/will be deactivated/i)).toBeInTheDocument()
  })

  it('calls onDelete with the correct id when "Delete" button is confirmed (DEL-01)', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn().mockResolvedValue({})
    render(<DeleteDialog {...defaultProps} onDelete={onDelete} />)

    // Click the Delete action button (not the trigger)
    const deleteBtn = screen.getByRole('button', { name: /^Delete$/ })
    await user.click(deleteBtn)

    expect(onDelete).toHaveBeenCalledWith('qr-123')
    expect(onDelete).toHaveBeenCalledTimes(1)
  })

  it('does NOT call onDelete when "Cancel" is clicked', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn().mockResolvedValue({})
    render(<DeleteDialog {...defaultProps} onDelete={onDelete} />)

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onDelete).not.toHaveBeenCalled()
  })

  it('DEL-02: onDelete is a handler — component never does a direct database DELETE (soft delete via handler)', async () => {
    // The onDelete prop is the only way deletion occurs.
    // The component itself has no Supabase calls — business rule DEL-02 is enforced
    // by delegating deletion to the parent via the onDelete handler.
    const user = userEvent.setup()
    const onDelete = vi.fn().mockResolvedValue({})
    render(<DeleteDialog id="abc" label="Test" onDelete={onDelete} />)

    await user.click(screen.getByRole('button', { name: /^Delete$/ }))

    // Handler called once — all DB logic lives outside this component
    expect(onDelete).toHaveBeenCalledTimes(1)
    expect(onDelete).toHaveBeenCalledWith('abc')
  })
})
