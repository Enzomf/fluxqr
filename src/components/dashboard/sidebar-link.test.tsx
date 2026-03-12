import { render, screen } from '@/test/utils'
import { SidebarLink } from './sidebar-link'

// Override the global next/navigation mock with a vi.fn() so we can control per-test
vi.mock('next/navigation', () => ({
  useRouter: vi.fn().mockReturnValue({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: vi.fn().mockReturnValue('/'),
  useSearchParams: vi.fn().mockReturnValue(new URLSearchParams()),
}))

// Lazy import after mock so we get the mocked version
import { usePathname } from 'next/navigation'

describe('SidebarLink', () => {
  it('renders link with correct href', () => {
    vi.mocked(usePathname).mockReturnValue('/other')
    render(<SidebarLink href="/dashboard" label="My QR Codes" />)
    const link = screen.getByRole('link', { name: /my qr codes/i })
    expect(link).toHaveAttribute('href', '/dashboard')
  })

  it('renders label text', () => {
    vi.mocked(usePathname).mockReturnValue('/other')
    render(<SidebarLink href="/dashboard" label="My QR Codes" />)
    expect(screen.getByText('My QR Codes')).toBeInTheDocument()
  })

  it('renders icon when provided', () => {
    vi.mocked(usePathname).mockReturnValue('/other')
    render(<SidebarLink href="/dashboard" label="My QR Codes" icon={<span data-testid="icon">I</span>} />)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('shows active styles when pathname matches href exactly', () => {
    vi.mocked(usePathname).mockReturnValue('/dashboard')
    render(<SidebarLink href="/dashboard" label="My QR Codes" />)
    const link = screen.getByRole('link', { name: /my qr codes/i })
    expect(link).toHaveClass('bg-brand-500/10')
    expect(link).toHaveClass('text-brand-400')
  })

  it('shows active styles when pathname starts with href followed by slash', () => {
    vi.mocked(usePathname).mockReturnValue('/dashboard/new')
    render(<SidebarLink href="/dashboard" label="My QR Codes" />)
    const link = screen.getByRole('link', { name: /my qr codes/i })
    expect(link).toHaveClass('bg-brand-500/10')
    expect(link).toHaveClass('text-brand-400')
  })

  it('shows inactive styles when pathname does not match href', () => {
    vi.mocked(usePathname).mockReturnValue('/admin')
    render(<SidebarLink href="/dashboard" label="My QR Codes" />)
    const link = screen.getByRole('link', { name: /my qr codes/i })
    expect(link).toHaveClass('text-slate-400')
    expect(link).not.toHaveClass('bg-brand-500/10')
  })

  it('does not render icon wrapper when icon is not provided', () => {
    vi.mocked(usePathname).mockReturnValue('/other')
    const { container } = render(<SidebarLink href="/dashboard" label="My QR Codes" />)
    // icon wrapper is a <span class="shrink-0"> — should not exist without icon prop
    const iconSpans = container.querySelectorAll('span.shrink-0')
    expect(iconSpans).toHaveLength(0)
  })
})
