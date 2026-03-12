import { render, screen } from '@/test/utils'
import { Sidebar } from './sidebar'

vi.mock('@/app/dashboard/actions', () => ({
  signOut: vi.fn(),
}))

// Sheet uses @base-ui/react/dialog which calls detectBrowser() reading navigator.userAgent.
// Mock the entire Sheet to avoid the jsdom incompatibility.
vi.mock('@/components/ui/sheet', () => ({
  Sheet: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SheetTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SheetContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

const defaultUser = {
  email: 'test@example.com',
  user_metadata: {
    avatar_url: 'https://example.com/avatar.png',
    full_name: 'Test User',
  },
}

describe('Sidebar', () => {
  it('renders FluxQR brand name', () => {
    render(<Sidebar user={defaultUser} />)
    expect(screen.getAllByText('FluxQR').length).toBeGreaterThan(0)
  })

  it('renders "My QR Codes" navigation link', () => {
    render(<Sidebar user={defaultUser} />)
    const links = screen.getAllByText('My QR Codes')
    expect(links.length).toBeGreaterThan(0)
  })

  it('renders user email', () => {
    render(<Sidebar user={defaultUser} />)
    const emails = screen.getAllByText('test@example.com')
    expect(emails.length).toBeGreaterThan(0)
  })

  it('renders Sign out button', () => {
    render(<Sidebar user={defaultUser} />)
    const signOutButtons = screen.getAllByRole('button', { name: /sign out/i })
    expect(signOutButtons.length).toBeGreaterThan(0)
  })

  it('shows Admin link when isAdmin=true', () => {
    render(<Sidebar user={defaultUser} isAdmin={true} />)
    const adminLinks = screen.getAllByText('Admin')
    expect(adminLinks.length).toBeGreaterThan(0)
  })

  it('does not show Admin link when isAdmin=false', () => {
    render(<Sidebar user={defaultUser} isAdmin={false} />)
    expect(screen.queryByText('Admin')).not.toBeInTheDocument()
  })

  it('does not show Admin link when isAdmin is not provided', () => {
    render(<Sidebar user={defaultUser} />)
    expect(screen.queryByText('Admin')).not.toBeInTheDocument()
  })

  it('renders avatar fallback letter from full name', () => {
    render(<Sidebar user={defaultUser} />)
    // Fallback letter from "Test User" -> 'T'
    const fallbacks = screen.getAllByText('T')
    expect(fallbacks.length).toBeGreaterThan(0)
  })

  it('renders avatar fallback letter from email when full_name is absent', () => {
    render(<Sidebar user={{ email: 'alice@example.com' }} />)
    const fallbacks = screen.getAllByText('A')
    expect(fallbacks.length).toBeGreaterThan(0)
  })
})
