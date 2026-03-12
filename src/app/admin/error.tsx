'use client'

import { useEffect } from 'react'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <button
        type="button"
        onClick={reset}
        className="bg-brand-500 hover:bg-brand-600 text-white rounded-md px-4 py-2 text-sm"
      >
        Try again
      </button>
    </div>
  )
}
