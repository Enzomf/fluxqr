'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface QrPulseWrapperProps {
  children: React.ReactNode
  trigger: boolean
}

export function QrPulseWrapper({ children, trigger }: QrPulseWrapperProps) {
  const [isPulsing, setIsPulsing] = useState(false)

  useEffect(() => {
    if (trigger) {
      setIsPulsing(true)
      const timer = setTimeout(() => {
        setIsPulsing(false)
      }, 700)
      return () => clearTimeout(timer)
    }
  }, [trigger])

  return (
    <div className={cn(isPulsing && 'animate-qr-pulse rounded-md')}>
      {children}
    </div>
  )
}
