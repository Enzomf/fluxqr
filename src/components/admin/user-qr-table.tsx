'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { cn, formatScanCount } from '@/lib/utils'
import { PlatformBadge } from '@/components/shared/platform-badge'
import { deactivateQrCode } from '@/app/actions/admin-actions'
import type { Platform } from '@/types'

type AdminQrRow = {
  id: string
  slug: string
  label: string
  platform: Platform
  contact_target: string
  scan_count: number
  is_active: boolean
  created_at: string
}

interface UserQrTableProps {
  qrCodes: AdminQrRow[]
  userName: string
}

function QrRowItem({ qr }: { qr: AdminQrRow }) {
  const [isPending, startTransition] = useTransition()

  function handleDeactivate() {
    if (!window.confirm(`Deactivate QR code '${qr.label}'?`)) return
    startTransition(() => {
      deactivateQrCode(qr.id)
    })
  }

  return (
    <tr className="border-b border-border hover:bg-surface-overlay/30 transition-colors">
      <td className="px-4 py-3 text-sm font-medium text-foreground">{qr.label}</td>
      <td className="px-4 py-3">
        <code className="text-xs text-muted-foreground font-mono bg-surface-raised px-1.5 py-0.5 rounded">
          {qr.slug}
        </code>
      </td>
      <td className="px-4 py-3">
        <PlatformBadge platform={qr.platform} />
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground font-mono">{qr.contact_target}</td>
      <td className="px-4 py-3 text-sm text-center">{formatScanCount(qr.scan_count)}</td>
      <td className="px-4 py-3">
        <span
          className={cn(
            'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium',
            qr.is_active
              ? 'bg-emerald-500/10 text-emerald-400'
              : 'bg-danger/10 text-danger'
          )}
        >
          {qr.is_active ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="px-4 py-3">
        {qr.is_active && (
          <button
            onClick={handleDeactivate}
            disabled={isPending}
            className={cn(
              'text-xs px-3 py-1 rounded-md border transition-colors',
              isPending
                ? 'border-border text-muted-foreground cursor-not-allowed opacity-50'
                : 'border-danger/40 text-danger hover:bg-danger/10'
            )}
          >
            {isPending ? 'Deactivating…' : 'Deactivate'}
          </button>
        )}
      </td>
    </tr>
  )
}

export function UserQrTable({ qrCodes, userName }: UserQrTableProps) {
  return (
    <div className="space-y-4">
      <Link
        href="/admin"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
      >
        &larr; Back to all users
      </Link>

      <h2 className="text-xl font-semibold">{userName}&apos;s QR Codes</h2>

      {qrCodes.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
          No QR codes found for this user
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-surface-raised border-b border-border">
              <tr>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Label</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Slug</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Platform</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Contact</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider text-center">Scans</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-border">
              {qrCodes.map((qr) => (
                <QrRowItem key={qr.id} qr={qr} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
