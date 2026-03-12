'use client'

import { useState, useTransition } from 'react'
import { Phone } from 'lucide-react'
import { createPublicQr } from '@/app/actions/create-public-qr'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PublicQrFormProps {
  qrType: 'default' | 'custom'
  phone: string
  onResult: (qrData: { slug: string; dataUrl: string; label: string }) => void
  onGateHit: () => void
  onBack: () => void
}

export function PublicQrForm({
  qrType,
  phone,
  onResult,
  onGateHit,
  onBack,
}: PublicQrFormProps) {
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleGenerate() {
    setError(null)
    startTransition(async () => {
      const result = await createPublicQr(
        qrType === 'custom' ? message : null
      )

      if (result.gate) {
        onGateHit()
        return
      }

      if (result.error) {
        setError(result.error)
        return
      }

      if (result.qrData) {
        onResult(result.qrData)
      }
    })
  }

  return (
    <div
      className={cn(
        'w-full rounded-lg p-6',
        'bg-surface-raised border border-surface-overlay'
      )}
    >
      <div className="flex flex-col gap-4">
        {qrType === 'custom' && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-white">
              Your message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type the message that will appear when someone scans your QR code..."
              rows={4}
              className={cn(
                'rounded-md border border-surface-overlay bg-surface px-3 py-2',
                'text-sm text-white placeholder:text-slate-500',
                'focus:outline-none focus:ring-2 focus:ring-brand-500',
                'resize-none'
              )}
            />
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-white">Your number</label>
          <div className="flex items-center gap-2 rounded-md bg-surface border border-surface-overlay px-3 py-2">
            <Phone size={14} className="text-brand-500" />
            <span className="text-sm text-white font-mono">{phone}</span>
          </div>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <Button
          type="button"
          onClick={handleGenerate}
          disabled={isPending}
          className={cn(
            'w-full bg-brand-500 text-white hover:bg-brand-600',
            'disabled:opacity-60'
          )}
        >
          {isPending ? 'Generating...' : `Generate QR for ${phone}`}
        </Button>

        <button
          type="button"
          onClick={onBack}
          disabled={isPending}
          className="text-sm text-slate-400 hover:text-white transition-colors disabled:opacity-40"
        >
          Back
        </button>
      </div>
    </div>
  )
}
