---
phase: quick-19
plan: 01
subsystem: auth
tags: [hmac, security, cookies, oauth, account-linking, crypto]

requires:
  - phase: quick-5
    provides: OAuth callback account linking with verified_phone cookie
  - phase: quick-3
    provides: OTP verification flow that sets verified_phone cookie

provides:
  - HMAC-signed phone link token utility (createPhoneLinkToken / verifyPhoneLinkToken)
  - Secure account linking flow resistant to cookie forgery attacks
  - 11 unit tests covering token validity, expiry, tamper detection, and malformed input

affects: [auth, oauth-callback, otp-verification, account-linking]

tech-stack:
  added: []
  patterns:
    - HMAC-signed short-lived tokens for security-sensitive cookie values
    - timingSafeEqual for HMAC comparison to prevent timing attacks
    - Dual-cookie pattern: UI cookie (plain, 30d) + security cookie (HMAC-signed, 10min)

key-files:
  created:
    - src/lib/phone-token.ts
    - src/lib/phone-token.test.ts
  modified:
    - src/app/actions/check-otp.ts
    - src/app/auth/callback/route.ts

key-decisions:
  - "SUPABASE_SERVICE_ROLE_KEY used as HMAC secret — already server-only, never exposed to client"
  - "verified_phone cookie kept unchanged (UI display), phone_link_token is separate security cookie"
  - "phone_link_token always deleted after OAuth callback regardless of HMAC validity (prevent replay)"
  - "Token age validated server-side: Date.now() - timestamp > TOKEN_MAX_AGE_MS (10 min)"
  - "timingSafeEqual prevents timing attacks on HMAC comparison"

patterns-established:
  - "Short-lived HMAC tokens: use createPhoneLinkToken/verifyPhoneLinkToken for any server-verified value that must be passed through cookies securely"

requirements-completed: [SEC-01]

duration: 2min
completed: 2026-03-13
---

# Quick Task 19: Fix Account Takeover via Verified Phone Summary

**HMAC-SHA256 signed phone link tokens replace plain-text cookie for OAuth account linking, blocking forged verified_phone cookie attacks**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-13T00:04:36Z
- **Completed:** 2026-03-13T00:06:39Z
- **Tasks:** 3 (TDD: RED + GREEN for Task 1)
- **Files modified:** 4

## Accomplishments

- Created `src/lib/phone-token.ts` with HMAC-SHA256 token signing and timing-safe verification, closing the account takeover vulnerability
- Added 11 unit tests covering all attack vectors: token forgery, expiry bypass, HMAC tampering, garbage input
- Patched `check-otp.ts` to set `phone_link_token` (HMAC-signed, 10 min) alongside existing `verified_phone` (UI-only, 30 days)
- Patched OAuth callback to verify HMAC before any QR code linking, making forged cookies ineffective

## Task Commits

Each task was committed atomically:

1. **Task 1: Create HMAC phone-token utility with tests** - `ae88e45` (feat + test, TDD)
2. **Task 2: Patch check-otp to set signed phone_link_token cookie** - `395d848` (feat)
3. **Task 3: Patch OAuth callback to verify HMAC token before linking** - `21ee9c8` (fix)

## Files Created/Modified

- `src/lib/phone-token.ts` - HMAC-SHA256 token creation and verification with timing-safe comparison
- `src/lib/phone-token.test.ts` - 11 unit tests covering valid round-trip, expiry, tamper detection, malformed input
- `src/app/actions/check-otp.ts` - Sets `phone_link_token` (httpOnly, 10 min) after successful OTP verification
- `src/app/auth/callback/route.ts` - Reads `phone_link_token`, verifies HMAC before QR linking; `verified_phone` no longer used for security decisions

## Decisions Made

- `SUPABASE_SERVICE_ROLE_KEY` chosen as HMAC secret: already server-only, never client-exposed, no new env var needed
- `verified_phone` cookie kept unchanged for UI purposes (phone chip display in forms); security operation uses separate `phone_link_token`
- `phone_link_token` deleted unconditionally after OAuth callback to prevent replay attacks
- `timingSafeEqual` from Node.js `crypto` used for constant-time HMAC comparison

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

Pre-existing TypeScript error in `qr-form-dialog.test.tsx` (missing `phone_number` field in test fixture) detected during `tsc --noEmit`. This error predates this task and is out of scope. No errors in any of the files touched by this plan. Logged for future fix.

## Next Phase Readiness

- Account linking security patch is complete and deployed
- The `createPhoneLinkToken`/`verifyPhoneLinkToken` utility can be reused for any future server-issued cookie verification patterns
- Pre-existing `qr-form-dialog.test.tsx` TypeScript error should be addressed in a future quick task

---
*Phase: quick-19*
*Completed: 2026-03-13*
