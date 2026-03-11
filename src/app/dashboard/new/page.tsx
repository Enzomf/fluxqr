import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/page-header'
import { QrForm } from '@/components/qr-management/qr-form'
import { createQrCode } from './actions'

export const metadata: Metadata = {
  title: 'New QR Code — FluxQR',
}

export default async function NewQrPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let verifiedPhone: string | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('phone_number')
      .eq('id', user.id)
      .single()
    verifiedPhone = profile?.phone_number ?? null
  }

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft size={14} />
        Back to dashboard
      </Link>
      <PageHeader title="Create QR Code" />
      <QrForm action={createQrCode} mode="create" verifiedPhone={verifiedPhone} />
    </div>
  )
}
