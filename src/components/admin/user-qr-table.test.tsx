import { render, screen, userEvent } from '@/test/utils'
import { UserQrTable } from './user-qr-table'

// Mock Server Actions
vi.mock('@/app/actions/admin-actions', () => ({
  deactivateQrCode: vi.fn().mockResolvedValue({ success: true }),
  deactivateUser: vi.fn().mockResolvedValue({ success: true }),
}))

// Mock PlatformBadge to simplify assertions
vi.mock('@/components/shared/platform-badge', () => ({
  PlatformBadge: ({ platform }: { platform: string }) => (
    <span data-testid="platform-badge">{platform}</span>
  ),
}))

type AdminQrRow = {
  id: string
  slug: string
  label: string
  platform: 'whatsapp' | 'sms'
  contact_target: string
  scan_count: number
  is_active: boolean
  created_at: string
}

const mockQrCodes: AdminQrRow[] = [
  {
    id: 'qr-1',
    slug: 'abc-123def',
    label: 'Work QR',
    platform: 'whatsapp',
    contact_target: '+14155551234',
    scan_count: 15,
    is_active: true,
    created_at: '2026-01-10T00:00:00Z',
  },
  {
    id: 'qr-2',
    slug: 'xyz-456ghi',
    label: 'Personal QR',
    platform: 'sms',
    contact_target: '+15551234567',
    scan_count: 3,
    is_active: false,
    created_at: '2026-02-20T00:00:00Z',
  },
]

describe('UserQrTable', () => {
  it('renders the back link to /admin', () => {
    render(<UserQrTable qrCodes={mockQrCodes} userName="Alice" />)
    expect(screen.getByText(/back to all users/i)).toBeInTheDocument()
  })

  it('renders the user name in the heading', () => {
    render(<UserQrTable qrCodes={mockQrCodes} userName="Alice" />)
    expect(screen.getByText(/alice/i)).toBeInTheDocument()
  })

  it('renders table headers', () => {
    render(<UserQrTable qrCodes={mockQrCodes} userName="Alice" />)
    expect(screen.getByText('Label')).toBeInTheDocument()
    expect(screen.getByText('Slug')).toBeInTheDocument()
    expect(screen.getByText('Platform')).toBeInTheDocument()
    expect(screen.getByText('Contact')).toBeInTheDocument()
    expect(screen.getByText('Scans')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
  })

  it('renders a row for each QR code', () => {
    render(<UserQrTable qrCodes={mockQrCodes} userName="Alice" />)
    expect(screen.getByText('Work QR')).toBeInTheDocument()
    expect(screen.getByText('Personal QR')).toBeInTheDocument()
  })

  it('renders the QR label in each row', () => {
    render(<UserQrTable qrCodes={[mockQrCodes[0]]} userName="Alice" />)
    expect(screen.getByText('Work QR')).toBeInTheDocument()
  })

  it('renders the QR slug as a code element', () => {
    render(<UserQrTable qrCodes={[mockQrCodes[0]]} userName="Alice" />)
    expect(screen.getByText('abc-123def')).toBeInTheDocument()
  })

  it('renders the platform badge for each QR', () => {
    render(<UserQrTable qrCodes={[mockQrCodes[0]]} userName="Alice" />)
    expect(screen.getByTestId('platform-badge')).toBeInTheDocument()
  })

  it('renders the contact target', () => {
    render(<UserQrTable qrCodes={[mockQrCodes[0]]} userName="Alice" />)
    expect(screen.getByText('+14155551234')).toBeInTheDocument()
  })

  it('renders the scan count', () => {
    render(<UserQrTable qrCodes={[mockQrCodes[0]]} userName="Alice" />)
    expect(screen.getByText('15')).toBeInTheDocument()
  })

  it('renders "Active" status for active QR codes', () => {
    render(<UserQrTable qrCodes={[mockQrCodes[0]]} userName="Alice" />)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('renders "Inactive" status for inactive QR codes', () => {
    render(<UserQrTable qrCodes={[mockQrCodes[1]]} userName="Alice" />)
    expect(screen.getByText('Inactive')).toBeInTheDocument()
  })

  it('renders "Deactivate" button for active QR codes', () => {
    render(<UserQrTable qrCodes={[mockQrCodes[0]]} userName="Alice" />)
    expect(screen.getByRole('button', { name: /deactivate/i })).toBeInTheDocument()
  })

  it('does not render Deactivate button for inactive QR codes', () => {
    render(<UserQrTable qrCodes={[mockQrCodes[1]]} userName="Alice" />)
    expect(screen.queryByRole('button', { name: /deactivate/i })).not.toBeInTheDocument()
  })

  it('renders empty state when qrCodes array is empty', () => {
    render(<UserQrTable qrCodes={[]} userName="Alice" />)
    expect(screen.getByText(/no qr codes found for this user/i)).toBeInTheDocument()
  })

  it('does not render the table when qrCodes is empty', () => {
    render(<UserQrTable qrCodes={[]} userName="Alice" />)
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('calls deactivateQrCode when Deactivate button is clicked and confirmed', async () => {
    const { deactivateQrCode } = await import('@/app/actions/admin-actions')
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<UserQrTable qrCodes={[mockQrCodes[0]]} userName="Alice" />)
    await user.click(screen.getByRole('button', { name: /deactivate/i }))
    expect(window.confirm).toHaveBeenCalled()
    expect(deactivateQrCode).toHaveBeenCalledWith('qr-1')
    vi.restoreAllMocks()
  })

  it('does not call deactivateQrCode when confirm is cancelled', async () => {
    const { deactivateQrCode } = await import('@/app/actions/admin-actions')
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<UserQrTable qrCodes={[mockQrCodes[0]]} userName="Alice" />)
    await user.click(screen.getByRole('button', { name: /deactivate/i }))
    expect(deactivateQrCode).not.toHaveBeenCalled()
    vi.restoreAllMocks()
  })
})
