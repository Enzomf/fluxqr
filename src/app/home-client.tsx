'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { PhoneVerifyForm } from '@/components/public/phone-verify-form'
import { OtpVerifyForm } from '@/components/public/otp-verify-form'
import { QrTypeGrid } from '@/components/public/qr-type-grid'
import { PublicQrForm } from '@/components/public/public-qr-form'
import { PublicQrResultDialog } from '@/components/public/public-qr-result-dialog'
import { FreemiumGate } from '@/components/public/freemium-gate'

type Step = 'phone' | 'otp' | 'grid' | 'form' | 'result' | 'gated'

interface HomeClientProps {
  verifiedPhone: string | null
  isGated: boolean
}

export function HomeClient({
  verifiedPhone,
  isGated,
}: HomeClientProps) {
  function getInitialStep(): Step {
    if (isGated) return 'gated'
    if (verifiedPhone) return 'grid'
    return 'phone'
  }

  const [step, setStep] = useState<Step>(getInitialStep)
  const [phone, setPhone] = useState(verifiedPhone ?? '')
  const [qrType, setQrType] = useState<'default' | 'custom'>('default')
  const [qrData, setQrData] = useState<{
    slug: string
    dataUrl: string
    label: string
  } | null>(null)

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
      {/* Wordmark */}
      <div className="flex flex-col items-center mb-8">
        <Image src="/logo.png" alt="FluxQR" width={160} height={160} className="mb-4" />
        <h1 className="text-brand-500 font-bold text-3xl mb-2">FluxQR</h1>
        <p className="text-slate-400 text-sm">
          Smart links for instant messaging
        </p>
      </div>

      {/* Content area */}
      <div className="w-full max-w-lg mx-auto flex flex-col items-center">
        {step === 'phone' && (
          <PhoneVerifyForm
            onVerificationSent={(sentPhone) => {
              setPhone(sentPhone)
              setStep('otp')
            }}
          />
        )}

        {step === 'otp' && (
          <OtpVerifyForm
            phone={phone}
            onVerified={() => setStep('grid')}
          />
        )}

        {step === 'grid' && (
          <QrTypeGrid
            onSelect={(type) => {
              setQrType(type)
              setStep('form')
            }}
          />
        )}

        {step === 'form' && (
          <PublicQrForm
            qrType={qrType}
            phone={phone}
            onResult={(data) => {
              setQrData(data)
              setStep('result')
            }}
            onGateHit={() => setStep('gated')}
            onBack={() => setStep('grid')}
          />
        )}

        {step === 'result' && (
          <PublicQrResultDialog
            open={true}
            onOpenChange={(open) => {
              if (!open) setStep('grid')
            }}
            qrData={qrData}
          />
        )}

        {step === 'gated' && <FreemiumGate />}
      </div>

      {/* Sign-in link */}
      <p className="mt-8 text-sm text-slate-500">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-brand-500 hover:text-brand-600 transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
