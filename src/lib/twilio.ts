const VERIFY_BASE = 'https://verify.twilio.com/v2/Services'

function getAuthHeader() {
  const sid = process.env.TWILIO_API_KEY_SID!
  const secret = process.env.TWILIO_API_KEY_SECRET!
  return 'Basic ' + Buffer.from(`${sid}:${secret}`).toString('base64')
}

/**
 * Send an SMS OTP via Twilio Verify Service.
 */
export async function sendVerification(phone: string) {
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID!
  const res = await fetch(`${VERIFY_BASE}/${serviceSid}/Verifications`, {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ To: phone, Channel: 'sms' }),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || 'Failed to send verification')
  }

  return res.json()
}

/**
 * Check an OTP code via Twilio Verify Service.
 * Returns an object with `.status === 'approved'` on success.
 */
export async function checkVerification(phone: string, code: string) {
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID!
  const res = await fetch(`${VERIFY_BASE}/${serviceSid}/VerificationCheck`, {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ To: phone, Code: code }),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || 'Failed to check verification')
  }

  return res.json() as Promise<{ status: 'approved' | 'pending' | 'canceled' }>
}
