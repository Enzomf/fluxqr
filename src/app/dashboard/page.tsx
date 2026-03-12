import type { Metadata } from 'next'
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

  const qrsWithImages = await Promise.all(
    (qrCodes ?? []).map(async (qr) => ({
      ...qr,
      dataUrl: await generateQrDataUrl(qr.slug),
    }))
  )

  return (
    <div className="space-y-6">
      <PageHeader title="My QR Codes" />
      <QrList qrCodes={qrsWithImages} verifiedPhone={verifiedPhone} />
    </div>
  )
}
