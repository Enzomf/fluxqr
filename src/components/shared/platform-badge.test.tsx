import { render, screen } from '@/test/utils'
import { PlatformBadge } from './platform-badge'

describe('PlatformBadge', () => {
  it('renders "WhatsApp" label for platform="whatsapp"', () => {
    render(<PlatformBadge platform="whatsapp" />)
    expect(screen.getByText('WhatsApp')).toBeInTheDocument()
  })

  it('renders "SMS" label for platform="sms"', () => {
    render(<PlatformBadge platform="sms" />)
    expect(screen.getByText('SMS')).toBeInTheDocument()
  })

  it('renders a badge element containing the platform label', () => {
    const { container } = render(<PlatformBadge platform="whatsapp" />)
    expect(container.firstChild).toBeInTheDocument()
    expect(container.textContent).toBe('WhatsApp')
  })

  it('renders different labels for different platforms', () => {
    const { rerender } = render(<PlatformBadge platform="whatsapp" />)
    expect(screen.getByText('WhatsApp')).toBeInTheDocument()

    rerender(<PlatformBadge platform="sms" />)
    expect(screen.getByText('SMS')).toBeInTheDocument()
    expect(screen.queryByText('WhatsApp')).not.toBeInTheDocument()
  })
})
