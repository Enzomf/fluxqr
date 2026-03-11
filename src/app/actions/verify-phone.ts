'use server'

import { cookies } from 'next/headers'
import { sendVerification } from '@/lib/twilio'
import { z } from 'zod'

export type SendOtpState = {
  error?: string
  success?: boolean
  phone?: string
}

const phoneSchema = z
  .string()
  .regex(/^\+[1-9]\d{1,14}$/, 'Must include country code (e.g. +1 555 123 4567)')

/**
 * Form action: validates phone number and sends OTP via Twilio Verify.
 * Used with useActionState in PhoneVerifyForm.
 */
export async function sendOtp(
  prevState: SendOtpState,
  formData: FormData
): Promise<SendOtpState> {
  const cookieStore = await cookies()
  const existingPhone = cookieStore.get('verified_phone')?.value
  if (existingPhone) {
    return { success: true, phone: existingPhone }
  }

  const phone = formData.get('phone') as string

  const result = phoneSchema.safeParse(phone)
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid phone number' }
  }

  try {
    await sendVerification(result.data)
    return { success: true, phone: result.data }
  } catch (err) {
    console.error('[sendOtp] Twilio error:', err)
    return { error: 'Failed to send verification code. Please try again.' }
  }
}

/**
 * Direct call version for OTP resend (not a form action).
 * Used internally by OtpVerifyForm without FormData.
 */
export async function resendOtp(
  phone: string
): Promise<{ error?: string; success?: boolean }> {
  const result = phoneSchema.safeParse(phone)
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid phone number' }
  }

  try {
    await sendVerification(result.data)
    return { success: true }
  } catch {
    return { error: 'Failed to resend code. Please try again.' }
  }
}
