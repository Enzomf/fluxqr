'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { SidebarLink } from '@/components/dashboard/sidebar-link'
import { signOut } from '@/app/dashboard/actions'

interface SidebarUser {
  email?: string
  user_metadata?: {
    avatar_url?: string
    full_name?: string
  }
}

interface SidebarProps {
  user: SidebarUser
}

const navItems = [
  { href: '/dashboard', label: 'My QR Codes' },
]

export function Sidebar({ user }: SidebarProps) {
  const [open, setOpen] = useState(false)

  const avatarUrl = user.user_metadata?.avatar_url ?? ''
  const email = user.email ?? ''
  const fullName = user.user_metadata?.full_name ?? ''
  const fallbackLetter = (fullName || email).charAt(0).toUpperCase()

  function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
    return (
      <div className="flex flex-col h-full p-4">
        {/* Wordmark */}
        <div className="mb-8">
          <span className="text-brand-500 font-bold text-xl tracking-tight">FluxQR</span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <div key={item.href} onClick={onNavigate}>
              <SidebarLink href={item.href} label={item.label} />
            </div>
          ))}
        </nav>

        {/* User area */}
        <div>
          <Separator className="mb-4" />
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={avatarUrl} alt={email} />
              <AvatarFallback className="bg-brand-500/20 text-brand-400 text-xs">
                {fallbackLetter}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground truncate min-w-0 flex-1">
              {email}
            </span>
          </div>
          <form action={signOut}>
            <Button variant="ghost" size="sm" type="submit" className="w-full justify-start text-slate-400 hover:text-slate-200">
              Sign out
            </Button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-56 md:flex-col md:fixed md:inset-y-0 bg-surface-raised border-r border-border">
        <SidebarNav />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-md bg-surface-raised border border-border text-slate-400 hover:text-slate-200"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-56 bg-surface-raised p-0 border-r border-border">
          <SidebarNav onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  )
}
