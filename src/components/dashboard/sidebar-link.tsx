'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface SidebarLinkProps {
  href: string
  label: string
  icon?: React.ReactNode
}

export function SidebarLink({ href, label, icon }: SidebarLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(`${href}/`)

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-brand-500/10 text-brand-400'
          : 'text-slate-400 hover:text-slate-200 hover:bg-surface-raised'
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {label}
    </Link>
  )
}
