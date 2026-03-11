import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')

  if (!slug) {
    return Response.json({ available: false })
  }

  const supabase = await createClient()
  const { data } = await supabase
    .from('qr_codes')
    .select('id')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  return Response.json({ available: data === null })
}
