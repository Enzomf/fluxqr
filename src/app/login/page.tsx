import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button'

export const metadata: Metadata = {
  title: 'Sign in — FluxQR',
}

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/')

  return (
    <main className="min-h-screen flex items-center justify-center bg-surface">
      <div className="bg-surface-raised rounded-lg p-8 w-full max-w-sm">
        <Image src="/logo.png" alt="FluxQR" width={160} height={160} className="mx-auto mb-4" />
        <h1 className="text-brand-500 font-bold text-3xl text-center">FluxQR</h1>
        <p className="text-muted-foreground text-sm text-center mt-2">
          Smart links for instant messaging
        </p>
        <div className="mt-8">
          <GoogleSignInButton />
        </div>
      </div>
    </main>
  )
}
