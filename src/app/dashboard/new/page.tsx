import type { Metadata } from 'next'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { QrForm } from '@/components/qr-management/qr-form'
import { createQrCode } from './actions'

export const metadata: Metadata = {
  title: 'New QR Code — FluxQR',
}

export default async function NewQrPage() {
  const cookieStore = await cookies()
  const verifiedPhone = cookieStore.get('verified_phone')?.value ?? null

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
