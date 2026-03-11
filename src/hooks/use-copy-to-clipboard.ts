'use client'

import { useCallback, useRef, useState } from 'react'

export function useCopyToClipboard(): {
  copied: boolean
  copy: (text: string) => Promise<void>
} {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const copy = useCallback(async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)

      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }

      timerRef.current = setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch {
      // Clipboard API may be denied in some contexts — silently fail
    }
  }, [])

  return { copied, copy }
}
