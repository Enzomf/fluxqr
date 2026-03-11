import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { generateQrDataUrl } from '@/lib/qr-generator'
import { QrList } from '@/components/dashboard/qr-list'
import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'

export const metadata: Metadata = {
  title: 'Dashboard — FluxQR',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: qrCodes } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('user_id', user!.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  const qrsWithImages = await Promise.all(
    (qrCodes ?? []).map(async (qr) => ({
      ...qr,
      dataUrl: await generateQrDataUrl(qr.slug),
    }))
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="My QR Codes"
        action={{ label: 'New QR', href: '/dashboard/new' }}
      />
      {qrsWithImages.length === 0 ? (
        <EmptyState />
      ) : (
        <QrList qrCodes={qrsWithImages} />
      )}
    </div>
  )
}
