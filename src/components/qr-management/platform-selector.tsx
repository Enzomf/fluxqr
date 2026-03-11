'use client'

import type { Platform } from '@/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface PlatformSelectorProps {
  defaultValue?: Platform
  disabled?: boolean
  error?: string[]
}

export function PlatformSelector({ defaultValue, disabled, error }: PlatformSelectorProps) {
  const trigger = (
    <SelectTrigger
      className={cn(
        'w-full bg-[#1E293B] border-[#334155] text-white',
        disabled && 'opacity-50 cursor-not-allowed',
        error && error.length > 0 && 'border-red-500'
      )}
    >
      <SelectValue placeholder="Select a platform" />
    </SelectTrigger>
  )

  return (
    <div className="space-y-1.5">
      <Select name="platform" defaultValue={defaultValue} disabled={disabled}>
        {disabled ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div>{trigger}</div>
              </TooltipTrigger>
              <TooltipContent>
                Platform cannot be changed after creation
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          trigger
        )}
        <SelectContent>
          <SelectItem value="whatsapp">WhatsApp</SelectItem>
          <SelectItem value="sms">SMS</SelectItem>
          <SelectItem value="telegram">Telegram</SelectItem>
        </SelectContent>
      </Select>
      {error && error.length > 0 && (
        <p className="text-xs text-red-400">{error[0]}</p>
      )}
    </div>
  )
}
