'use client'

import { useActionState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { SlugInput } from './slug-input'
import { PlatformSelector } from './platform-selector'
import { cn } from '@/lib/utils'
import type { QrCode } from '@/types'
import type { FormState } from '@/app/dashboard/new/actions'

interface QrFormProps {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>
  defaultValues?: Partial<QrCode>
  mode: 'create' | 'edit'
}

export function QrForm({ action, defaultValues, mode }: QrFormProps) {
  const [state, formAction, pending] = useActionState(action, {
    errors: {},
    message: null,
  })

  return (
    <form action={formAction} className="max-w-lg space-y-6">
      {state.message && (
        <div className="rounded-md bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
          {state.message}
        </div>
      )}

      {/* Label field */}
      <div className="space-y-1.5">
        <Label htmlFor="label" className="text-slate-200">
          Label
        </Label>
        <Input
          id="label"
          name="label"
          defaultValue={defaultValues?.label}
          placeholder="My QR Code"
          className={cn(
            'bg-[#1E293B] border-[#334155] text-white placeholder:text-slate-500',
            state.errors?.label && 'border-red-500'
          )}
        />
        {state.errors?.label && (
          <p className="text-xs text-red-400">{state.errors.label[0]}</p>
        )}
      </div>

      {/* Slug field */}
      <div className="space-y-1.5">
        <Label className="text-slate-200">Slug</Label>
        <SlugInput
          defaultValue={defaultValues?.slug}
          currentSlug={mode === 'edit' ? defaultValues?.slug : undefined}
          error={state.errors?.slug}
        />
      </div>

      {/* Platform field */}
      <div className="space-y-1.5">
        <Label className="text-slate-200">Platform</Label>
        <PlatformSelector
          defaultValue={defaultValues?.platform}
          disabled={mode === 'edit'}
          error={state.errors?.platform}
        />
      </div>

      {/* Contact target field */}
      <div className="space-y-1.5">
        <Label htmlFor="contact_target" className="text-slate-200">
          Contact Target
        </Label>
        <Input
          id="contact_target"
          name="contact_target"
          defaultValue={defaultValues?.contact_target}
          placeholder={
            defaultValues?.platform === 'whatsapp' || defaultValues?.platform === 'sms'
              ? '+1 555 000 0000'
              : '@username'
          }
          className={cn(
            'bg-[#1E293B] border-[#334155] text-white placeholder:text-slate-500',
            state.errors?.contact_target && 'border-red-500'
          )}
        />
        {state.errors?.contact_target && (
          <p className="text-xs text-red-400">{state.errors.contact_target[0]}</p>
        )}
      </div>

      {/* Default message field */}
      <div className="space-y-1.5">
        <Label htmlFor="default_message" className="text-slate-200">
          Default Message{' '}
          <span className="text-slate-500 font-normal">(optional)</span>
        </Label>
        <Textarea
          id="default_message"
          name="default_message"
          defaultValue={defaultValues?.default_message ?? ''}
          placeholder="Hello! I'd like to chat..."
          rows={3}
          className={cn(
            'bg-[#1E293B] border-[#334155] text-white placeholder:text-slate-500 resize-none',
            state.errors?.default_message && 'border-red-500'
          )}
        />
        {state.errors?.default_message && (
          <p className="text-xs text-red-400">{state.errors.default_message[0]}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={pending}
        className="bg-[#6366F1] hover:bg-[#4F46E5] text-white font-medium transition-colors"
      >
        {mode === 'create'
          ? pending
            ? 'Creating...'
            : 'Create QR Code'
          : pending
            ? 'Saving...'
            : 'Save Changes'}
      </Button>
    </form>
  )
}
