'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { cn, formatScanCount } from '@/lib/utils'
import { deactivateUser } from '@/app/actions/admin-actions'

type UserRow = {
  id: string
  email: string | null
  phone_number: string | null
  role: string
  is_active: boolean
  created_at: string
  qr_count: number
  total_scans: number
}

interface UserTableProps {
  users: UserRow[]
}

function UserRowItem({ user }: { user: UserRow }) {
  const [isPending, startTransition] = useTransition()

  function handleDeactivate() {
    if (!window.confirm('Deactivate this user and all their QR codes?')) return
    startTransition(() => {
      deactivateUser(user.id)
    })
  }

  return (
    <tr className="border-b border-border hover:bg-surface-overlay/30 transition-colors">
      <td className="px-4 py-3">
        <Link href={`/admin/${user.id}`} className="text-sm text-foreground hover:text-brand-500 transition-colors">
          {user.email ?? <span className="text-muted-foreground italic">No email</span>}
        </Link>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {user.phone_number ?? <span className="italic">—</span>}
      </td>
      <td className="px-4 py-3 text-sm text-center">
        <Link href={`/admin/${user.id}`} className="hover:text-brand-500 transition-colors">
          {formatScanCount(user.qr_count)}
        </Link>
      </td>
      <td className="px-4 py-3 text-sm text-center">
        {formatScanCount(user.total_scans)}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {new Date(user.created_at).toLocaleDateString()}
      </td>
      <td className="px-4 py-3">
        <span
          className={cn(
            'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium',
            user.is_active
              ? 'bg-emerald-500/10 text-emerald-400'
              : 'bg-danger/10 text-danger'
          )}
        >
          {user.is_active ? 'Active' : 'Deactivated'}
        </span>
      </td>
      <td className="px-4 py-3">
        {user.is_active && (
          <button
            onClick={handleDeactivate}
            disabled={isPending}
            className={cn(
              'text-xs px-3 py-1 rounded-md border transition-colors',
              isPending
                ? 'border-border text-muted-foreground cursor-not-allowed opacity-50'
                : 'border-danger/40 text-danger hover:bg-danger/10'
            )}
          >
            {isPending ? 'Deactivating…' : 'Deactivate'}
          </button>
        )}
      </td>
    </tr>
  )
}

export function UserTable({ users }: UserTableProps) {
  if (users.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
        No users found
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-surface-raised border-b border-border">
          <tr>
            <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</th>
            <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone</th>
            <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider text-center">QR Codes</th>
            <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider text-center">Total Scans</th>
            <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Joined</th>
            <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-surface divide-y divide-border">
          {users.map((user) => (
            <UserRowItem key={user.id} user={user} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
