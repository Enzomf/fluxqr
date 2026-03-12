'use client'

import Image from 'next/image'
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button'
import { cn } from '@/lib/utils'

interface FreemiumGateProps {
  className?: string
}

export function FreemiumGate({ className }: FreemiumGateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-6 rounded-lg p-8',
        'bg-surface-raised border border-surface-overlay text-center max-w-md mx-auto',
        className
      )}
    >
      <Image src="/logo.png" alt="FluxQR" width={128} height={128} />

      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-white">
          You&apos;ve used your 5 free QR codes
        </h2>
        <p className="text-sm text-slate-400">
          Sign up with Google to create unlimited QR codes and manage them from
          your dashboard.
        </p>
      </div>

      <GoogleSignInButton />
    </div>
  )
}
