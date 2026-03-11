'use server'

import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateQrDataUrl } from '@/lib/qr-generator'

const FREE_LIMIT = 5

function generatePublicSlug(phone: string): string {
  const last4 = phone.slice(-4)
  const random6 = Math.random().toString(36).slice(2, 8)
  return `${last4}-${random6}`
}

export type CreatePublicQrResult = {
  error?: string
  gate?: boolean
  qrData?: { slug: string; dataUrl: string; label: string }
}

export async function createPublicQr(
  message: string | null
): Promise<CreatePublicQrResult> {
  const cookieStore = await cookies()
  const phone = cookieStore.get('verified_phone')?.value

  if (!phone) {
    return { error: 'Phone not verified' }
  }

  const admin = createAdminClient()

  // Check current usage count
  const { data: usage } = await admin
    .from('phone_usage')
    .select('usage_count')
    .eq('phone_number', phone)
    .single()

  const currentCount = usage?.usage_count ?? 0

  if (currentCount >= FREE_LIMIT) {
    return {
      gate: true,
      error:
        'You have used your 5 free QR codes. Sign up with Google to continue.',
    }
  }

  // Generate a unique slug (retry up to 3 times)
  let slug = generatePublicSlug(phone)
  let attempts = 0

  while (attempts < 3) {
    const { data: existing } = await admin
      .from('qr_codes')
      .select('slug')
      .eq('slug', slug)
      .single()

    if (!existing) break
    slug = generatePublicSlug(phone)
    attempts++
  }

  // Insert into qr_codes using admin client (user_id = null bypasses RLS)
  const label = `QR ${currentCount + 1}`
  const { error: insertError } = await admin.from('qr_codes').insert({
    user_id: null,
    phone_number: phone,
    slug,
    label,
    platform: 'whatsapp',
    contact_target: phone,
    default_message: message,
    is_active: true,
    scan_count: 0,
  })

  if (insertError) {
    return { error: 'Failed to create QR code. Please try again.' }
  }

  // Upsert phone_usage: increment usage_count
  await admin.from('phone_usage').upsert(
    {
      phone_number: phone,
      usage_count: currentCount + 1,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'phone_number' }
  )

  // Generate QR data URL
  const dataUrl = await generateQrDataUrl(slug)

  return { qrData: { slug, dataUrl, label } }
}
