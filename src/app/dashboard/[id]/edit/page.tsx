import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { QrForm } from '@/components/qr-management/qr-form'
import { PageHeader } from '@/components/shared/page-header'
import { updateQrCode } from './actions'

export const metadata: Metadata = {
  title: 'Edit QR Code — FluxQR',
}

interface EditPageProps {
  params: Promise<{ id: string }>
}

export default async function EditQrPage({ params }: EditPageProps) {
  const { id } = await params

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

  const { data: qrCode } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (!qrCode) {
    notFound()
  }

  const updateAction = updateQrCode.bind(null, id)

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={16} />
        Back to dashboard
      </Link>

      <PageHeader title={`Edit: ${qrCode.label}`} />

      <QrForm action={updateAction} defaultValues={qrCode} mode="edit" verifiedPhone={verifiedPhone} />
    </div>
  )
}
