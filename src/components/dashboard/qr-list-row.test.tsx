import { render, screen } from '@/test/utils'
import { QrListRow } from './qr-list-row'
import type { QrCodeWithImage } from './qr-list-row'

// QrListRow renders a QrPreviewDialog (uses @base-ui/react/dialog) and
// DeleteDialog (uses @base-ui/react/alert-dialog) — mock both to avoid
// the jsdom/detectBrowser incompatibility with @base-ui utils.
vi.mock('@/components/dashboard/qr-preview-dialog', () => ({
  QrPreviewDialog: () => null,
}))

vi.mock('@/components/qr-management/delete-dialog', () => ({
  DeleteDialog: ({ id }: { id: string }) => (
    <button type="button" aria-label="Delete QR code" data-id={id}>
      Delete
    </button>
  ),
}))

vi.mock('@/lib/qr-generator', () => ({
  downloadQrPng: vi.fn(),
}))

const fixture: QrCodeWithImage = {
  id: 'qr-123',
  user_id: 'user-456',
  slug: 'my-qr',
  label: 'My WhatsApp QR',
  platform: 'whatsapp',
  contact_target: '+15551234567',
  default_message: 'Hello!',
  is_active: true,
  scan_count: 1500,
  phone_number: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  dataUrl: 'data:image/png;base64,abc123',
}

const defaultProps = {
  qr: fixture,
  onDelete: vi.fn().mockResolvedValue({}),
  onEdit: vi.fn(),
  pulseId: null,
  ownerName: 'Alice Smith',
  ownerEmail: 'alice@example.com',
  ownerPhone: '+15559876543',
}

describe('QrListRow', () => {
  it('renders QR thumbnail image with correct src', () => {
    render(<QrListRow {...defaultProps} />)
    const img = screen.getByRole('button', { name: /my whatsapp qr/i })
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', fixture.dataUrl)
  })

  it('renders label text', () => {
    render(<QrListRow {...defaultProps} />)
    expect(screen.getByText('My WhatsApp QR')).toBeInTheDocument()
  })

  it('renders slug text', () => {
    render(<QrListRow {...defaultProps} />)
    expect(screen.getByText('/q/my-qr')).toBeInTheDocument()
  })

  it('renders platform badge', () => {
    render(<QrListRow {...defaultProps} />)
    expect(screen.getByText('WhatsApp')).toBeInTheDocument()
  })

  it('renders formatted scan count with compact notation for >= 1000', () => {
    render(<QrListRow {...defaultProps} />)
    // formatScanCount(1500) returns "1.5k"
    expect(screen.getByText('1.5k')).toBeInTheDocument()
  })

  it('renders edit button with accessible label', () => {
    render(<QrListRow {...defaultProps} />)
    expect(screen.getByRole('button', { name: /edit qr code/i })).toBeInTheDocument()
  })

  it('renders download button with accessible label', () => {
    render(<QrListRow {...defaultProps} />)
    expect(screen.getByRole('button', { name: /download qr code/i })).toBeInTheDocument()
  })

  it('renders delete button via DeleteDialog', () => {
    render(<QrListRow {...defaultProps} />)
    expect(screen.getByRole('button', { name: /delete qr code/i })).toBeInTheDocument()
  })

  it('calls onEdit with the qr object when edit button is clicked', async () => {
    const onEdit = vi.fn()
    const { userEvent: user } = await import('@/test/utils')
    const setup = (await import('@testing-library/user-event')).default.setup()
    render(<QrListRow {...defaultProps} onEdit={onEdit} />)

    await setup.click(screen.getByRole('button', { name: /edit qr code/i }))
    expect(onEdit).toHaveBeenCalledWith(fixture)
  })

  it('renders SMS platform badge for sms QR code', () => {
    const smsQr: QrCodeWithImage = { ...fixture, platform: 'sms' }
    render(<QrListRow {...defaultProps} qr={smsQr} />)
    expect(screen.getByText('SMS')).toBeInTheDocument()
  })
})
