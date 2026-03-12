import { describe, it, expect, vi, beforeEach } from 'vitest'
import { sendVerification, checkVerification } from './twilio'

const MOCK_SERVICE_SID = 'test-service'
const VERIFY_BASE = 'https://verify.twilio.com/v2/Services'

function makeOkResponse(body: unknown) {
  return {
    ok: true,
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Response
}

function makeErrorResponse(body: unknown) {
  return {
    ok: false,
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Response
}

describe('sendVerification', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    vi.stubEnv('TWILIO_API_KEY_SID', 'test-sid')
    vi.stubEnv('TWILIO_API_KEY_SECRET', 'test-secret')
    vi.stubEnv('TWILIO_VERIFY_SERVICE_SID', MOCK_SERVICE_SID)
  })

  it('calls the correct Twilio Verify URL with POST method', async () => {
    vi.mocked(fetch).mockResolvedValue(makeOkResponse({ sid: 'VE123' }))

    await sendVerification('+5511999998888')

    expect(fetch).toHaveBeenCalledOnce()
    const [url, opts] = vi.mocked(fetch).mock.calls[0]
    expect(url).toBe(`${VERIFY_BASE}/${MOCK_SERVICE_SID}/Verifications`)
    expect((opts as RequestInit).method).toBe('POST')
  })

  it('includes a Basic auth header with base64-encoded credentials', async () => {
    vi.mocked(fetch).mockResolvedValue(makeOkResponse({ sid: 'VE123' }))

    await sendVerification('+5511999998888')

    const [, opts] = vi.mocked(fetch).mock.calls[0]
    const expectedAuth =
      'Basic ' + Buffer.from('test-sid:test-secret').toString('base64')
    expect((opts as RequestInit & { headers: Record<string, string> }).headers['Authorization']).toBe(
      expectedAuth
    )
  })

  it('sends To and Channel=sms in the request body', async () => {
    vi.mocked(fetch).mockResolvedValue(makeOkResponse({ sid: 'VE123' }))

    await sendVerification('+5511999998888')

    const [, opts] = vi.mocked(fetch).mock.calls[0]
    const body = (opts as RequestInit).body as URLSearchParams
    expect(body.get('To')).toBe('+5511999998888')
    expect(body.get('Channel')).toBe('sms')
  })

  it('returns the parsed JSON response on success', async () => {
    vi.mocked(fetch).mockResolvedValue(makeOkResponse({ sid: 'VE123', status: 'pending' }))

    const result = await sendVerification('+5511999998888')
    expect(result).toEqual({ sid: 'VE123', status: 'pending' })
  })

  it('throws an Error when the response is not ok', async () => {
    vi.mocked(fetch).mockResolvedValue(makeErrorResponse({ message: 'Invalid phone number' }))

    await expect(sendVerification('+bad')).rejects.toThrow('Invalid phone number')
  })
})

describe('checkVerification', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    vi.stubEnv('TWILIO_API_KEY_SID', 'test-sid')
    vi.stubEnv('TWILIO_API_KEY_SECRET', 'test-secret')
    vi.stubEnv('TWILIO_VERIFY_SERVICE_SID', MOCK_SERVICE_SID)
  })

  it('calls the VerificationCheck URL with To and Code params', async () => {
    vi.mocked(fetch).mockResolvedValue(makeOkResponse({ status: 'approved' }))

    await checkVerification('+5511999998888', '123456')

    const [url, opts] = vi.mocked(fetch).mock.calls[0]
    expect(url).toBe(`${VERIFY_BASE}/${MOCK_SERVICE_SID}/VerificationCheck`)
    expect((opts as RequestInit).method).toBe('POST')

    const body = (opts as RequestInit).body as URLSearchParams
    expect(body.get('To')).toBe('+5511999998888')
    expect(body.get('Code')).toBe('123456')
  })

  it('returns parsed JSON with status field on success', async () => {
    vi.mocked(fetch).mockResolvedValue(makeOkResponse({ status: 'approved' }))

    const result = await checkVerification('+5511999998888', '123456')
    expect(result.status).toBe('approved')
  })

  it('throws an Error when the response is not ok', async () => {
    vi.mocked(fetch).mockResolvedValue(makeErrorResponse({ message: 'Incorrect token' }))

    await expect(checkVerification('+5511999998888', 'wrong')).rejects.toThrow('Incorrect token')
  })
})
