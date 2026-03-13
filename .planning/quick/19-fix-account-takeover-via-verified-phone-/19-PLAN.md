---
phase: quick-19
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/phone-token.ts
  - src/lib/phone-token.test.ts
  - src/app/actions/check-otp.ts
  - src/app/auth/callback/route.ts
autonomous: true
requirements: [SEC-01]

must_haves:
  truths:
    - "A forged verified_phone cookie cannot trigger QR code account linking"
    - "A legitimate OTP verification still links QR codes correctly after OAuth"
    - "Expired phone tokens (>10 min) are rejected in the OAuth callback"
    - "Phone token utility functions are covered by automated tests"
  artifacts:
    - path: "src/lib/phone-token.ts"
      provides: "HMAC-signed phone token creation and verification"
      exports: ["createPhoneLinkToken", "verifyPhoneLinkToken"]
    - path: "src/lib/phone-token.test.ts"
      provides: "Unit tests for phone token signing and verification"
      min_lines: 40
    - path: "src/app/actions/check-otp.ts"
      provides: "Sets phone_link_token cookie with HMAC-signed token after OTP"
      contains: "createPhoneLinkToken"
    - path: "src/app/auth/callback/route.ts"
      provides: "Verifies HMAC token before linking QR codes"
      contains: "verifyPhoneLinkToken"
  key_links:
    - from: "src/app/actions/check-otp.ts"
      to: "src/lib/phone-token.ts"
      via: "import createPhoneLinkToken"
      pattern: "createPhoneLinkToken"
    - from: "src/app/auth/callback/route.ts"
      to: "src/lib/phone-token.ts"
      via: "import verifyPhoneLinkToken"
      pattern: "verifyPhoneLinkToken"
---

<objective>
Fix HIGH severity account takeover vulnerability where an attacker can forge the `verified_phone` cookie to steal QR codes during OAuth account linking.

Purpose: The current OAuth callback reads a plain-text `verified_phone` cookie and uses an admin client to link QR codes to the authenticated user. An attacker can set this cookie to any phone number, sign in with Google, and hijack all unlinked QR codes for that phone. The fix uses HMAC-signed tokens so only server-verified phone numbers can trigger account linking.

Output: Secure phone-token utility with tests, patched check-otp action, patched OAuth callback.
</objective>

<execution_context>
@/Users/enzo.figueiredo/.claude/get-shit-done/workflows/execute-plan.md
@/Users/enzo.figueiredo/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/app/auth/callback/route.ts
@src/app/actions/check-otp.ts
@src/lib/supabase/admin.ts
@CLAUDE.md
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Create HMAC phone-token utility with tests</name>
  <files>src/lib/phone-token.ts, src/lib/phone-token.test.ts</files>
  <behavior>
    - createPhoneLinkToken(phone) returns a base64-encoded string containing phone:timestamp:hmac
    - verifyPhoneLinkToken(token) returns { valid: true, phone } for a freshly created token
    - verifyPhoneLinkToken(token) returns { valid: false } for a token older than 10 minutes
    - verifyPhoneLinkToken(token) returns { valid: false } for a token with tampered phone number
    - verifyPhoneLinkToken(token) returns { valid: false } for a token with tampered HMAC
    - verifyPhoneLinkToken(token) returns { valid: false } for empty/malformed/garbage input
    - verifyPhoneLinkToken(token) returns { valid: false } for a token with missing segments
    - Uses crypto.createHmac('sha256', secret) with SUPABASE_SERVICE_ROLE_KEY as the HMAC key
  </behavior>
  <action>
    Create `src/lib/phone-token.ts` with two exported functions:

    1. `createPhoneLinkToken(phone: string): string`
       - Build payload: `{phone}:{Date.now()}`
       - Compute HMAC-SHA256 of payload using `process.env.SUPABASE_SERVICE_ROLE_KEY!`
       - Return Base64 encoding of `{phone}:{timestamp}:{hmacHex}`

    2. `verifyPhoneLinkToken(token: string): { valid: true; phone: string } | { valid: false }`
       - Decode from Base64
       - Split on `:` — expect exactly 3 parts (phone, timestamp, hmac)
       - Recompute HMAC of `{phone}:{timestamp}` using same secret
       - Use `crypto.timingSafeEqual` to compare HMACs (prevents timing attacks)
       - Check timestamp is within 10 minutes of now (`TOKEN_MAX_AGE_MS = 10 * 60 * 1000`)
       - Return `{ valid: true, phone }` only if HMAC matches AND timestamp is fresh

    Use Node.js built-in `crypto` module. No external dependencies.
    Export a `TOKEN_MAX_AGE_MS` constant for test usage.

    Then create `src/lib/phone-token.test.ts`:
    - Set `process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-secret-key-for-hmac'` in beforeEach
    - Test all behaviors listed above
    - For expiry test: mock `Date.now` to return a value 11 minutes in the past for the creation call, then restore for verification (or create token, then mock Date.now to be 11 min ahead for verify)
    - Test that modifying any character in the token invalidates it
  </action>
  <verify>
    <automated>cd /Users/enzo.figueiredo/www/fluxqr && npx vitest run src/lib/phone-token.test.ts</automated>
  </verify>
  <done>phone-token.ts exports createPhoneLinkToken and verifyPhoneLinkToken. All test cases pass: valid token round-trips, expired token rejected, tampered token rejected, malformed input rejected.</done>
