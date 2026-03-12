'use server'

import { checkVerification } from '@/lib/twilio'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export type CheckOtpResult = {
  error?: string
  success?: boolean
}

const otpSchema = z
  .string()
  .length(6)
  .regex(/^\d{6}$/, 'Must be 6 digits')

/**
 * Verifies the OTP code entered by the user.
 * On success, sets an httpOnly verified_phone cookie with 30-day expiry.
 * Called programmatically (not via form action) when user enters 6 digits.
 */
export async function checkOtp(
  phone: string,
  code: string
): Promise<CheckOtpResult> {
  const result = otpSchema.safeParse(code)
  if (!result.success) {
    return { error: 'Invalid code format' }
  }

  try {
    const verification = await checkVerification(phone, result.data)

    if (verification.status !== 'approved') {
      return { error: 'Invalid or expired code. Please try again.' }
    }

    const cookieStore = await cookies()
    cookieStore.set('verified_phone', phone, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })

    // If user is authenticated, persist phone to profiles table (db is source of truth for dashboard)
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const admin = createAdminClient()
        await admin
          .from('profiles')
          .upsert({ id: user.id, phone_number: phone }, { onConflict: 'id' })
      }
    } catch {
      // Non-blocking: cookie is the fallback, profile update is best-effort
      console.error('[checkOtp] Failed to update profile phone_number')
    }

    return { success: true }
  } catch {
    return { error: 'Verification failed. Please try again.' }
  }
}
