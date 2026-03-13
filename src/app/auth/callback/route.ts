import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyPhoneLinkToken } from '@/lib/phone-token'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirectUrl = origin

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

      const phoneLinkToken = cookieStore.get('phone_link_token')?.value

      if (phoneLinkToken && user) {
        const tokenResult = verifyPhoneLinkToken(phoneLinkToken)

        if (tokenResult.valid) {
          const admin = createAdminClient()

          // Link phone QR codes (user_id = null) to the authenticated user
          await admin
            .from('qr_codes')
            .update({ user_id: user.id })
            .eq('phone_number', tokenResult.phone)
            .is('user_id', null)

          // Upsert profile with the verified phone number
          await admin
            .from('profiles')
            .upsert({ id: user.id, phone_number: tokenResult.phone }, { onConflict: 'id' })
        }

        // Always clean up the token cookie regardless of validity
        cookieStore.delete('phone_link_token')
      }
    } catch (err) {
      // Non-blocking: log error but proceed with redirect
      console.error('[auth/callback] Account linking failed:', err)
    }

    const response = NextResponse.redirect(redirectUrl)
    cookiesToApply.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options)
    })
    // Ensure both cookies are removed from the response as well
    response.cookies.delete('verified_phone')
    response.cookies.delete('phone_link_token')
    return response
  }

  return NextResponse.redirect(redirectUrl)
}
