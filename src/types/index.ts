export type Platform = 'whatsapp' | 'sms' | 'telegram'

export type QrCode = {
  id: string
  user_id: string | null
  slug: string
  label: string
  platform: Platform
  contact_target: string
  default_message: string | null
  is_active: boolean
  scan_count: number
  phone_number: string | null
  created_at: string
  updated_at: string
}

export type AppRole = 'admin' | 'user'

export type Profile = {
  id: string
  email: string | null
  phone_number: string | null
  role: AppRole
  is_active: boolean
  created_at: string
}
