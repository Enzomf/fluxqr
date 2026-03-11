import twilio from 'twilio'

let client: ReturnType<typeof twilio> | null = null

export function getTwilioClient() {
  if (!client) {
    client = twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    )
  }
  return client
}

/**
 * Send an SMS OTP via Twilio Verify.
 * Phone must be in E.164 format (e.g. +14155552671).
 */
export async function sendVerification(phone: string) {
  const client = getTwilioClient()
  return client.verify.v2
    .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
    .verifications.create({ to: phone, channel: 'sms' })
}

/**
 * Check an OTP code entered by the user via Twilio Verify.
 * Phone must be in E.164 format (e.g. +14155552671).
 * Returns the verification object — check `.status === 'approved'` for success.
 */
export async function checkVerification(phone: string, code: string) {
  const client = getTwilioClient()
  return client.verify.v2
    .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
    .verificationChecks.create({ to: phone, code })
}
