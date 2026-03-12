import { render, screen, userEvent } from '@/test/utils'
import { PublicQrForm } from './public-qr-form'

// Mock Server Action
vi.mock('@/app/actions/create-public-qr', () => ({
  createPublicQr: vi.fn().mockResolvedValue({
    qrData: { slug: 'test-slug', dataUrl: 'data:image/png;base64,...', label: 'QR 1' },
  }),
}))

describe('PublicQrForm', () => {
  const defaultProps = {
    qrType: 'default' as const,
    phone: '+14155551234',
    onResult: vi.fn(),
    onGateHit: vi.fn(),
    onBack: vi.fn(),
  }

  it('renders the verified phone number', () => {
    render(<PublicQrForm {...defaultProps} />)
    expect(screen.getByText('+14155551234')).toBeInTheDocument()
  })

  it('renders a "Your number" label for the phone display', () => {
    render(<PublicQrForm {...defaultProps} />)
    expect(screen.getByText(/your number/i)).toBeInTheDocument()
  })

  it('renders the Generate QR button with phone number', () => {
    render(<PublicQrForm {...defaultProps} />)
    expect(
      screen.getByRole('button', { name: /generate qr for \+14155551234/i })
    ).toBeInTheDocument()
  })

  it('renders a Back button', () => {
    render(<PublicQrForm {...defaultProps} />)
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
  })

  it('does NOT render the message textarea when qrType="default"', () => {
    render(<PublicQrForm {...defaultProps} qrType="default" />)
    expect(screen.queryByPlaceholderText(/type the message/i)).not.toBeInTheDocument()
  })

  it('renders the message textarea when qrType="custom"', () => {
    render(<PublicQrForm {...defaultProps} qrType="custom" />)
    expect(
      screen.getByPlaceholderText(/type the message that will appear/i)
    ).toBeInTheDocument()
  })

  it('renders "Your message" label when qrType="custom"', () => {
    render(<PublicQrForm {...defaultProps} qrType="custom" />)
    expect(screen.getByText(/your message/i)).toBeInTheDocument()
  })

  it('calls onBack when Back button is clicked', async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()
    render(<PublicQrForm {...defaultProps} onBack={onBack} />)
    await user.click(screen.getByRole('button', { name: /back/i }))
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('allows typing a custom message when qrType="custom"', async () => {
    const user = userEvent.setup()
    render(<PublicQrForm {...defaultProps} qrType="custom" />)
    const textarea = screen.getByPlaceholderText(/type the message that will appear/i)
    await user.type(textarea, 'Hello there!')
    expect(textarea).toHaveValue('Hello there!')
  })
})
