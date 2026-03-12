import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { generateQrDataUrl } from '@/lib/qr-generator'
import { QrList } from '@/components/dashboard/qr-list'
import { PageHeader } from '@/components/shared/page-header'

export const metadata: Metadata = {
  title: 'Dashboard — FluxQR',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: qrCodes }, { data: profile }] = await Promise.all([
    supabase
      .from('qr_codes')
      .select('*')
      .eq('user_id', user!.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false }),
    supabase
      .from('profiles')
      .select('phone_number')
      .eq('id', user!.id)
      .single(),
  ])

  const verifiedPhone = profile?.phone_number ?? null
  const ownerName = (user!.user_metadata?.full_name as string | undefined) ?? user!.email?.split('@')[0] ?? ''
  const ownerEmail = user!.email ?? ''

  const headersList = await headers()
  const host = headersList.get('x-forwarded-host') || headersList.get('host')
  const proto = headersList.get('x-forwarded-proto') || 'https'
  const baseUrl = `${proto}://${host}`

  const qrsWithImages = await Promise.all(
    (qrCodes ?? []).map(async (qr) => ({
      ...qr,
      dataUrl: await generateQrDataUrl(qr.slug, baseUrl),
    }))
  )

  return (
    <div className="space-y-6">
      <PageHeader title="My QR Codes" />
      <QrList
        qrCodes={qrsWithImages}
        verifiedPhone={verifiedPhone}
        ownerName={ownerName}
        ownerEmail={ownerEmail}
      />
    </div>
  )
}
