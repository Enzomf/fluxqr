"use client"

import { useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TelegramFallbackProps {
  message: string
  contactTarget: string
  onMessageChange: (msg: string) => void
  label: string
}

export function TelegramFallback({
  message,
  contactTarget,
  onMessageChange,
  label,
}: TelegramFallbackProps) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(message)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleOpen() {
    window.location.href = `https://t.me/${contactTarget}`
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-surface">
      <div className="bg-surface-raised rounded-lg p-8 w-full max-w-sm">
        <h1 className="text-foreground font-semibold text-lg">{label}</h1>

        <textarea
          className="w-full mt-4 bg-surface-overlay text-foreground p-3 text-sm rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          maxLength={500}
          rows={4}
          placeholder="Digite sua mensagem..."
        />

        <p className="text-xs text-muted-foreground mt-3">
          O Telegram nao suporta mensagens pre-preenchidas. Copie e cole no chat.
        </p>

        <div className="flex flex-col gap-2 mt-4">
          <Button
            variant="outline"
            onClick={handleCopy}
            disabled={!message.trim()}
          >
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Mensagem copiada!
              </>
            ) : (
              'Copiar mensagem'
            )}
          </Button>

          <Button
            style={{ backgroundColor: '#0088CC', color: '#fff' }}
            onClick={handleOpen}
          >
            Abrir Telegram
          </Button>
        </div>
      </div>
    </main>
  )
}
