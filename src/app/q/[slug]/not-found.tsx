import { ScannerError } from '@/components/scanner/scanner-error'

export default function NotFound() {
  return (
    <ScannerError
      statusCode="404"
      title="Link not found"
      description="This QR code link doesn't exist or may have been removed."
    />
  )
}
