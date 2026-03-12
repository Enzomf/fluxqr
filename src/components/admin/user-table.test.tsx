import { render, screen, userEvent } from '@/test/utils'
import { UserTable } from './user-table'

// Mock Server Actions
vi.mock('@/app/actions/admin-actions', () => ({
  deactivateUser: vi.fn().mockResolvedValue({ success: true }),
  deactivateQrCode: vi.fn().mockResolvedValue({ success: true }),
}))

type UserRow = {
  id: string
  email: string | null
  phone_number: string | null
  role: string
  is_active: boolean
  created_at: string
  qr_count: number
  total_scans: number
}

const mockUsers: UserRow[] = [
  {
    id: 'user-1',
    email: 'alice@example.com',
    phone_number: '+14155551234',
    role: 'user',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    qr_count: 3,
    total_scans: 42,
  },
  {
    id: 'user-2',
    email: 'bob@example.com',
    phone_number: null,
    role: 'user',
    is_active: false,
    created_at: '2026-02-15T00:00:00Z',
    qr_count: 0,
    total_scans: 0,
  },
]

describe('UserTable', () => {
  it('renders table headers', () => {
    render(<UserTable users={mockUsers} />)
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Phone')).toBeInTheDocument()
    expect(screen.getByText('QR Codes')).toBeInTheDocument()
    expect(screen.getByText('Total Scans')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
  })

  it('renders a row for each user', () => {
    render(<UserTable users={mockUsers} />)
    expect(screen.getByText('alice@example.com')).toBeInTheDocument()
    expect(screen.getByText('bob@example.com')).toBeInTheDocument()
  })

  it('renders user email in each row', () => {
    render(<UserTable users={[mockUsers[0]]} />)
    expect(screen.getByText('alice@example.com')).toBeInTheDocument()
  })

  it('renders QR count for each user', () => {
    render(<UserTable users={[mockUsers[0]]} />)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('renders total scans for each user', () => {
    render(<UserTable users={[mockUsers[0]]} />)
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('renders "Active" status for active users', () => {
    render(<UserTable users={[mockUsers[0]]} />)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('renders "Deactivated" status for inactive users', () => {
    render(<UserTable users={[mockUsers[1]]} />)
    expect(screen.getByText('Deactivated')).toBeInTheDocument()
  })

  it('renders "Deactivate" action button for active users', () => {
    render(<UserTable users={[mockUsers[0]]} />)
    expect(screen.getByRole('button', { name: /deactivate/i })).toBeInTheDocument()
  })

  it('does not render deactivate button for already inactive users', () => {
    render(<UserTable users={[mockUsers[1]]} />)
    expect(screen.queryByRole('button', { name: /deactivate/i })).not.toBeInTheDocument()
  })

  it('renders "No users found" empty state when users array is empty', () => {
    render(<UserTable users={[]} />)
    expect(screen.getByText(/no users found/i)).toBeInTheDocument()
  })

  it('does not render table when users array is empty', () => {
    render(<UserTable users={[]} />)
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('renders phone number when present', () => {
    render(<UserTable users={[mockUsers[0]]} />)
    expect(screen.getByText('+14155551234')).toBeInTheDocument()
  })

  it('shows confirm dialog and calls deactivateUser when Deactivate clicked', async () => {
    const { deactivateUser } = await import('@/app/actions/admin-actions')
    const user = userEvent.setup()
    // Mock window.confirm to return true
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<UserTable users={[mockUsers[0]]} />)
    await user.click(screen.getByRole('button', { name: /deactivate/i }))
    expect(window.confirm).toHaveBeenCalled()
    expect(deactivateUser).toHaveBeenCalledWith('user-1')
    vi.restoreAllMocks()
  })
})
