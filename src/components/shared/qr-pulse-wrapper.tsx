'use client'

import { cn } from '@/lib/utils'

interface QrPulseWrapperProps {
  children: React.ReactNode
  trigger: boolean
}

export function QrPulseWrapper({ children, trigger }: QrPulseWrapperProps) {
  return (
    <div className={cn(trigger && 'animate-qr-pulse rounded-md')}>
      {children}
    </div>
  )
}
