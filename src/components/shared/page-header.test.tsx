import { render, screen } from '@/test/utils'
import { PageHeader } from './page-header'

describe('PageHeader', () => {
  it('renders title text in a heading element', () => {
    render(<PageHeader title="My QR Codes" />)
    expect(screen.getByRole('heading', { name: 'My QR Codes' })).toBeInTheDocument()
  })

  it('renders description text when provided', () => {
    render(<PageHeader title="My QR Codes" description="Manage your codes" />)
    expect(screen.getByText('Manage your codes')).toBeInTheDocument()
  })

  it('does not render a description element when description is not provided', () => {
    render(<PageHeader title="My QR Codes" />)
    // Only the heading should appear — no extra paragraph
    expect(screen.queryByText(/manage/i)).not.toBeInTheDocument()
  })

  it('renders action link with correct label when action is provided', () => {
    render(<PageHeader title="My QR Codes" action={{ label: 'New QR', href: '/dashboard/new' }} />)
    expect(screen.getByRole('link', { name: /new qr/i })).toBeInTheDocument()
  })

  it('renders action link with correct href when action is provided', () => {
    render(<PageHeader title="My QR Codes" action={{ label: 'New QR', href: '/dashboard/new' }} />)
    const link = screen.getByRole('link', { name: /new qr/i })
    expect(link).toHaveAttribute('href', '/dashboard/new')
  })

  it('does not render an action link when action is not provided', () => {
    render(<PageHeader title="My QR Codes" />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('renders both description and action link together when both are provided', () => {
    render(
      <PageHeader
        title="My QR Codes"
        description="Manage your codes"
        action={{ label: 'Add New', href: '/new' }}
      />
    )
    expect(screen.getByText('Manage your codes')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /add new/i })).toBeInTheDocument()
  })
})
