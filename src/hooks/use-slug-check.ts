'use client'

import { useEffect, useRef, useState } from 'react'

export type SlugStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid'

const SLUG_REGEX = /^[a-z0-9-]+$/
const DEBOUNCE_MS = 300

export function useSlugCheck(slug: string, currentSlug?: string): SlugStatus {
  const [asyncStatus, setAsyncStatus] = useState<'idle' | 'available' | 'taken'>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Derive synchronous status outside useEffect — no setState needed for these cases
  const syncStatus: SlugStatus | null =
    !slug ? 'idle' :
    (currentSlug && slug === currentSlug) ? 'available' :
    !SLUG_REGEX.test(slug) ? 'invalid' :
    null // null means "needs async check"

  useEffect(() => {
    // Only run async check when syncStatus is null (valid slug that needs server check)
    if (syncStatus !== null) {
      return
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/slug-check?slug=${encodeURIComponent(slug)}`)
        const data = await res.json() as { available: boolean }
        setAsyncStatus(data.available ? 'available' : 'taken')
      } catch {
        setAsyncStatus('idle')
      }
    }, DEBOUNCE_MS)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [slug, currentSlug, syncStatus])

  // Return sync status if determined; otherwise derive from async state
  if (syncStatus !== null) return syncStatus
  return asyncStatus === 'idle' ? 'checking' : asyncStatus
}
