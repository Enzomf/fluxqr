'use client'

import { useEffect, useRef, useState } from 'react'

export type SlugStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid'

const SLUG_REGEX = /^[a-z0-9-]+$/
const DEBOUNCE_MS = 300

export function useSlugCheck(slug: string, currentSlug?: string): SlugStatus {
  const [status, setStatus] = useState<SlugStatus>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Clear any pending debounced check
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    if (!slug) {
      setStatus('idle')
      return
    }

    // In edit mode: skip check if slug is unchanged
    if (currentSlug && slug === currentSlug) {
      setStatus('available')
      return
    }

    if (!SLUG_REGEX.test(slug)) {
      setStatus('invalid')
      return
    }

    setStatus('checking')

    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/slug-check?slug=${encodeURIComponent(slug)}`)
        const data = await res.json() as { available: boolean }
        setStatus(data.available ? 'available' : 'taken')
      } catch {
        setStatus('idle')
      }
    }, DEBOUNCE_MS)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [slug, currentSlug])

  return status
}
