import { render, screen } from '@/test/utils'
import { ScannerError } from './scanner-error'

describe('ScannerError', () => {
  const defaultProps = {
    title: 'QR Code Not Found',
    description: 'This QR code does not exist or has been removed.',
  }

  it('renders the title text', () => {
    render(<ScannerError {...defaultProps} />)
    expect(screen.getByText('QR Code Not Found')).toBeInTheDocument()
  })

  it('renders the description text', () => {
    render(<ScannerError {...defaultProps} />)
    expect(screen.getByText('This QR code does not exist or has been removed.')).toBeInTheDocument()
  })

  it('renders the status code when provided', () => {
    render(<ScannerError {...defaultProps} statusCode="404" />)
    expect(screen.getByText('404')).toBeInTheDocument()
  })

  it('does not render a status code element when statusCode is not provided', () => {
    render(<ScannerError {...defaultProps} />)
    // A numeric status like "404" or "410" should not appear
    expect(screen.queryByText('404')).not.toBeInTheDocument()
    expect(screen.queryByText('410')).not.toBeInTheDocument()
  })

  it('renders "FluxQR" brand text', () => {
    render(<ScannerError {...defaultProps} />)
    expect(screen.getByText('FluxQR')).toBeInTheDocument()
  })

  it('renders the logo image with alt="FluxQR"', () => {
    render(<ScannerError {...defaultProps} />)
    expect(screen.getByRole('img', { name: 'FluxQR' })).toBeInTheDocument()
  })

  it('renders "Powered by FluxQR" footer text', () => {
    render(<ScannerError {...defaultProps} />)
    expect(screen.getByText('Powered by FluxQR')).toBeInTheDocument()
  })

  it('renders title in an h1 element', () => {
    render(<ScannerError {...defaultProps} />)
    expect(screen.getByRole('heading', { name: 'QR Code Not Found' })).toBeInTheDocument()
  })

  it('renders a different status code when provided', () => {
    render(<ScannerError {...defaultProps} statusCode="410" />)
    expect(screen.getByText('410')).toBeInTheDocument()
  })
})
