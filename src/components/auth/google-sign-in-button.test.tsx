import { render, screen } from '@/test/utils'
import { GoogleSignInButton } from './google-sign-in-button'

// Mock the Server Action to avoid importing server-only modules in jsdom
vi.mock('@/app/login/actions', () => ({
  signInWithGoogle: vi.fn(),
}))

describe('GoogleSignInButton', () => {
  it('renders "Continue with Google" button text', () => {
    render(<GoogleSignInButton />)
    expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument()
  })

  it('renders a form element wrapping the button', () => {
    const { container } = render(<GoogleSignInButton />)
    expect(container.querySelector('form')).toBeInTheDocument()
  })

  it('button has type="submit"', () => {
    render(<GoogleSignInButton />)
    const button = screen.getByRole('button', { name: /continue with google/i })
    expect(button).toHaveAttribute('type', 'submit')
  })

  it('renders Google SVG icon with aria-hidden', () => {
    const { container } = render(<GoogleSignInButton />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('aria-hidden', 'true')
  })
})
