import type { Platform } from '@/types'

/**
 * Builds a deep link URL for the given platform.
 *
 * - WhatsApp: strips non-digits from contactTarget, URI-encodes message
 * - SMS: URI-encodes message body
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
    default: {
      throw new Error(`Unknown platform: ${platform satisfies never}`)
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
    case 'sms':
      return '#6366F1'
    default: {
      throw new Error(`Unknown platform: ${platform satisfies never}`)
    }
  }
}

/**
 * Returns the CTA button label for the given platform (in Portuguese).
 */
export function platformLabel(platform: Platform): string {
  switch (platform) {
    case 'whatsapp':
      return 'Abrir WhatsApp'
    case 'sms':
      return 'Enviar SMS'
    default: {
      throw new Error(`Unknown platform: ${platform satisfies never}`)
    }
  }
}
