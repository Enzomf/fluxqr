import React from 'react'
import { render, screen } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import type { QrCodeWithImage } from '@/components/dashboard/qr-list-row'

// Mock @base-ui dependent Dialog component
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open?: boolean }) =>
    open ? <div data-testid="dialog-root">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogTitle: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <h2 data-testid="dialog-title" className={className}>{children}</h2>
  ),
  DialogClose: ({ children, className, 'aria-label': ariaLabel }: { children?: React.ReactNode; className?: string; 'aria-label'?: string }) => (
    <button type="button" className={className} aria-label={ariaLabel}>{children}</button>
  ),
}))

// Mock Button to avoid @base-ui
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, type, form, disabled, className, onClick }: React.ComponentProps<'button'>) => (
    <button type={type ?? 'button'} form={form} disabled={disabled} className={className} onClick={onClick}>{children}</button>
  ),
}))

// Mock QrTypeSelect — has its own dedicated tests
vi.mock('./qr-type-select', () => ({
  QrTypeSelect: ({ onSelect }: { onSelect: (type: 'default' | 'custom') => void }) => (
    <button type="button" data-testid="qr-type-select" onClick={() => onSelect('custom')}>
      mock-type-select
    </button>
  ),
}))

// Mock QrForm — has its own dedicated tests
vi.mock('./qr-form', () => ({
  QrForm: () => <div data-testid="mock-qr-form">form</div>,
}))

// Mock Server Actions
vi.mock('@/app/dashboard/qr-actions', () => ({
  createQrCode: vi.fn(),
  updateQrCode: Object.assign(vi.fn(), {
    bind: vi.fn().mockReturnValue(vi.fn()),
  }),
}))

// useFormStatus is from react-dom; in tests, pending is always false
vi.mock('react-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-dom')>()
  return {
    ...actual,
    useFormStatus: () => ({ pending: false }),
  }
})

import { QrFormDialog } from './qr-form-dialog'

const baseQr: QrCodeWithImage = {
  id: 'qr-1',
  user_id: 'user-1',
  slug: 'my-qr',
  label: 'My QR Code',
  platform: 'whatsapp',
  contact_target: '+5511999998888',
  default_message: 'Hello',
  is_active: true,
  scan_count: 5,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  dataUrl: 'data:image/png;base64,abc',
}

describe('QrFormDialog', () => {
  describe('when open=false', () => {
    it('renders nothing when closed', () => {
      render(
        <QrFormDialog
          open={false}
          onOpenChange={vi.fn()}
          verifiedPhone={null}
        />
      )
      expect(screen.queryByTestId('dialog-root')).not.toBeInTheDocument()
    })
  })

  describe('create mode (qr=null)', () => {
    it('renders dialog with title "New QR Code" when open=true', () => {
      render(
        <QrFormDialog
          open={true}
          onOpenChange={vi.fn()}
          verifiedPhone={null}
        />
      )
      expect(screen.getByTestId('dialog-title')).toHaveTextContent('New QR Code')
    })

    it('shows QR type selection grid first (step="grid")', () => {
      render(
        <QrFormDialog
          open={true}
          onOpenChange={vi.fn()}
          verifiedPhone={null}
        />
      )
      expect(screen.getByTestId('qr-type-select')).toBeInTheDocument()
      expect(screen.queryByTestId('mock-qr-form')).not.toBeInTheDocument()
    })

    it('advances to form step after selecting a type', async () => {
      const user = userEvent.setup()
      render(
        <QrFormDialog
          open={true}
          onOpenChange={vi.fn()}
          verifiedPhone={null}
        />
      )

      await user.click(screen.getByTestId('qr-type-select'))

      expect(screen.queryByTestId('qr-type-select')).not.toBeInTheDocument()
      expect(screen.getByTestId('mock-qr-form')).toBeInTheDocument()
    })

    it('shows submit button only on form step (not on grid step)', async () => {
      const user = userEvent.setup()
      render(
        <QrFormDialog
          open={true}
          onOpenChange={vi.fn()}
          verifiedPhone={null}
        />
      )

      // On grid step: no submit button in footer
      expect(screen.queryByText(/Create QR Code/)).not.toBeInTheDocument()

      // After selecting type: footer submit appears
      await user.click(screen.getByTestId('qr-type-select'))
      expect(screen.getByText('Create QR Code')).toBeInTheDocument()
    })
  })

  describe('edit mode (qr provided)', () => {
    it('renders dialog with title containing the QR label', () => {
      render(
        <QrFormDialog
          open={true}
          onOpenChange={vi.fn()}
          qr={baseQr}
          verifiedPhone="+5511999998888"
        />
      )
      expect(screen.getByTestId('dialog-title')).toHaveTextContent('Edit: My QR Code')
    })

    it('shows form directly (skips grid step)', () => {
      render(
        <QrFormDialog
          open={true}
          onOpenChange={vi.fn()}
          qr={baseQr}
          verifiedPhone="+5511999998888"
        />
      )
      expect(screen.getByTestId('mock-qr-form')).toBeInTheDocument()
      expect(screen.queryByTestId('qr-type-select')).not.toBeInTheDocument()
    })

    it('shows "Save Changes" submit button in edit mode', () => {
      render(
        <QrFormDialog
          open={true}
          onOpenChange={vi.fn()}
          qr={baseQr}
          verifiedPhone="+5511999998888"
        />
      )
      expect(screen.getByText('Save Changes')).toBeInTheDocument()
    })
  })
})
