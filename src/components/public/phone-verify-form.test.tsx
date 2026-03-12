import { render, screen, userEvent } from '@/test/utils'
import { PhoneVerifyForm } from './phone-verify-form'

// Mock Server Actions
vi.mock('@/app/actions/verify-phone', () => ({
  sendOtp: vi.fn().mockResolvedValue({ success: true, phone: '+14155551234' }),
  resendOtp: vi.fn(),
}))

describe('PhoneVerifyForm', () => {
  const onVerificationSent = vi.fn()

  it('renders the "Verify your phone number" heading', () => {
    render(<PhoneVerifyForm onVerificationSent={onVerificationSent} />)
    expect(
      screen.getByText(/verify your phone number/i)
    ).toBeInTheDocument()
  })

  it('renders the phone number input field', () => {
    render(<PhoneVerifyForm onVerificationSent={onVerificationSent} />)
    expect(screen.getByPlaceholderText('555 123 4567')).toBeInTheDocument()
  })

  it('renders the country code selector', () => {
    render(<PhoneVerifyForm onVerificationSent={onVerificationSent} />)
    expect(screen.getByRole('combobox', { name: /country code/i })).toBeInTheDocument()
  })

  it('renders the "Send verification code" submit button', () => {
    render(<PhoneVerifyForm onVerificationSent={onVerificationSent} />)
    expect(
      screen.getByRole('button', { name: /send verification code/i }
      )
    ).toBeInTheDocument()
  })

  it('includes multiple country code options', () => {
    render(<PhoneVerifyForm onVerificationSent={onVerificationSent} />)
    const select = screen.getByRole('combobox', { name: /country code/i })
    const options = select.querySelectorAll('option')
    expect(options.length).toBeGreaterThan(1)
  })

  it('allows typing into the phone number input', async () => {
    const user = userEvent.setup()
    render(<PhoneVerifyForm onVerificationSent={onVerificationSent} />)
    const input = screen.getByPlaceholderText('555 123 4567')
    await user.type(input, '5551234567')
    expect(input).toHaveValue('5551234567')
  })

  it('renders the informational subtext about the 6-digit code', () => {
    render(<PhoneVerifyForm onVerificationSent={onVerificationSent} />)
    expect(screen.getByText(/6-digit code/i)).toBeInTheDocument()
  })
})
