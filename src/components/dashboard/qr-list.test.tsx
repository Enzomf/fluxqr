import { render, screen } from '@/test/utils'
import { QrList } from './qr-list'
import type { QrCodeWithImage } from './qr-list-row'

vi.mock('@/app/dashboard/qr-actions', () => ({
  createQrCode: vi.fn(),
  updateQrCode: vi.fn(),
  deleteQrCode: vi.fn().mockResolvedValue({}),
}))

// QrFormDialog uses @base-ui Dialog — mock to avoid jsdom/detectBrowser issue
vi.mock('@/components/qr-management/qr-form-dialog', () => ({
  QrFormDialog: () => null,
}))

// QrListRow renders QrPreviewDialog and DeleteDialog — mock to simplify tests
vi.mock('@/components/dashboard/qr-list-row', async (importOriginal) => {
  const original = await importOriginal<typeof import('./qr-list-row')>()
  return {
    ...original,
    QrListRow: ({ qr }: { qr: QrCodeWithImage }) => (
      <div data-testid={`qr-row-${qr.id}`}>{qr.label}</div>
    ),
  }
})

const makeQr = (id: string): QrCodeWithImage => ({
  id,
  user_id: 'user-1',
  slug: `slug-${id}`,
  label: `QR Code ${id}`,
  platform: 'whatsapp',
  contact_target: '+15551234567',
  default_message: null,
  is_active: true,
  scan_count: 0,
  phone_number: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  dataUrl: 'data:image/png;base64,abc',
})

const defaultProps = {
  qrCodes: [],
  verifiedPhone: null,
  ownerName: 'Alice',
  ownerEmail: 'alice@example.com',
}

describe('QrList', () => {
  // LIST-03 business rule: empty state must show "No QR codes yet"
  it('renders EmptyState with "No QR codes yet" when qrCodes array is empty (LIST-03)', () => {
    render(<QrList {...defaultProps} qrCodes={[]} />)
    expect(screen.getByRole('heading', { name: /no qr codes yet/i })).toBeInTheDocument()
  })

  it('does not render EmptyState when qrCodes has items', () => {
    render(<QrList {...defaultProps} qrCodes={[makeQr('a')]} />)
    expect(screen.queryByRole('heading', { name: /no qr codes yet/i })).not.toBeInTheDocument()
  })

  it('renders a row for each QR code', () => {
    render(<QrList {...defaultProps} qrCodes={[makeQr('1'), makeQr('2'), makeQr('3')]} />)
    expect(screen.getByTestId('qr-row-1')).toBeInTheDocument()
    expect(screen.getByTestId('qr-row-2')).toBeInTheDocument()
    expect(screen.getByTestId('qr-row-3')).toBeInTheDocument()
  })

  it('renders "New QR Code" button', () => {
    render(<QrList {...defaultProps} />)
    expect(screen.getByRole('button', { name: /new qr code/i })).toBeInTheDocument()
  })

  it('renders "New QR Code" button even when list has items', () => {
    render(<QrList {...defaultProps} qrCodes={[makeQr('x')]} />)
    expect(screen.getByRole('button', { name: /new qr code/i })).toBeInTheDocument()
  })

  it('renders the label text of each QR code', () => {
    render(<QrList {...defaultProps} qrCodes={[makeQr('abc')]} />)
    expect(screen.getByText('QR Code abc')).toBeInTheDocument()
  })
})
