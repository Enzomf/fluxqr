'use client'

import { deleteQrCode } from '@/app/dashboard/[id]/edit/actions'
import { QrListRow, type QrCodeWithImage } from '@/components/dashboard/qr-list-row'

interface QrListProps {
  qrCodes: QrCodeWithImage[]
}

export function QrList({ qrCodes }: QrListProps) {
  return (
    <div className="space-y-2">
      {qrCodes.map((qr) => (
        <QrListRow key={qr.id} qr={qr} onDelete={deleteQrCode} />
      ))}
    </div>
  )
}
