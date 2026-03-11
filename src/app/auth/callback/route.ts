import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirectUrl = `${origin}/dashboard`

  if (code) {
    const cookieStore = await cookies()
    const cookiesToApply: { name: string; value: string; options: Record<string, unknown> }[] = []

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
              cookiesToApply.push({ name, value, options: options as Record<string, unknown> })
            })
          },
        },
      }
    )

    await supabase.auth.exchangeCodeForSession(code)

    // Account linking: associate phone-created QR codes with the new Google user
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const verifiedPhone = cookieStore.get('verified_phone')?.value

      if (verifiedPhone && user) {
        const admin = createAdminClient()

        // Link phone QR codes (user_id = null) to the authenticated user
        await admin
          .from('qr_codes')
          .update({ user_id: user.id })
          .eq('phone_number', verifiedPhone)
          .is('user_id', null)

        // Update profile with the verified phone number
        await admin
          .from('profiles')
          .update({ phone_number: verifiedPhone })
          .eq('id', user.id)

        // Clean up the verified_phone cookie
        cookieStore.delete('verified_phone')
      }
    } catch (err) {
      // Non-blocking: log error but proceed with redirect
      console.error('[auth/callback] Account linking failed:', err)
    }

    const response = NextResponse.redirect(redirectUrl)
    cookiesToApply.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options)
    })
    // Ensure verified_phone cookie is removed from the response as well
    response.cookies.delete('verified_phone')
    return response
  }

  return NextResponse.redirect(redirectUrl)
}
