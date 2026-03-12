import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  // Defense-in-depth: middleware is first layer, layout is second
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-border bg-surface-raised px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-brand-500 font-bold text-xl">
            FluxQR
          </Link>
          <span className="text-xs bg-brand-500/10 text-brand-400 px-2 py-0.5 rounded-md">
            Admin
          </span>
        </div>
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Back to Dashboard
        </Link>
      </header>
      <main className="p-6 max-w-6xl mx-auto">{children}</main>
    </div>
  )
}
