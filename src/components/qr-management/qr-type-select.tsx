'use client'

import { QrCode, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QrTypeSelectProps {
  onSelect: (type: 'default' | 'custom') => void
}

export function QrTypeSelect({ onSelect }: QrTypeSelectProps) {
  return (
    <div className="w-full grid grid-cols-1 gap-4 md:grid-cols-2">
      <button
        type="button"
        onClick={() => onSelect('default')}
        className={cn(
          'flex flex-col items-start gap-3 rounded-lg p-6',
          'bg-surface-raised border border-surface-overlay',
          'hover:border-brand-500/50 cursor-pointer transition-colors',
          'text-left'
        )}
      >
        <QrCode size={28} className="text-brand-500" />
        <div>
          <p className="font-semibold text-white">Meu QR Code</p>
          <p className="mt-1 text-sm text-slate-400">
            Your default QR code. No custom message.
          </p>
        </div>
      </button>

      <button
        type="button"
        onClick={() => onSelect('custom')}
        className={cn(
          'flex flex-col items-start gap-3 rounded-lg p-6',
          'bg-surface-raised border border-surface-overlay',
          'hover:border-brand-500/50 cursor-pointer transition-colors',
          'text-left'
        )}
      >
        <MessageSquare size={28} className="text-brand-500" />
        <div>
          <p className="font-semibold text-white">Custom QR</p>
          <p className="mt-1 text-sm text-slate-400">
            QR code with a custom pre-filled message.
          </p>
        </div>
      </button>
    </div>
  )
}
