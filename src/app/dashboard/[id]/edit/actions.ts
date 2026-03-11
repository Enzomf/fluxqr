'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import type { FormState } from '@/app/dashboard/new/actions'

const UpdateQrSchema = z.object({
  label: z.string().min(1, 'Label is required').max(100, 'Label too long'),
  slug: z
    .string()
    .min(2, 'At least 2 characters')
    .max(50, 'Max 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
  contact_target: z.string().min(1, 'Contact target is required'),
  default_message: z.string().optional().default(''),
})

export async function updateQrCode(
  id: string,
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validated = UpdateQrSchema.safeParse(Object.fromEntries(formData))

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { label, slug, contact_target, default_message } = validated.data

  const { error } = await supabase
    .from('qr_codes')
    .update({ label, slug, contact_target, default_message })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    if (error.code === '23505') {
      return { errors: { slug: ['This slug is already taken'] } }
    }
    return { message: 'Failed to update QR code. Please try again.' }
  }

  revalidatePath('/dashboard')
  redirect(`/dashboard?success=edit&id=${id}`)
}

export async function deleteQrCode(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { error } = await supabase
    .from('qr_codes')
    .update({ is_active: false })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return {}
}
