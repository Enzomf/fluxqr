'use client'

import { useState, useTransition } from 'react'
import { createPublicQr } from '@/app/actions/create-public-qr'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PublicQrFormProps {
  qrType: 'default' | 'custom'
  onResult: (qrData: { slug: string; dataUrl: string; label: string }) => void
  onGateHit: () => void
  onBack: () => void
}

export function PublicQrForm({
  qrType,
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
        'bg-[#1E293B] border border-[#334155]'
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
                'rounded-md border border-[#334155] bg-[#0F172A] px-3 py-2',
                'text-sm text-white placeholder:text-[#64748B]',
                'focus:outline-none focus:ring-2 focus:ring-[#6366F1]',
                'resize-none'
              )}
            />
          </div>
        )}

        {error && <p className="text-xs text-red-400">{error}</p>}

        <Button
          type="button"
          onClick={handleGenerate}
          disabled={isPending}
          className={cn(
            'w-full bg-[#6366F1] text-white hover:bg-[#4F46E5]',
            'disabled:opacity-60'
          )}
        >
          {isPending ? 'Generating...' : 'Generate QR Code'}
        </Button>

        <button
          type="button"
          onClick={onBack}
          disabled={isPending}
          className="text-sm text-[#94A3B8] hover:text-white transition-colors disabled:opacity-40"
        >
          Back
        </button>
      </div>
    </div>
  )
}
