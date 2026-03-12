import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateQrDataUrl, downloadQrPng } from './qr-generator'

vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,mockdata'),
  },
}))

// Import the mocked QRCode after vi.mock is hoisted
import QRCode from 'qrcode'

describe('generateQrDataUrl', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls QRCode.toDataURL with the correct URL built from baseUrl + slug', async () => {
    await generateQrDataUrl('my-slug', 'https://example.com')

    expect(QRCode.toDataURL).toHaveBeenCalledOnce()
    expect(QRCode.toDataURL).toHaveBeenCalledWith(
      'https://example.com/q/my-slug',
      expect.any(Object)
    )
  })

  it('passes the correct error correction level (H), width (400), and margin (2)', async () => {
    await generateQrDataUrl('my-slug', 'https://example.com')

    expect(QRCode.toDataURL).toHaveBeenCalledWith(expect.any(String), {
      errorCorrectionLevel: 'H',
      width: 400,
      margin: 2,
      color: {
        dark: '#0F172A',
        light: '#FFFFFF',
      },
    })
  })

  it('returns the data URL resolved by QRCode.toDataURL', async () => {
    const result = await generateQrDataUrl('my-slug', 'https://example.com')
    expect(result).toBe('data:image/png;base64,mockdata')
  })
})

describe('downloadQrPng', () => {
  it('creates an anchor, sets href and download filename, and clicks it', () => {
    const mockAnchor = {
      href: '',
      download: '',
      click: vi.fn(),
    }

    vi.spyOn(document, 'createElement').mockReturnValueOnce(
      mockAnchor as unknown as HTMLAnchorElement
    )

    downloadQrPng('data:image/png;base64,mockdata', 'test-slug')

    expect(document.createElement).toHaveBeenCalledWith('a')
    expect(mockAnchor.href).toBe('data:image/png;base64,mockdata')
    expect(mockAnchor.download).toBe('test-slug-fluxqr.png')
    expect(mockAnchor.click).toHaveBeenCalledOnce()
  })
})