</task>

<task type="auto">
  <name>Task 2: Patch check-otp to set signed phone_link_token cookie</name>
  <files>src/app/actions/check-otp.ts</files>
  <action>
    Modify `src/app/actions/check-otp.ts`:

    1. Add import: `import { createPhoneLinkToken } from '@/lib/phone-token'`

    2. After the existing `verified_phone` cookie is set (line 41-47), add a SECOND cookie `phone_link_token`:
       ```typescript
       const phoneLinkToken = createPhoneLinkToken(phone)
       cookieStore.set('phone_link_token', phoneLinkToken, {
         httpOnly: true,
         secure: process.env.NODE_ENV === 'production',
         sameSite: 'lax',
         maxAge: 60 * 10, // 10 minutes — matches token validity window
         path: '/',
       })
       ```

    3. KEEP the existing `verified_phone` cookie as-is (it serves the UI for showing verified phone in forms). The `phone_link_token` cookie is a SEPARATE cookie used exclusively for the secure account-linking flow in the OAuth callback.

    Do NOT change the `verified_phone` cookie maxAge or behavior — it has a different purpose (UI display).
  </action>
  <verify>
    <automated>cd /Users/enzo.figueiredo/www/fluxqr && npx tsc --noEmit</automated>
  </verify>
  <done>check-otp.ts sets both `verified_phone` (UI, 30 days) and `phone_link_token` (HMAC-signed, 10 min) cookies after successful OTP verification. TypeScript compiles without errors.</done>
</task>

<task type="auto">
  <name>Task 3: Patch OAuth callback to verify HMAC token before linking</name>
  <files>src/app/auth/callback/route.ts</files>
  <action>
    Modify `src/app/auth/callback/route.ts`:

    1. Add import: `import { verifyPhoneLinkToken } from '@/lib/phone-token'`

    2. Replace the vulnerable account-linking block (lines 41-59) with:
       ```typescript
       const phoneLinkToken = cookieStore.get('phone_link_token')?.value

       if (phoneLinkToken && user) {
         const tokenResult = verifyPhoneLinkToken(phoneLinkToken)

         if (tokenResult.valid) {
           const admin = createAdminClient()

           // Link phone QR codes (user_id = null) to the authenticated user
           await admin
             .from('qr_codes')
             .update({ user_id: user.id })
             .eq('phone_number', tokenResult.phone)
             .is('user_id', null)

           // Upsert profile with the verified phone number
           await admin
             .from('profiles')
             .upsert({ id: user.id, phone_number: tokenResult.phone }, { onConflict: 'id' })
         }

         // Always clean up the token cookie regardless of validity
         cookieStore.delete('phone_link_token')
       }
       ```

    3. Update the response cookie cleanup (around line 71) to also delete `phone_link_token`:
       ```typescript
       response.cookies.delete('verified_phone')
       response.cookies.delete('phone_link_token')
       ```

    Key changes from the vulnerable version:
    - Reads `phone_link_token` (HMAC-signed) instead of `verified_phone` (plain text)
    - Verifies HMAC signature before any DB operations (proves OUR server issued the token)
    - Uses `tokenResult.phone` (from verified token) instead of raw cookie value
    - Token has 10-minute validity window (vs 30-day cookie before)
    - Forged cookies will fail HMAC verification and be silently discarded

    Do NOT remove the `verified_phone` cookie deletion — keep it for cleanup of any lingering old cookies.
  </action>
  <verify>
    <automated>cd /Users/enzo.figueiredo/www/fluxqr && npx tsc --noEmit</automated>
  </verify>
  <done>OAuth callback reads phone_link_token instead of verified_phone for account linking. HMAC verification prevents forged cookies from triggering QR code linking. Plain verified_phone cookie is no longer used for any security-sensitive operation. TypeScript compiles without errors.</done>
</task>

</tasks>

<verification>
1. `npx vitest run src/lib/phone-token.test.ts` — all phone-token unit tests pass
2. `npx tsc --noEmit` — zero TypeScript errors across the project
3. Manual verification: the `verified_phone` cookie (plain text, 30 days) is still set for UI purposes but is NEVER used for account linking decisions
4. Manual verification: only `phone_link_token` (HMAC-signed, 10 min) is checked in the OAuth callback, and only after HMAC + timestamp validation passes
</verification>

<success_criteria>
- phone-token.ts utility exists with HMAC signing/verification using SUPABASE_SERVICE_ROLE_KEY
- All unit tests pass (valid round-trip, expiry rejection, tamper rejection, malformed rejection)
- check-otp.ts sets phone_link_token cookie alongside verified_phone after OTP success
- auth/callback/route.ts verifies HMAC token before any QR code linking operations
- A forged verified_phone cookie alone cannot trigger account linking
- TypeScript compiles cleanly
</success_criteria>

<output>
After completion, create `.planning/quick/19-fix-account-takeover-via-verified-phone-/19-SUMMARY.md`
</output>
