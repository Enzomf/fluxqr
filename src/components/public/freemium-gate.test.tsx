import { render, screen } from '@/test/utils'
import { FreemiumGate } from './freemium-gate'

vi.mock('@/app/login/actions', () => ({
  signInWithGoogle: vi.fn(),
}))

describe('FreemiumGate', () => {
  it('renders the 5 free QR codes limit heading', () => {
    render(<FreemiumGate />)
    expect(
      screen.getByText(/you've used your 5 free qr codes/i)
    ).toBeInTheDocument()
  })

  it('renders sign-up with Google prompt text', () => {
    render(<FreemiumGate />)
    expect(screen.getByText(/sign up with google/i)).toBeInTheDocument()
  })

  it('renders "Continue with Google" button', () => {
    render(<FreemiumGate />)
    expect(
      screen.getByRole('button', { name: /continue with google/i })
    ).toBeInTheDocument()
  })

  it('renders the FluxQR logo image', () => {
    render(<FreemiumGate />)
    expect(screen.getByAltText('FluxQR')).toBeInTheDocument()
  })

  it('renders without error when className is provided', () => {
    expect(() =>
      render(<FreemiumGate className="custom-class" />)
    ).not.toThrow()
  })
})
