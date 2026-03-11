'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export type FormState = {
  errors?: { [field: string]: string[] }
  message?: string | null
}

const CreateQrSchema = z.object({
  label: z.string().min(1, 'Label is required').max(100, 'Label too long'),
  slug: z
    .string()
    .min(2, 'At least 2 characters')
    .max(50, 'Max 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
  platform: z.enum(['whatsapp', 'sms', 'telegram'], {
    message: 'Select a platform',
  }),
  contact_target: z.string().min(1, 'Contact target is required'),
  default_message: z.string().optional().default(''),
})

export async function createQrCode(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validated = CreateQrSchema.safeParse(Object.fromEntries(formData))

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

  const { platform, contact_target, ...rest } = validated.data

  // Server-side enforcement: use verified phone for whatsapp/sms to prevent tampering
  let finalContactTarget = contact_target
  if (platform === 'whatsapp' || platform === 'sms') {
    const cookieStore = await cookies()
    const verifiedPhone = cookieStore.get('verified_phone')?.value
    if (verifiedPhone) {
      finalContactTarget = verifiedPhone
    }
  }

  const { error } = await supabase
    .from('qr_codes')
    .insert({ ...rest, platform, contact_target: finalContactTarget, user_id: user.id })

  if (error) {
    if (error.code === '23505') {
      return { errors: { slug: ['This slug is already taken'] } }
    }
    return { message: 'Failed to create QR code. Please try again.' }
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}
