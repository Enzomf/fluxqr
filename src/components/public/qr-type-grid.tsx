'use client'

import { QrCode, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QrTypeGridProps {
  onSelect: (type: 'default' | 'custom') => void
}

export function QrTypeGrid({ onSelect }: QrTypeGridProps) {
  return (
    <div className="w-full grid grid-cols-1 gap-4 md:grid-cols-2">
      <button
        type="button"
        onClick={() => onSelect('default')}
        className={cn(
          'flex flex-col items-start gap-3 rounded-lg p-6',
          'bg-[#1E293B] border border-[#334155]',
          'hover:border-[#6366F1]/50 cursor-pointer transition-colors',
          'text-left'
        )}
      >
        <QrCode size={28} className="text-[#6366F1]" />
        <div>
          <p className="font-semibold text-white">My QR Code</p>
          <p className="mt-1 text-sm text-[#94A3B8]">
            Default WhatsApp QR for your verified number. No custom message.
          </p>
        </div>
      </button>

      <button
        type="button"
        onClick={() => onSelect('custom')}
        className={cn(
          'flex flex-col items-start gap-3 rounded-lg p-6',
          'bg-[#1E293B] border border-[#334155]',
          'hover:border-[#6366F1]/50 cursor-pointer transition-colors',
          'text-left'
        )}
      >
        <MessageSquare size={28} className="text-[#6366F1]" />
        <div>
          <p className="font-semibold text-white">Custom QR</p>
          <p className="mt-1 text-sm text-[#94A3B8]">
            Add a custom pre-filled message to your WhatsApp QR code.
          </p>
        </div>
      </button>
    </div>
  )
}
