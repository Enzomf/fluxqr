'use client'

import { useMemo } from 'react'
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import { X, Share2, Check, Link2 } from 'lucide-react'
import { PlatformBadge } from '@/components/shared/platform-badge'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { formatScanCount } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { QrCodeWithImage } from './qr-list-row'

interface QrPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  qr: QrCodeWithImage
  thumbnailRect: DOMRect | null
}

export function QrPreviewDialog({
  open,
  onOpenChange,
  qr,
  thumbnailRect,
}: QrPreviewDialogProps) {
  const { copied, copy } = useCopyToClipboard()

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (typeof window !== 'undefined' ? window.location.origin : '')

  const canShare =
    typeof navigator !== 'undefined' && 'share' in navigator

  // Derive transform-origin from thumbnail rect (no side-effect needed)
  const transformOrigin = useMemo(() => {
    if (!open || !thumbnailRect || typeof window === 'undefined') return undefined
    const vw = window.innerWidth
    const vh = window.innerHeight
    const thumbCenterX = thumbnailRect.left + thumbnailRect.width / 2
    const thumbCenterY = thumbnailRect.top + thumbnailRect.height / 2
    const originX = thumbCenterX - (vw / 2 - 140)
    const originY = thumbCenterY - (vh / 2 - 140)
    return `${originX}px ${originY}px`
  }, [open, thumbnailRect])

  async function handleShare() {
    try {
      await navigator.share({
        title: `${qr.label} — FluxQR`,
        url: `${siteUrl}/q/${qr.slug}`,
      })
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      console.error('Share failed:', err)
    }
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
            'data-closed:animate-out data-closed:fade-out-0',
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
            'data-open:animate-in data-open:fade-in-0',
            'data-closed:animate-out data-closed:fade-out-0',
          )}
        >
          {/* Accessible title (screen-reader only) */}
          <DialogPrimitive.Title className="sr-only">
            {qr.label} QR Preview
          </DialogPrimitive.Title>

          {/* Close button */}
          <DialogPrimitive.Close
            className={cn(
              'absolute top-3 right-3',
              'inline-flex items-center justify-center',
              'size-8 rounded-md',
              'text-muted-foreground hover:text-foreground hover:bg-accent',
              'transition-colors',
            )}
            aria-label="Close preview"
          >
            <X size={20} />
          </DialogPrimitive.Close>

          {/* Content */}
          <div className="flex flex-col items-center gap-4">
            {/* QR image with pop animation */}
            <img
              src={qr.dataUrl}
              alt={qr.label}
              width={280}
              height={280}
              className="rounded-lg w-[280px] max-w-[calc(100vw-4rem)] aspect-square"
              style={{
                transformOrigin: transformOrigin ?? 'center',
                animation: open
                  ? 'qr-pop-open 300ms ease-out forwards'
                  : 'qr-pop-close 200ms ease-in forwards',
              }}
            />

            {/* Metadata */}
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold">{qr.label}</p>
              <div className="flex items-center justify-center gap-2">
                <PlatformBadge platform={qr.platform} />
                <span className="text-sm text-muted-foreground">
                  {formatScanCount(qr.scan_count)} scans
                </span>
              </div>
            </div>

            {/* Share actions */}
            <div className="flex items-center gap-3 mt-2">
              {canShare && (
                <button
                  type="button"
                  onClick={handleShare}
                  className={cn(
                    'inline-flex items-center gap-2 px-4 py-2 rounded-md',
                    'text-sm font-medium',
                    'text-muted-foreground hover:text-foreground hover:bg-accent',
                    'transition-colors',
                  )}
                >
                  <Share2 size={16} />
                  Share
                </button>
              )}
              <button
                type="button"
                onClick={() => copy(`${siteUrl}/q/${qr.slug}`)}
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2 rounded-md',
                  'text-sm font-medium transition-colors',
                  copied
                    ? 'text-success hover:text-success hover:bg-accent'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent',
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
