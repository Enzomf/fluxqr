import { createHmac, timingSafeEqual } from 'crypto'

/** Maximum age of a phone link token: 10 minutes in milliseconds */
export const TOKEN_MAX_AGE_MS = 10 * 60 * 1000

/**
 * Creates an HMAC-signed phone link token.
 *
 * Format (base64-encoded): `{phone}:{timestamp}:{hmacHex}`
 *
 * The HMAC is computed over `{phone}:{timestamp}` using SUPABASE_SERVICE_ROLE_KEY
 * as the secret key, preventing token forgery without knowledge of the secret.
 *
 * @param phone - The verified phone number to embed in the token
 * @returns A base64-encoded token string
 */
export function createPhoneLinkToken(phone: string): string {
  const timestamp = Date.now()
  const payload = `${phone}:${timestamp}`
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const hmac = createHmac('sha256', secret).update(payload).digest('hex')
  const raw = `${phone}:${timestamp}:${hmac}`
  return Buffer.from(raw).toString('base64')
}

/**
 * Verifies an HMAC-signed phone link token.
 *
 * Validates:
 * 1. Token can be decoded and split into exactly 3 segments
 * 2. HMAC matches (using timing-safe comparison to prevent timing attacks)
 * 3. Timestamp is within TOKEN_MAX_AGE_MS of now (10 minutes)
 *
 * @param token - A base64-encoded token string from createPhoneLinkToken
 * @returns `{ valid: true, phone }` if valid, `{ valid: false }` otherwise
 */
export function verifyPhoneLinkToken(
  token: string
): { valid: true; phone: string } | { valid: false } {
  try {
    if (!token) return { valid: false }

    const raw = Buffer.from(token, 'base64').toString('utf8')
    const colonIndex1 = raw.indexOf(':')
    if (colonIndex1 === -1) return { valid: false }

    const colonIndex2 = raw.indexOf(':', colonIndex1 + 1)
    if (colonIndex2 === -1) return { valid: false }

    const phone = raw.slice(0, colonIndex1)
    const timestamp = raw.slice(colonIndex1 + 1, colonIndex2)
    const receivedHmac = raw.slice(colonIndex2 + 1)

    // Validate we have exactly 3 non-empty parts
    if (!phone || !timestamp || !receivedHmac) return { valid: false }

    // Recompute expected HMAC
    const payload = `${phone}:${timestamp}`
    const secret = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const expectedHmac = createHmac('sha256', secret).update(payload).digest('hex')

    // Timing-safe HMAC comparison
    const expectedBuf = Buffer.from(expectedHmac, 'hex')
    let receivedBuf: Buffer
    try {
      receivedBuf = Buffer.from(receivedHmac, 'hex')
    } catch {
      return { valid: false }
    }

    if (expectedBuf.length !== receivedBuf.length) return { valid: false }
    if (!timingSafeEqual(expectedBuf, receivedBuf)) return { valid: false }

    // Check token age
    const ts = Number(timestamp)
    if (!Number.isFinite(ts) || ts <= 0) return { valid: false }
    if (Date.now() - ts > TOKEN_MAX_AGE_MS) return { valid: false }

    return { valid: true, phone }
  } catch {
    return { valid: false }
  }
}
