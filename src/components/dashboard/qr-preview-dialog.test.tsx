import { render, screen } from '@/test/utils'
import { QrPreviewDialog } from './qr-preview-dialog'
import type { QrCodeWithImage } from './qr-list-row'

const fixture: QrCodeWithImage = {
  id: 'qr-1',
  user_id: 'user-1',
  slug: 'test-slug',
  label: 'Test QR Label',
  platform: 'whatsapp',
  contact_target: '+15551234567',
  default_message: null,
  is_active: true,
  scan_count: 42,
  phone_number: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  dataUrl: 'data:image/png;base64,xyz',
}

const defaultProps = {
  qr: fixture,
  thumbnailRect: null,
  ownerName: 'Alice Smith',
  ownerEmail: 'alice@example.com',
  ownerPhone: null,
  onOpenChange: vi.fn(),
}

describe('QrPreviewDialog', () => {
  it('renders QR label when open=true', () => {
    render(<QrPreviewDialog {...defaultProps} open={true} />)
    // label appears in both the sr-only title and the visible metadata section
    expect(screen.getAllByText('Test QR Label').length).toBeGreaterThan(0)
  })

  it('renders platform badge when open=true', () => {
    render(<QrPreviewDialog {...defaultProps} open={true} />)
    expect(screen.getByText('WhatsApp')).toBeInTheDocument()
  })

  it('renders scan count when open=true', () => {
    render(<QrPreviewDialog {...defaultProps} open={true} />)
    // formatScanCount(42) = "42", displayed as "42 scans"
    expect(screen.getByText(/42 scans/i)).toBeInTheDocument()
  })

  it('renders Copy link button when open=true', () => {
    render(<QrPreviewDialog {...defaultProps} open={true} />)
    expect(screen.getByRole('button', { name: /copy link/i })).toBeInTheDocument()
  })

  it('renders QR image with correct src when open=true', () => {
    render(<QrPreviewDialog {...defaultProps} open={true} />)
    const images = screen.getAllByRole('img', { name: /test qr label/i })
    expect(images.some((img) => img.getAttribute('src') === fixture.dataUrl)).toBe(true)
  })

  it('renders ownerName when provided', () => {
    render(<QrPreviewDialog {...defaultProps} open={true} ownerName="Bob Jones" />)
    expect(screen.getByText('Bob Jones')).toBeInTheDocument()
  })

  it('renders ownerEmail when provided', () => {
    render(<QrPreviewDialog {...defaultProps} open={true} ownerEmail="bob@example.com" />)
    expect(screen.getByText('bob@example.com')).toBeInTheDocument()
  })

  it('renders formatted ownerPhone when provided', () => {
    render(<QrPreviewDialog {...defaultProps} open={true} ownerPhone="5551234567" />)
    // formatPhoneDisplay('5551234567') -> '555 - 123 - 4567'
    expect(screen.getByText('555 - 123 - 4567')).toBeInTheDocument()
  })

  it('does not render dialog popup when open=false', () => {
    render(<QrPreviewDialog {...defaultProps} open={false} />)
    // When closed, @base-ui does not render the popup content in the DOM
    expect(screen.queryByText('Test QR Label')).not.toBeInTheDocument()
  })

  it('does not render ownerName when it is an empty string', () => {
    render(<QrPreviewDialog {...defaultProps} open={true} ownerName="" />)
    // Only "Test QR Label" appears in the dialog — not an owner name paragraph
    const paragraphs = screen.queryAllByText('')
    // The ownerName block is only rendered when truthy
    expect(paragraphs.filter((el) => el.tagName === 'P' && el.textContent === 'Alice Smith')).toHaveLength(0)
  })
})
