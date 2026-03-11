import type { Platform } from '@/types'

/**
 * Builds a deep link URL for the given platform.
 *
 * - WhatsApp: strips non-digits from contactTarget, URI-encodes message
 * - SMS: URI-encodes message body
 * - Telegram: no message parameter (Telegram deep links don't support pre-fill)
 */
export function buildPlatformUrl(
  platform: Platform,
  contactTarget: string,
  message: string
): string {
  switch (platform) {
    case 'whatsapp': {
      const cleaned = contactTarget.replace(/\D/g, '')
      return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`
    }
    case 'sms': {
      return `sms:${contactTarget}?body=${encodeURIComponent(message)}`
    }
    case 'telegram': {
      return `https://t.me/${contactTarget}`
    }
  }
}

/**
 * Returns the brand color for the given platform.
 */
export function platformColor(platform: Platform): string {
  switch (platform) {
    case 'whatsapp':
      return '#25D366'
    case 'telegram':
      return '#0088CC'
    case 'sms':
      return '#6366F1'
  }
}

/**
 * Returns the CTA button label for the given platform (in Portuguese).
 */
export function platformLabel(platform: Platform): string {
  switch (platform) {
    case 'whatsapp':
      return 'Abrir WhatsApp'
    case 'telegram':
      return 'Abrir Telegram'
    case 'sms':
      return 'Enviar SMS'
  }
}
