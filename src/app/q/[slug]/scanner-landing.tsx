"use client"

import { useState } from 'react'
import { MessageCircle, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { buildPlatformUrl, platformColor, platformLabel } from '@/lib/redirect'
import { TelegramFallback } from '@/components/scanner/telegram-fallback'
import type { QrCode } from '@/types'

interface ScannerLandingProps {
  qr: QrCode
}

export function ScannerLanding({ qr }: ScannerLandingProps) {
  const [message, setMessage] = useState(qr.default_message ?? '')

  if (qr.platform === 'telegram') {
    return (
      <TelegramFallback
        message={message}
        contactTarget={qr.contact_target}
        onMessageChange={setMessage}
        label={qr.label}
      />
    )
  }

  function handleCta() {
    window.location.href = buildPlatformUrl(qr.platform, qr.contact_target, message)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-surface">
      <div className="bg-surface-raised rounded-lg p-8 w-full max-w-sm">
        <h1 className="text-foreground font-semibold text-lg">{qr.label}</h1>

        <textarea
          className="w-full mt-4 bg-surface-overlay text-foreground p-3 text-sm rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={500}
          rows={4}
          placeholder="Digite sua mensagem..."
        />
        <p className="mt-1 text-xs text-muted-foreground text-right">
          {message.length}/500
        </p>

        <Button
          className="w-full mt-4"
          disabled={!message.trim()}
          style={{ backgroundColor: platformColor(qr.platform), color: '#fff' }}
          onClick={handleCta}
        >
          {qr.platform === 'whatsapp' ? (
            <MessageCircle className="mr-2 h-5 w-5" />
          ) : (
            <MessageSquare className="mr-2 h-5 w-5" />
          )}
          {platformLabel(qr.platform)}
        </Button>
      </div>
    </main>
  )
}
