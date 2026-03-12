import { render, screen } from '@/test/utils'
import { PhoneVerifyDialog } from './phone-verify-dialog'

// Mock sendOtp server action used inside PhoneVerifyForm
vi.mock('@/app/actions/verify-phone', () => ({
  sendOtp: vi.fn().mockResolvedValue({ success: false }),
}))

const defaultProps = {
  open: true,
  onOpenChange: vi.fn(),
  onVerified: vi.fn(),
}

describe('PhoneVerifyDialog', () => {
  it('renders phone input form when open=true', () => {
    render(<PhoneVerifyDialog {...defaultProps} />)
    // PhoneVerifyForm renders an input with name="localNumber"
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('renders "Verify your phone number" heading when open=true', () => {
    render(<PhoneVerifyDialog {...defaultProps} />)
    expect(screen.getByRole('heading', { name: /verify your phone number/i })).toBeInTheDocument()
  })

  it('renders "Send verification code" submit button when open=true', () => {
    render(<PhoneVerifyDialog {...defaultProps} />)
    expect(screen.getByRole('button', { name: /send verification code/i })).toBeInTheDocument()
  })

  it('renders country code selector when open=true', () => {
    render(<PhoneVerifyDialog {...defaultProps} />)
    // PhoneVerifyForm renders a <select> with aria-label="Country code"
    expect(screen.getByRole('combobox', { name: /country code/i })).toBeInTheDocument()
  })

  it('does not render dialog content when open=false', () => {
    render(<PhoneVerifyDialog {...defaultProps} open={false} />)
    expect(screen.queryByRole('heading', { name: /verify your phone number/i })).not.toBeInTheDocument()
  })
})
