import Link from 'next/link'
import { QrCode, Plus } from 'lucide-react'

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <QrCode size={48} className="text-muted-foreground mb-4" />
      <h2 className="text-xl font-semibold mb-2">No QR codes yet</h2>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Create your first QR code to start routing scans to the right messaging app instantly.
      </p>
      <Link
        href="/dashboard/new"
        className="bg-brand-500 hover:bg-brand-600 text-white rounded-md px-4 py-2 flex items-center gap-2 text-sm font-medium transition-colors"
      >
        <Plus size={16} />
        Create your first QR code
      </Link>
    </div>
  )
}
