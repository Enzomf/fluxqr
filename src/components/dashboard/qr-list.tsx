'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { deleteQrCode } from '@/app/dashboard/[id]/edit/actions'
import { QrListRow, type QrCodeWithImage } from '@/components/dashboard/qr-list-row'

interface QrListProps {
  qrCodes: QrCodeWithImage[]
}

export function QrList({ qrCodes }: QrListProps) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const successType = searchParams.get('success')
  const editedId = searchParams.get('id')

  useEffect(() => {
    if (successType === 'edit') {
      toast.success('QR code updated successfully')
      router.replace('/dashboard', { scroll: false })
    }
  }, [successType, router])

  return (
    <div className="space-y-2">
      {qrCodes.map((qr) => (
        <QrListRow
          key={qr.id}
          qr={qr}
          onDelete={deleteQrCode}
          pulseId={editedId}
        />
      ))}
    </div>
  )
}
