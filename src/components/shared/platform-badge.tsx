import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Platform } from '@/types'

interface PlatformBadgeProps {
  platform: Platform
}

const platformStyles: Record<Platform, string> = {
  whatsapp: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  sms: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  telegram: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
}

const platformLabels: Record<Platform, string> = {
  whatsapp: 'WhatsApp',
  sms: 'SMS',
  telegram: 'Telegram',
}

export function PlatformBadge({ platform }: PlatformBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(platformStyles[platform])}
    >
      {platformLabels[platform]}
    </Badge>
  )
}
