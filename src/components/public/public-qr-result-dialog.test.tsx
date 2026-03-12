import { render, screen } from '@/test/utils'
import { PublicQrResultDialog } from './public-qr-result-dialog'

// Mock @base-ui/react/dialog — not available in jsdom environment
vi.mock('@base-ui/react/dialog', () => ({
  Dialog: {
    Root: ({
      open,
      children,
    }: {
      open: boolean
      children: React.ReactNode
    }) => (open ? <div data-testid="dialog-root">{children}</div> : null),
    Portal: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    Backdrop: ({ className }: { className?: string }) => (
      <div data-testid="dialog-backdrop" className={className} />
    ),
    Popup: ({
      children,
      className,
    }: {
      children: React.ReactNode
      className?: string
    }) => (
      <div data-testid="dialog-popup" role="dialog" className={className}>
        {children}
      </div>
    ),
    Title: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <h2 className={className}>{children}</h2>
    ),
    Close: ({
      children,
      className,
      'aria-label': ariaLabel,
    }: {
      children: React.ReactNode
      className?: string
      'aria-label'?: string
    }) => (
      <button aria-label={ariaLabel} className={className}>
        {children}
      </button>
    ),
  },
}))

// Mock qr-generator to avoid canvas/file-system dependency
vi.mock('@/lib/qr-generator', () => ({
  downloadQrPng: vi.fn(),
  generateQrDataUrl: vi.fn(),
}))

// Mock useCopyToClipboard hook
vi.mock('@/hooks/use-copy-to-clipboard', () => ({
  useCopyToClipboard: () => ({ copied: false, copy: vi.fn() }),
}))

const mockQrData = {
  slug: 'test-abc123',
  dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI6QAAAABJRU5ErkJggg==',
  label: 'QR 1',
}

describe('PublicQrResultDialog', () => {
  it('renders QR image when open=true and qrData is provided', () => {
    render(
      <PublicQrResultDialog
        open={true}
        onOpenChange={vi.fn()}
        qrData={mockQrData}
      />
    )
    const img = screen.getByRole('img', { name: 'QR 1' })
    expect(img).toBeInTheDocument()
  })

  it('renders the QR label text when open', () => {
    render(
      <PublicQrResultDialog
        open={true}
        onOpenChange={vi.fn()}
        qrData={mockQrData}
      />
    )
    expect(screen.getByText('QR 1')).toBeInTheDocument()
  })

  it('renders "Your QR code is ready!" confirmation text', () => {
    render(
      <PublicQrResultDialog
        open={true}
        onOpenChange={vi.fn()}
        qrData={mockQrData}
      />
    )
    expect(screen.getByText(/your qr code is ready/i)).toBeInTheDocument()
  })

  it('renders the Download button', () => {
    render(
      <PublicQrResultDialog
        open={true}
        onOpenChange={vi.fn()}
        qrData={mockQrData}
      />
    )
    expect(screen.getByText('Download')).toBeInTheDocument()
  })

  it('renders the Copy link button', () => {
    render(
      <PublicQrResultDialog
        open={true}
        onOpenChange={vi.fn()}
        qrData={mockQrData}
      />
    )
    expect(screen.getByText('Copy link')).toBeInTheDocument()
  })

  it('renders the Close button', () => {
    render(
      <PublicQrResultDialog
        open={true}
        onOpenChange={vi.fn()}
        qrData={mockQrData}
      />
    )
    expect(screen.getByRole('button', { name: /close dialog/i })).toBeInTheDocument()
  })

  it('renders nothing when qrData is null', () => {
    const { container } = render(
      <PublicQrResultDialog
        open={true}
        onOpenChange={vi.fn()}
        qrData={null}
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('does not render dialog content when open=false', () => {
    render(
      <PublicQrResultDialog
        open={false}
        onOpenChange={vi.fn()}
        qrData={mockQrData}
      />
    )
    expect(screen.queryByTestId('dialog-root')).not.toBeInTheDocument()
  })
})
