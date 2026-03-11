'use client'

import { useState, useTransition, useEffect } from 'react'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { checkOtp } from '@/app/actions/check-otp'
import { resendOtp } from '@/app/actions/verify-phone'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface OtpVerifyFormProps {
  phone: string
  onVerified: () => void
}

function maskPhone(phone: string): string {
  // E.164 format: +14155551234 -> "+1 ***-***-1234"
  // Keep country code and last 4 digits, mask middle
  const match = phone.match(/^(\+\d{1,3})(\d+)(\d{4})$/)
  if (match) {
    const [, country, middle, last4] = match
    return `${country} ${'*'.repeat(middle.length)}-${last4}`
  }
  // Fallback: keep last 4 visible
  if (phone.length > 4) {
    return `${'*'.repeat(phone.length - 4)}${phone.slice(-4)}`
  }
  return phone
}

export function OtpVerifyForm({ phone, onVerified }: OtpVerifyFormProps) {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [resendCooldown, setResendCooldown] = useState(60)

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  function handleChange(newValue: string) {
    setValue(newValue)
    setError(null)

    if (newValue.length === 6) {
      startTransition(async () => {
        const result = await checkOtp(phone, newValue)
        if (result.error) {
          setError(result.error)
          setValue('') // clear for retry
        } else {
          onVerified()
        }
      })
    }
  }

  async function handleResend() {
    setError(null)
    setValue('')
    const result = await resendOtp(phone)
    if (result.error) {
      setError(result.error)
    } else {
      setResendCooldown(60) // reset timer
    }
  }

  const maskedPhone = maskPhone(phone)

  return (
    <div className="w-full max-w-sm rounded-lg bg-[#1E293B] p-6 shadow-lg">
      <h2 className="mb-1 text-xl font-semibold text-white">
        Enter verification code
      </h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Enter the 6-digit code sent to{' '}
        <span className="font-medium text-white">{maskedPhone}</span>
      </p>

      <div className="flex flex-col items-center gap-4">
        <div className={cn('transition-opacity', isPending && 'opacity-50')}>
          <InputOTP
            maxLength={6}
            value={value}
            onChange={handleChange}
            disabled={isPending}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}

        {isPending && (
          <p className="text-xs text-muted-foreground">Verifying...</p>
        )}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={resendCooldown > 0 || isPending}
          onClick={handleResend}
          className="text-sm text-[#6366F1] hover:text-[#4F46E5] disabled:opacity-40"
        >
          {resendCooldown > 0
            ? `Resend code (${resendCooldown}s)`
            : 'Resend code'}
        </Button>
      </div>
    </div>
  )
}
