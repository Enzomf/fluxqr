import QRCode from 'qrcode'

/**
 * Generates a QR code data URL for the given slug.
 * @param slug - The QR code slug
 * @param baseUrl - The base URL (e.g. https://fluxqr-olive.vercel.app)
 */
export async function generateQrDataUrl(slug: string, baseUrl: string): Promise<string> {
  const url = `${baseUrl}/q/${slug}`
  return QRCode.toDataURL(url, {
    errorCorrectionLevel: 'H',
    width: 400,
    margin: 2,
    color: {
      dark: '#0F172A',
      light: '#FFFFFF',
    },
  })
}

/**
 * Downloads the QR code as a PNG file.
 * Call from Client Components only — uses DOM APIs.
 */
export function downloadQrPng(dataUrl: string, slug: string): void {
  const anchor = document.createElement('a')
  anchor.href = dataUrl
  anchor.download = `${slug}-fluxqr.png`
  anchor.click()
}
