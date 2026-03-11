'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function verifyAdmin(): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    throw new Error('Not authorized — admin role required')
  }
}

export async function deactivateUser(userId: string): Promise<{ success: boolean }> {
  await verifyAdmin()

  const admin = createAdminClient()

  await admin.from('profiles').update({ is_active: false }).eq('id', userId)
  await admin.from('qr_codes').update({ is_active: false }).eq('user_id', userId)

  revalidatePath('/admin')

  return { success: true }
}

export async function deactivateQrCode(qrId: string): Promise<{ success: boolean }> {
  await verifyAdmin()

  const admin = createAdminClient()

  await admin.from('qr_codes').update({ is_active: false }).eq('id', qrId)

  revalidatePath('/admin')

  return { success: true }
}
