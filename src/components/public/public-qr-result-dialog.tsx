'use client'

import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import { X, Download, Link2, Check } from 'lucide-react'
import { downloadQrPng } from '@/lib/qr-generator'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { cn } from '@/lib/utils'

interface PublicQrResultDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  qrData: { slug: string; dataUrl: string; label: string } | null
}

export function PublicQrResultDialog({
  open,
  onOpenChange,
  qrData,
}: PublicQrResultDialogProps) {
  const { copied, copy } = useCopyToClipboard()

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (typeof window !== 'undefined' ? window.location.origin : '')

  if (!qrData) return null

  function handleDownload() {
    if (!qrData) return
    downloadQrPng(qrData.dataUrl, qrData.slug)
  }

  function handleCopyLink() {
    if (!qrData) return
    copy(`${siteUrl}/q/${qrData.slug}`)
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        {/* Dark blur backdrop */}
        <DialogPrimitive.Backdrop
          className={cn(
            'fixed inset-0 isolate z-50',
            'bg-black/60 backdrop-blur-sm',
            'duration-300',
            'data-open:animate-in data-open:fade-in-0',
            'data-closed:animate-out data-closed:fade-out-0'
          )}
        />

        {/* Dialog popup */}
        <DialogPrimitive.Popup
          className={cn(
            'fixed top-1/2 left-1/2 z-50',
            '-translate-x-1/2 -translate-y-1/2',
            'w-auto p-6 rounded-xl',
            'bg-background ring-1 ring-foreground/10',
            'duration-300 outline-none',
            'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95',
            'data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95'
          )}
        >
          <DialogPrimitive.Title className="sr-only">
            {qrData.label} — QR Code Ready
          </DialogPrimitive.Title>

          {/* Close button */}
          <DialogPrimitive.Close
            className={cn(
              'absolute top-3 right-3',
              'inline-flex items-center justify-center',
              'size-8 rounded-md',
              'text-muted-foreground hover:text-foreground hover:bg-accent',
              'transition-colors'
            )}
            aria-label="Close dialog"
          >
            <X size={20} />
          </DialogPrimitive.Close>

          {/* Content */}
          <div className="flex flex-col items-center gap-4">
            {/* QR image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrData.dataUrl}
              alt={qrData.label}
              width={280}
              height={280}
              className="rounded-lg w-[280px] max-w-[calc(100vw-4rem)] aspect-square"
            />

            {/* Labels */}
            <div className="text-center space-y-1">
              <p className="text-lg font-semibold">{qrData.label}</p>
              <p className="text-sm text-muted-foreground">
                Your QR code is ready!
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-2">
              <button
                type="button"
                onClick={handleDownload}
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2 rounded-md',
                  'text-sm font-medium',
                  'bg-[#6366F1] text-white hover:bg-[#4F46E5]',
                  'transition-colors'
                )}
              >
                <Download size={16} />
                Download
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2 rounded-md',
                  'text-sm font-medium transition-colors',
                  copied
                    ? 'text-success hover:text-success hover:bg-accent'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                {copied ? <Check size={16} /> : <Link2 size={16} />}
                {copied ? 'Copied!' : 'Copy link'}
              </button>
            </div>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
