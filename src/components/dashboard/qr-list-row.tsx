'use client'

import Link from 'next/link'
import { Pencil, Download } from 'lucide-react'
import { PlatformBadge } from '@/components/shared/platform-badge'
import { DeleteButton } from '@/components/dashboard/delete-button'
import { QrPulseWrapper } from '@/components/shared/qr-pulse-wrapper'
import { downloadQrPng } from '@/lib/qr-generator'
import { formatScanCount } from '@/lib/utils'
import type { QrCode } from '@/types'

export type QrCodeWithImage = QrCode & { dataUrl: string }

interface QrListRowProps {
  qr: QrCodeWithImage
  onDelete: (id: string) => Promise<{ error?: string }>
  pulseId?: string | null
}

export function QrListRow({ qr, onDelete, pulseId }: QrListRowProps) {
  return (
    <QrPulseWrapper trigger={pulseId === qr.id}>
      <div className="flex flex-col md:flex-row md:items-center gap-3 bg-[#1E293B] rounded-lg p-4 border border-[#334155]">
        {/* Thumbnail */}
        <img
          src={qr.dataUrl}
          alt={qr.label}
          width={40}
          height={40}
          className="rounded shrink-0"
        />

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-1">
          <p className="font-medium text-sm truncate">{qr.label}</p>
          <p className="text-xs text-muted-foreground font-mono truncate">/q/{qr.slug}</p>
          <PlatformBadge platform={qr.platform} />
        </div>

        {/* Scan count + Actions */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm min-w-[3rem] text-right">
            {formatScanCount(qr.scan_count)}
          </span>

          {/* Edit */}
          <Link
            href={`/dashboard/${qr.id}/edit`}
            className="inline-flex items-center justify-center size-9 rounded-md text-muted-foreground hover:text-foreground transition-colors hover:bg-accent"
            aria-label="Edit QR code"
          >
            <Pencil size={16} />
          </Link>

          {/* Download */}
          <button
            type="button"
            onClick={() => downloadQrPng(qr.dataUrl, qr.slug)}
            className="inline-flex items-center justify-center size-9 rounded-md text-muted-foreground hover:text-foreground transition-colors hover:bg-accent"
            aria-label="Download QR code"
          >
            <Download size={16} />
          </button>

          {/* Delete */}
          <DeleteButton id={qr.id} label={qr.label} onDelete={onDelete} />
        </div>
      </div>
    </QrPulseWrapper>
  )
}
