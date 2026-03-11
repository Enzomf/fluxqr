---
phase: 05-public-qr-generation-with-phone-verification-usage-limits-and-admin-dashboard
plan: 02
subsystem: auth
tags: [twilio, otp, sms, phone-verification, cookies, zod, input-otp, server-actions]

# Dependency graph
requires:
  - phase: 05-01
    provides: sendVerification and checkVerification from src/lib/twilio.ts, InputOTP components from shadcn

provides:
  - sendOtp Server Action (form action) — validates E.164 phone and sends OTP via Twilio Verify
  - resendOtp Server Action (direct call) — resend without FormData for programmatic use
  - checkOtp Server Action — verifies OTP, sets httpOnly verified_phone cookie on success
  - PhoneVerifyForm client component — country code selector + local number input
  - OtpVerifyForm client component — 6-digit InputOTP with auto-submit and 60s resend cooldown

affects: [05-03, 05-04, 05-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "useActionState with wrapper function to merge countryCode prefix before calling server action"
    - "Direct Server Action import in client component for resend (no prop drilling)"
    - "useTransition for programmatic Server Action calls in event handlers"
    - "useEffect countdown timer for resend cooldown UX"

key-files:
  created:
    - src/app/actions/verify-phone.ts
    - src/app/actions/check-otp.ts
    - src/components/public/phone-verify-form.tsx
    - src/components/public/otp-verify-form.tsx
  modified: []

key-decisions:
  - "resendOtp exported as separate function (not form action) — OtpVerifyForm calls it directly without FormData, simpler than useActionState for a single-param call"
  - "checkOtp is a plain async function (not form action) — called programmatically on auto-submit when 6 digits entered, not tied to form submit event"
  - "ZodError uses .issues not .errors — fixed TypeScript error on safeParse result access"
  - "Phone masking: keep country code + last 4 digits visible, hide middle digits for privacy"

patterns-established:
  - "Server Action pattern: form actions use (prevState, formData) signature; programmatic calls use plain (param) signature"
  - "OTP resend handled inside OtpVerifyForm via direct import — no prop needed from parent"

requirements-completed: [PUB-02]

# Metrics
duration: 2min
completed: 2026-03-11
---

# Phase 5 Plan 02: Phone Verification Flow Summary

**sendOtp/checkOtp Server Actions with PhoneVerifyForm and OtpVerifyForm components — complete phone verification pipeline setting httpOnly verified_phone cookie on success**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-11T20:35:00Z
- **Completed:** 2026-03-11T20:36:48Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Two Server Actions covering full OTP lifecycle: send (form action + direct resend), verify (sets httpOnly cookie)
- PhoneVerifyForm with country code selector (9 common codes), local number input, and E.164 assembly before server call
- OtpVerifyForm with auto-submit on 6-digit completion via useTransition, 60-second resend cooldown, and inline error display
- Zod validation at server boundary before any Twilio call

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Server Actions for phone verification** - `2ae7d94` (feat)
2. **Task 2: Create phone verification and OTP client components** - `4b4a492` (feat)

**Plan metadata:** (docs commit — see final_commit step)

## Files Created/Modified

- `src/app/actions/verify-phone.ts` — sendOtp form action + resendOtp direct call, E.164 zod validation
- `src/app/actions/check-otp.ts` — checkOtp verifies OTP status, sets httpOnly verified_phone cookie (30 days)
- `src/components/public/phone-verify-form.tsx` — PhoneVerifyForm with country code select and local number input
- `src/components/public/otp-verify-form.tsx` — OtpVerifyForm with InputOTP auto-submit, resend cooldown, masked phone display

## Decisions Made

- `resendOtp` exported as a separate plain function (not a form action) so OtpVerifyForm can call it directly with just `phone: string` — simpler than useActionState for a single-parameter resend call with no form involved
- `checkOtp` uses plain async function signature (not prevState/formData) because it is triggered programmatically when the user completes 6 digits, not via a form submit event
- ZodError `.issues` (not `.errors`) — TypeScript strict mode caught this during Task 1 verification and was auto-fixed inline

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] ZodError.errors property does not exist — changed to .issues**
- **Found during:** Task 1 (TypeScript verification)
- **Issue:** `result.error.errors[0]?.message` causes TS error — ZodError exposes `.issues` array, not `.errors`
- **Fix:** Replaced `.errors[0]` with `.issues[0]` in both sendOtp and resendOtp
- **Files modified:** src/app/actions/verify-phone.ts
- **Verification:** `pnpm exec tsc --noEmit` passes with zero errors
- **Committed in:** 2ae7d94 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug)
**Impact on plan:** Necessary TypeScript correctness fix. No scope change.

## Issues Encountered

None beyond the ZodError.issues fix noted above.

## User Setup Required

None — Twilio credentials were set up in Plan 01. No additional external service configuration required.

## Next Phase Readiness

- All server actions and client components ready for Plan 03 to wire into the home page (`/` route)
- Cookie name `verified_phone` is set — Plan 03 can read it server-side to skip verification for returning visitors
- `onVerificationSent` and `onVerified` props define the parent orchestration contract: parent manages which step (phone vs OTP) is shown

---
*Phase: 05-public-qr-generation-with-phone-verification-usage-limits-and-admin-dashboard*
*Completed: 2026-03-11*
