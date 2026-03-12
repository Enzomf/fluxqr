'use client'

import { useState } from 'react'
import { Check, X, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useSlugCheck } from '@/hooks/use-slug-check'
import { cn } from '@/lib/utils'

interface SlugInputProps {
  defaultValue?: string
  currentSlug?: string
  error?: string[]
}

export function SlugInput({ defaultValue, currentSlug, error }: SlugInputProps) {
  const [value, setValue] = useState(defaultValue ?? '')
  const status = useSlugCheck(value, currentSlug)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    const normalized = raw.toLowerCase().replace(/\s+/g, '-')
    setValue(normalized)
  }

  return (
    <div className="space-y-1.5">
      <div className="relative flex items-center">
        <Input
          name="slug"
          value={value}
          onChange={handleChange}
          placeholder="my-qr-code"
          className={cn(
            'bg-surface-raised border-surface-overlay text-white placeholder:text-slate-500 pr-28',
            error && error.length > 0 && 'border-red-500'
          )}
        />
        <span className="absolute right-3 flex items-center gap-1 text-xs select-none">
          {status === 'checking' && (
            <>
              <Loader2 size={12} className="animate-spin text-slate-400" />
              <span className="text-slate-400">Checking...</span>
            </>
          )}
          {status === 'available' && (
            <>
              <Check size={12} className="text-emerald-500" />
              <span className="text-emerald-500">Available</span>
            </>
          )}
          {status === 'taken' && (
            <>
              <X size={12} className="text-red-400" />
              <span className="text-red-400">Already taken</span>
            </>
          )}
          {status === 'invalid' && (
            <>
              <X size={12} className="text-red-400" />
              <span className="text-red-400">Invalid format</span>
            </>
          )}
        </span>
      </div>
      {error && error.length > 0 && (
        <p className="text-xs text-red-400">{error[0]}</p>
      )}
    </div>
  )
}
