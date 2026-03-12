import Link from 'next/link'
import { Plus } from 'lucide-react'

interface PageHeaderProps {
  title: string
  description?: string
  action?: {
    label: string
    href: string
  }
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className="bg-brand-500 hover:bg-brand-600 text-white rounded-md px-4 py-2 flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          {action.label}
        </Link>
      )}
    </div>
  )
}
