import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'
import { HomeClient } from './home-client'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'FluxQR — Smart QR Links for Messaging',
}

export default async function Home() {
  const cookieStore = await cookies()
  const verifiedPhone = cookieStore.get('verified_phone')?.value ?? null

  let usageCount = 0
  let isGated = false

  if (verifiedPhone) {
    const admin = createAdminClient()
    const { data: usage } = await admin
      .from('phone_usage')
      .select('usage_count')
      .eq('phone_number', verifiedPhone)
      .single()

    usageCount = usage?.usage_count ?? 0
    isGated = usageCount >= 5
  }

  return (
    <HomeClient
      verifiedPhone={verifiedPhone}
      isGated={isGated}
    />
  )
}
