import { createPhoneLinkToken, verifyPhoneLinkToken, TOKEN_MAX_AGE_MS } from './phone-token'

const TEST_SECRET = 'test-secret-key-for-hmac'

beforeEach(() => {
  process.env.SUPABASE_SERVICE_ROLE_KEY = TEST_SECRET
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('createPhoneLinkToken', () => {
  it('returns a non-empty string', () => {
    const token = createPhoneLinkToken('+15551234567')
    expect(typeof token).toBe('string')
    expect(token.length).toBeGreaterThan(0)
  })

  it('encodes phone, timestamp, and hmac into a base64 string', () => {
    const phone = '+15551234567'
    const token = createPhoneLinkToken(phone)
    const decoded = Buffer.from(token, 'base64').toString('utf8')
    const parts = decoded.split(':')
    expect(parts).toHaveLength(3)
    expect(parts[0]).toBe(phone)
    expect(Number(parts[1])).toBeGreaterThan(0) // timestamp
    expect(parts[2]).toMatch(/^[0-9a-f]{64}$/) // hex HMAC-SHA256
  })
})

describe('verifyPhoneLinkToken', () => {
  it('returns valid=true with phone for a freshly created token', () => {
    const phone = '+15551234567'
    const token = createPhoneLinkToken(phone)
    const result = verifyPhoneLinkToken(token)
    expect(result).toEqual({ valid: true, phone })
  })

  it('returns valid=false for a token older than 10 minutes', () => {
    const phone = '+15551234567'
    // Create token using a timestamp 11 minutes in the past
    const pastTime = Date.now() - (TOKEN_MAX_AGE_MS + 60_000)
    vi.spyOn(Date, 'now').mockReturnValueOnce(pastTime)
    const token = createPhoneLinkToken(phone)
    // Restore Date.now for verification (current time)
    const result = verifyPhoneLinkToken(token)
    expect(result).toEqual({ valid: false })
  })

  it('returns valid=false for a token with a tampered phone number', () => {
    const token = createPhoneLinkToken('+15551234567')
    // Decode, change phone, re-encode without recalculating HMAC
    const decoded = Buffer.from(token, 'base64').toString('utf8')
    const parts = decoded.split(':')
    parts[0] = '+19999999999' // tampered phone
    const tampered = Buffer.from(parts.join(':')).toString('base64')
    const result = verifyPhoneLinkToken(tampered)
    expect(result).toEqual({ valid: false })
  })

  it('returns valid=false for a token with a tampered timestamp', () => {
    const token = createPhoneLinkToken('+15551234567')
    const decoded = Buffer.from(token, 'base64').toString('utf8')
    const parts = decoded.split(':')
    parts[1] = String(Date.now() - 999) // tampered timestamp
    const tampered = Buffer.from(parts.join(':')).toString('base64')
    const result = verifyPhoneLinkToken(tampered)
    expect(result).toEqual({ valid: false })
  })

  it('returns valid=false for a token with a tampered HMAC', () => {
    const token = createPhoneLinkToken('+15551234567')
    const decoded = Buffer.from(token, 'base64').toString('utf8')
    const parts = decoded.split(':')
    parts[2] = 'a'.repeat(64) // tampered HMAC
    const tampered = Buffer.from(parts.join(':')).toString('base64')
    const result = verifyPhoneLinkToken(tampered)
    expect(result).toEqual({ valid: false })
  })

  it('returns valid=false for an empty string', () => {
    expect(verifyPhoneLinkToken('')).toEqual({ valid: false })
  })

  it('returns valid=false for garbage input', () => {
    expect(verifyPhoneLinkToken('not-a-valid-token-!!!!')).toEqual({ valid: false })
  })

  it('returns valid=false for a token with only two segments (missing HMAC)', () => {
    const malformed = Buffer.from('+15551234567:1234567890').toString('base64')
    expect(verifyPhoneLinkToken(malformed)).toEqual({ valid: false })
  })

  it('returns valid=false when a single character is changed in the token', () => {
    const phone = '+15551234567'
    const token = createPhoneLinkToken(phone)
    // Flip one character in the middle of the base64 string
    const chars = token.split('')
    const midIdx = Math.floor(chars.length / 2)
    chars[midIdx] = chars[midIdx] === 'A' ? 'B' : 'A'
    const modified = chars.join('')
    const result = verifyPhoneLinkToken(modified)
    expect(result).toEqual({ valid: false })
  })
})
