import { describe, it, expect } from 'vitest'
import { buildPlatformUrl, platformColor, platformLabel } from './redirect'

describe('buildPlatformUrl', () => {
  describe('WhatsApp', () => {
    it('returns the correct wa.me URL for a basic case', () => {
      expect(buildPlatformUrl('whatsapp', '5511999998888', 'Hello')).toBe(
        'https://wa.me/5511999998888?text=Hello'
      )
    })

    it('strips non-digits from contact target', () => {
      expect(buildPlatformUrl('whatsapp', '+55 11 99999-8888', 'Hello')).toBe(
        'https://wa.me/5511999998888?text=Hello'
      )
    })

    it('URI-encodes special characters in message (& and newline)', () => {
      expect(buildPlatformUrl('whatsapp', '5511999998888', 'Hello & World\nLine2')).toBe(
        `https://wa.me/5511999998888?text=${encodeURIComponent('Hello & World\nLine2')}`
      )
    })

    it('includes ?text= even when message is empty', () => {
      expect(buildPlatformUrl('whatsapp', '5511999998888', '')).toBe(
        'https://wa.me/5511999998888?text='
      )
    })
  })

  describe('SMS', () => {
    it('returns the correct sms: URL for a basic case', () => {
      expect(buildPlatformUrl('sms', '5511999998888', 'Hello')).toBe(
        'sms:5511999998888?body=Hello'
      )
    })

    it('URI-encodes special characters in message', () => {
      expect(buildPlatformUrl('sms', '5511999998888', 'Hello & World')).toBe(
        `sms:5511999998888?body=${encodeURIComponent('Hello & World')}`
      )
    })
  })

  it('throws an Error for an unknown platform', () => {
    // Cast to bypass TypeScript — we want to verify runtime exhaustive check
    expect(() => buildPlatformUrl('telegram' as never, '5511999998888', 'Hello')).toThrow(
      'Unknown platform: telegram'
    )
  })
})

describe('platformColor', () => {
  it('returns #25D366 for whatsapp', () => {
    expect(platformColor('whatsapp')).toBe('#25D366')
  })

  it('returns #6366F1 for sms', () => {
    expect(platformColor('sms')).toBe('#6366F1')
  })
})

describe('platformLabel', () => {
  it('returns "Abrir WhatsApp" for whatsapp', () => {
    expect(platformLabel('whatsapp')).toBe('Abrir WhatsApp')
  })

  it('returns "Enviar SMS" for sms', () => {
    expect(platformLabel('sms')).toBe('Enviar SMS')
  })
})
