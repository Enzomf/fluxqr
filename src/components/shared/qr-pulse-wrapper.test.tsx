import { render, screen } from '@/test/utils'
import { QrPulseWrapper } from './qr-pulse-wrapper'

describe('QrPulseWrapper', () => {
  it('applies "animate-qr-pulse" class when trigger=true', () => {
    const { container } = render(
      <QrPulseWrapper trigger={true}>
        <span>content</span>
      </QrPulseWrapper>
    )
    expect(container.firstChild).toHaveClass('animate-qr-pulse')
  })

  it('does not apply "animate-qr-pulse" class when trigger=false', () => {
    const { container } = render(
      <QrPulseWrapper trigger={false}>
        <span>content</span>
      </QrPulseWrapper>
    )
    expect(container.firstChild).not.toHaveClass('animate-qr-pulse')
  })

  it('renders children content', () => {
    render(
      <QrPulseWrapper trigger={false}>
        <span>child text</span>
      </QrPulseWrapper>
    )
    expect(screen.getByText('child text')).toBeInTheDocument()
  })

  it('applies "rounded-md" class alongside "animate-qr-pulse" when trigger=true', () => {
    const { container } = render(
      <QrPulseWrapper trigger={true}>
        <span>content</span>
      </QrPulseWrapper>
    )
    expect(container.firstChild).toHaveClass('rounded-md')
  })

  it('does not apply "rounded-md" class when trigger=false', () => {
    const { container } = render(
      <QrPulseWrapper trigger={false}>
        <span>content</span>
      </QrPulseWrapper>
    )
    expect(container.firstChild).not.toHaveClass('rounded-md')
  })
})
