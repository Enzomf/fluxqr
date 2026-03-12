import { render, screen } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import { QrTypeSelect } from './qr-type-select'

describe('QrTypeSelect', () => {
  it('renders "Meu QR Code" button text', () => {
    render(<QrTypeSelect onSelect={vi.fn()} />)
    expect(screen.getByText('Meu QR Code')).toBeInTheDocument()
  })

  it('renders "Custom QR" button text', () => {
    render(<QrTypeSelect onSelect={vi.fn()} />)
    expect(screen.getByText('Custom QR')).toBeInTheDocument()
  })

  it('calls onSelect("default") when "Meu QR Code" card is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<QrTypeSelect onSelect={onSelect} />)

    await user.click(screen.getByText('Meu QR Code'))

    expect(onSelect).toHaveBeenCalledWith('default')
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('calls onSelect("custom") when "Custom QR" card is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<QrTypeSelect onSelect={onSelect} />)

    await user.click(screen.getByText('Custom QR'))

    expect(onSelect).toHaveBeenCalledWith('custom')
    expect(onSelect).toHaveBeenCalledTimes(1)
  })
})
