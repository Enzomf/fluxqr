import { render, screen } from '@/test/utils'
import { OtpVerifyForm } from './otp-verify-form'

// Mock Server Actions
vi.mock('@/app/actions/check-otp', () => ({
  checkOtp: vi.fn().mockResolvedValue({ success: true }),
}))

vi.mock('@/app/actions/verify-phone', () => ({
  resendOtp: vi.fn().mockResolvedValue({ success: true }),
  sendOtp: vi.fn(),
}))

// Mock InputOTP components from shadcn/ui — they re-export from input-otp
// which has browser-specific behaviour incompatible with jsdom
vi.mock('@/components/ui/input-otp', () => ({
  InputOTP: ({
    children,
    onChange,
    ...props
  }: {
    children: React.ReactNode
    onChange?: (val: string) => void
    [key: string]: unknown
  }) => (
    <div data-testid="input-otp" {...props}>
      {children}
    </div>
  ),
  InputOTPGroup: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  InputOTPSeparator: () => <span>-</span>,
  InputOTPSlot: ({ index }: { index: number }) => (
    <input data-testid={`otp-slot-${index}`} aria-label={`OTP digit ${index + 1}`} />
  ),
}))

describe('OtpVerifyForm', () => {
  const defaultProps = {
    phone: '+14155551234',
    onVerified: vi.fn(),
  }

  it('renders the verification heading', () => {
    render(<OtpVerifyForm {...defaultProps} />)
    expect(
      screen.getByText(/enter verification code/i)
    ).toBeInTheDocument()
  })

  it('renders masked phone number in the prompt text', () => {
    render(<OtpVerifyForm {...defaultProps} />)
    // The phone +14155551234 → +1 ******-1234
    expect(screen.getByText(/\*+/)).toBeInTheDocument()
  })

  it('renders 6 OTP input slots', () => {
    render(<OtpVerifyForm {...defaultProps} />)
    const slots = screen.getAllByTestId(/otp-slot-/)
    expect(slots).toHaveLength(6)
  })

  it('renders the resend code button', () => {
    render(<OtpVerifyForm {...defaultProps} />)
    expect(
      screen.getByRole('button', { name: /resend code/i })
    ).toBeInTheDocument()
  })

  it('resend button is disabled during initial countdown', () => {
    render(<OtpVerifyForm {...defaultProps} />)
    const resendButton = screen.getByRole('button', { name: /resend code/i })
    expect(resendButton).toBeDisabled()
  })

  it('renders without error for any phone number', () => {
    expect(() =>
      render(<OtpVerifyForm phone="+5511999998888" onVerified={vi.fn()} />)
    ).not.toThrow()
  })
})
