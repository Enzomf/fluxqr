'use server'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export async function signInWithGoogle() {
  const supabase = await createClient()

  const headersList = await headers()
  const host = headersList.get('x-forwarded-host') || headersList.get('host')
  const proto = headersList.get('x-forwarded-proto') || 'https'
  const origin = `${proto}://${host}`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })
  if (error) throw error
  if (data.url) redirect(data.url)
}
