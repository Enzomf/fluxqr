'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { deleteQrCode } from '@/app/dashboard/qr-actions'
import { QrListRow, type QrCodeWithImage } from '@/components/dashboard/qr-list-row'
import { QrFormDialog } from '@/components/qr-management/qr-form-dialog'
import { EmptyState } from '@/components/shared/empty-state'

interface QrListProps {
  qrCodes: QrCodeWithImage[]
  verifiedPhone: string | null
  ownerName: string
  ownerEmail: string
}

export function QrList({ qrCodes, verifiedPhone, ownerName, ownerEmail }: QrListProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingQr, setEditingQr] = useState<QrCodeWithImage | null>(null)
  const [pulseId, setPulseId] = useState<string | null>(null)

  useEffect(() => {
    if (pulseId) {
      const t = setTimeout(() => setPulseId(null), 700)
      return () => clearTimeout(t)
    }
  }, [pulseId])

  function openCreate() {
    setEditingQr(null)
    setDialogOpen(true)
  }

  function openEdit(qr: QrCodeWithImage) {
    setEditingQr(qr)
    setDialogOpen(true)
  }

  function handleEditSuccess(id: string) {
    setPulseId(id)
  }

  return (
    <div>
      {/* New QR Code button */}
      <div className="flex justify-end mb-4">
        <button
          type="button"
          onClick={openCreate}
          className="bg-brand-500 hover:bg-brand-600 text-white rounded-md px-4 py-2 flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          New QR Code
        </button>
      </div>

      {qrCodes.length === 0 ? (
        <EmptyState onAction={openCreate} />
      ) : (
        <div className="space-y-2">
          {qrCodes.map((qr) => (
            <QrListRow
              key={qr.id}
              qr={qr}
              onDelete={deleteQrCode}
              onEdit={openEdit}
              pulseId={pulseId}
              ownerName={ownerName}
              ownerEmail={ownerEmail}
              ownerPhone={verifiedPhone}
            />
          ))}
        </div>
      )}

      <QrFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        qr={editingQr}
        verifiedPhone={verifiedPhone}
        onEditSuccess={handleEditSuccess}
      />
    </div>
  )
}
