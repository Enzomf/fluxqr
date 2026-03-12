import { render, screen, userEvent } from '@/test/utils'
import { QrTypeGrid } from './qr-type-grid'

describe('QrTypeGrid', () => {
  it('renders "My QR Code" card', () => {
    render(<QrTypeGrid onSelect={vi.fn()} />)
    expect(screen.getByText('My QR Code')).toBeInTheDocument()
  })

  it('renders "Custom QR" card', () => {
    render(<QrTypeGrid onSelect={vi.fn()} />)
    expect(screen.getByText('Custom QR')).toBeInTheDocument()
  })

  it('renders two selectable buttons', () => {
    render(<QrTypeGrid onSelect={vi.fn()} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(2)
  })

  it('calls onSelect("default") when "My QR Code" card is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<QrTypeGrid onSelect={onSelect} />)
    await user.click(screen.getByText('My QR Code'))
    expect(onSelect).toHaveBeenCalledWith('default')
  })

  it('calls onSelect("custom") when "Custom QR" card is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<QrTypeGrid onSelect={onSelect} />)
    await user.click(screen.getByText('Custom QR'))
    expect(onSelect).toHaveBeenCalledWith('custom')
  })

  it('renders description for the default QR type', () => {
    render(<QrTypeGrid onSelect={vi.fn()} />)
    expect(screen.getByText(/no custom message/i)).toBeInTheDocument()
  })

  it('renders description for the custom QR type', () => {
    render(<QrTypeGrid onSelect={vi.fn()} />)
    expect(screen.getByText(/custom pre-filled message/i)).toBeInTheDocument()
  })
})
