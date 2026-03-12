'use client'

import { useActionState, useState } from 'react'
import { sendOtp } from '@/app/actions/verify-phone'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PhoneVerifyFormProps {
  onVerificationSent: (phone: string) => void
}

const COUNTRY_CODES = [
  { code: '+1', label: '+1 (US/CA)' },
  { code: '+44', label: '+44 (UK)' },
  { code: '+55', label: '+55 (BR)' },
  { code: '+91', label: '+91 (IN)' },
  { code: '+61', label: '+61 (AU)' },
  { code: '+81', label: '+81 (JP)' },
  { code: '+49', label: '+49 (DE)' },
  { code: '+33', label: '+33 (FR)' },
  { code: '+52', label: '+52 (MX)' },
]

export function PhoneVerifyForm({ onVerificationSent }: PhoneVerifyFormProps) {
  const [countryCode, setCountryCode] = useState('+1')

  const [state, formAction, isPending] = useActionState(
    async (prevState: Parameters<typeof sendOtp>[0], formData: FormData) => {
      const localNumber = formData.get('localNumber') as string
      // Strip non-digit characters and prepend country code
      const cleaned = localNumber.replace(/\D/g, '')
      const phone = `${countryCode}${cleaned}`
      const newFormData = new FormData()
      newFormData.set('phone', phone)
      const result = await sendOtp(prevState, newFormData)
      if (result.success && result.phone) {
        onVerificationSent(result.phone)
      }
      return result
    },
    {}
  )

  return (
    <div className="w-full max-w-sm rounded-lg bg-surface-raised p-6 shadow-lg">
      <h2 className="mb-1 text-xl font-semibold text-white">
        Verify your phone number
      </h2>
      <p className="mb-6 text-sm text-muted-foreground">
        We&apos;ll send a 6-digit code to confirm your number
      </p>

      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-white">Phone number</label>
          <div className="flex gap-2">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className={cn(
                'rounded-md border border-surface-overlay bg-surface px-2 py-2',
                'text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500',
                'cursor-pointer'
              )}
              aria-label="Country code"
            >
              {COUNTRY_CODES.map(({ code, label }) => (
                <option key={code} value={code}>
                  {label}
                </option>
              ))}
            </select>
            <input
              type="tel"
              name="localNumber"
              placeholder="555 123 4567"
              required
              className={cn(
                'flex-1 rounded-md border border-surface-overlay bg-surface px-3 py-2',
                'text-sm text-white placeholder:text-slate-500',
                'focus:outline-none focus:ring-2 focus:ring-brand-500'
              )}
            />
          </div>
          {state?.error && (
            <p className="text-xs text-red-400">{state.error}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className={cn(
            'w-full bg-[#6366F1] text-white hover:bg-[#4F46E5]',
            'disabled:opacity-60'
          )}
        >
          {isPending ? 'Sending...' : 'Send verification code'}
        </Button>
      </form>
    </div>
  )
}
