/**
 * Tests for buildPlatformUrl utility.
 *
 * These are written as plain Node.js assertions so they run without any test framework.
 * Run: npx tsx src/lib/__tests__/redirect.test.ts
 */

import assert from 'node:assert/strict'
import { buildPlatformUrl, platformColor, platformLabel } from '../redirect'

// --- buildPlatformUrl ---

// WhatsApp: basic case
assert.equal(
  buildPlatformUrl('whatsapp', '5511999998888', 'Hello'),
  'https://wa.me/5511999998888?text=Hello',
  'WhatsApp basic URL'
)

// WhatsApp: strips non-digits from contact target
assert.equal(
  buildPlatformUrl('whatsapp', '+55 11 99999-8888', 'Hello'),
  'https://wa.me/5511999998888?text=Hello',
  'WhatsApp strips non-digits'
)

// WhatsApp: encodes special characters in message
assert.equal(
  buildPlatformUrl('whatsapp', '5511999998888', 'Hello & World\nLine2'),
  `https://wa.me/5511999998888?text=${encodeURIComponent('Hello & World\nLine2')}`,
  'WhatsApp encodes special chars'
)

// WhatsApp: empty message still includes ?text=
assert.equal(
  buildPlatformUrl('whatsapp', '5511999998888', ''),
  `https://wa.me/5511999998888?text=`,
  'WhatsApp empty message includes ?text='
)

// SMS: basic case
assert.equal(
  buildPlatformUrl('sms', '5511999998888', 'Hello'),
  'sms:5511999998888?body=Hello',
  'SMS basic URL'
)

// SMS: encodes special characters in message
assert.equal(
  buildPlatformUrl('sms', '5511999998888', 'Hello & World'),
  `sms:5511999998888?body=${encodeURIComponent('Hello & World')}`,
  'SMS encodes special chars'
)

// --- platformColor ---
assert.equal(platformColor('whatsapp'), '#25D366', 'WhatsApp color')
assert.equal(platformColor('sms'), '#6366F1', 'SMS color')

// --- platformLabel ---
assert.equal(platformLabel('whatsapp'), 'Abrir WhatsApp', 'WhatsApp label')
assert.equal(platformLabel('sms'), 'Enviar SMS', 'SMS label')

console.log('All redirect tests passed!')
