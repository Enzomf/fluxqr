export type Platform = 'whatsapp' | 'sms' | 'telegram'

export type QrCode = {
  id: string
  user_id: string
  slug: string
  label: string
  platform: Platform
  contact_target: string
  default_message: string | null
  is_active: boolean
  scan_count: number
  created_at: string
  updated_at: string
}
