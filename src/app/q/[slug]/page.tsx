import { after } from 'next/server'
import { notFound, redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@/lib/supabase/server'
import { buildPlatformUrl } from '@/lib/redirect'
import { ScannerError } from '@/components/scanner/scanner-error'

export const metadata = { title: 'FluxQR' }

export default async function ScannerPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: qr } = await supabase
    .from('qr_codes')
    .select(
      'id, user_id, slug, label, platform, contact_target, default_message, is_active, scan_count, phone_number, created_at, updated_at'
    )
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!qr) {
    const adminClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return []
          },
          setAll() {},
        },
      }
    )

    const { data: existing } = await adminClient
      .from('qr_codes')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existing) {
      return (
        <ScannerError
          statusCode="410"
          title="Link deactivated"
          description="This QR code link has been deactivated by its owner."
        />
      )
    }

    notFound()
  }

  after(async () => {
    const anonClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return []
          },
          setAll() {},
        },
      }
    )
    await anonClient.rpc('increment_scan_count', { qr_slug: slug })
  })

  const platformUrl = buildPlatformUrl(qr.platform, qr.contact_target, qr.default_message ?? '')
  redirect(platformUrl)
}
