'use client'

import { downloadQrPng } from '@/lib/qr-generator'

export function useQrImage(slug: string, dataUrl: string) {
  return {
    dataUrl,
    download: () => downloadQrPng(dataUrl, slug),
  }
}
