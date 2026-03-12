'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { PhoneVerifyForm } from '@/components/public/phone-verify-form'
import { OtpVerifyForm } from '@/components/public/otp-verify-form'

interface PhoneVerifyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onVerified: () => void
}

export function PhoneVerifyDialog({ open, onOpenChange, onVerified }: PhoneVerifyDialogProps) {
  const router = useRouter()
  const [phone, setPhone] = useState<string | null>(null)

  function handleVerificationSent(sentPhone: string) {
    setPhone(sentPhone)
  }

  function handleVerified() {
    router.refresh()
    onVerified()
    onOpenChange(false)
    // Reset step for next open
    setPhone(null)
  }

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen)
    if (!nextOpen) {
      // Reset step when dialog closes
      setPhone(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-background border-surface-overlay p-0" showCloseButton>
        {phone ? (
          <OtpVerifyForm phone={phone} onVerified={handleVerified} />
        ) : (
          <PhoneVerifyForm onVerificationSent={handleVerificationSent} />
        )}
      </DialogContent>
    </Dialog>
  )
}
