import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { UserQrTable } from '@/components/admin/user-qr-table'
import { PageHeader } from '@/components/shared/page-header'
import type { QrCode } from '@/types'

export async function generateMetadata() {
  return { title: 'User Detail — Admin — FluxQR' }
}

export default async function AdminUserPage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params
  const admin = createAdminClient()

  const { data: profile } = await admin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (!profile) {
    notFound()
  }

  const { data: qrCodes } = await admin
    .from('qr_codes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  let phoneQrCodes: QrCode[] = []
  if (profile.phone_number) {
    const { data } = await admin
      .from('qr_codes')
      .select('*')
      .eq('phone_number', profile.phone_number)
      .is('user_id', null)
    phoneQrCodes = (data as QrCode[]) ?? []
  }

  const allQrCodes = [...((qrCodes as QrCode[]) ?? []), ...phoneQrCodes]
  const userName = profile.email ?? profile.phone_number ?? 'Unknown'

  return (
    <div className="space-y-6">
      <PageHeader title={`${userName}'s QR Codes`} />
      <UserQrTable qrCodes={allQrCodes} userName={userName} />
    </div>
  )
}
