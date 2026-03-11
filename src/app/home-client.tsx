'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PhoneVerifyForm } from '@/components/public/phone-verify-form'
import { OtpVerifyForm } from '@/components/public/otp-verify-form'
import { QrTypeGrid } from '@/components/public/qr-type-grid'
import { PublicQrForm } from '@/components/public/public-qr-form'
import { PublicQrResultDialog } from '@/components/public/public-qr-result-dialog'
import { FreemiumGate } from '@/components/public/freemium-gate'

type Step = 'phone' | 'otp' | 'grid' | 'form' | 'result' | 'gated'

interface HomeClientProps {
  verifiedPhone: string | null
  usageCount: number
  isGated: boolean
}

export function HomeClient({
  verifiedPhone,
  usageCount: _usageCount,
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
    <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-4">
      {/* Wordmark */}
      <h1 className="text-[#6366F1] font-bold text-3xl mb-2">FluxQR</h1>
      <p className="text-[#94A3B8] text-sm mb-8">
        Smart links for instant messaging
      </p>

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
      <p className="mt-8 text-sm text-[#64748B]">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-[#6366F1] hover:text-[#4F46E5] transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
