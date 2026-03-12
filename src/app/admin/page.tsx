import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { UserTable } from '@/components/admin/user-table'
import { PageHeader } from '@/components/shared/page-header'

export const metadata: Metadata = { title: 'Admin' }

export default async function AdminPage() {
  const admin = createAdminClient()

  const { data: profiles } = await admin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: allQrCodes } = await admin
    .from('qr_codes')
    .select('user_id, scan_count, is_active')

  const userStats = new Map<string, { qr_count: number; total_scans: number }>()
  allQrCodes?.forEach((qr) => {
    if (!qr.user_id) return
    const stat = userStats.get(qr.user_id) ?? { qr_count: 0, total_scans: 0 }
    stat.qr_count++
    stat.total_scans += qr.scan_count
    userStats.set(qr.user_id, stat)
  })

  const users = (profiles ?? []).map((profile) => {
    const stats = userStats.get(profile.id) ?? { qr_count: 0, total_scans: 0 }
    return {
      id: profile.id,
      email: profile.email,
      phone_number: profile.phone_number,
      role: profile.role,
      is_active: profile.is_active,
      created_at: profile.created_at,
      qr_count: stats.qr_count,
      total_scans: stats.total_scans,
    }
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="All Users"
        description={`${users.length} user${users.length !== 1 ? 's' : ''}`}
      />
      <UserTable users={users} />
    </div>
  )
}
