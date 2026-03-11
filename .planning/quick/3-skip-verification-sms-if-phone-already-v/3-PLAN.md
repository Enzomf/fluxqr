---
phase: quick-3
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - src/app/page.tsx
  - src/app/actions/verify-phone.ts
autonomous: true
must_haves:
  truths:
    - "User with verified_phone cookie lands directly on QR type grid (no phone form flash)"
    - "sendOtp action returns early without Twilio call if phone already verified via cookie"
  artifacts:
    - path: "src/app/page.tsx"
      provides: "Dynamic rendering guarantee for cookie reads"
      contains: "force-dynamic"
    - path: "src/app/actions/verify-phone.ts"
      provides: "Cookie guard preventing redundant SMS"
      contains: "verified_phone"
  key_links:
    - from: "src/app/page.tsx"
      to: "src/app/home-client.tsx"
      via: "verifiedPhone prop from cookie"
      pattern: "verifiedPhone"
---

<objective>
Harden the phone verification skip path so that a returning user with a `verified_phone` cookie never sees the phone form and never triggers a Twilio SMS.

Purpose: Prevent wasted SMS costs and eliminate any flash of the phone input for already-verified users. The client-side step logic already skips to 'grid' when `verifiedPhone` is truthy, but two defense-in-depth measures are missing: (1) the home page has no explicit `force-dynamic` export, relying on implicit dynamism from `cookies()` -- which could break if Next.js behavior changes or a data cache layer is added; (2) the `sendOtp` server action has no guard checking the cookie, so a stale-cached form submission could still burn a Twilio verification.

Output: Updated `page.tsx` with explicit dynamic export, updated `verify-phone.ts` with cookie guard.
</objective>

<execution_context>
@/Users/enzo.figueiredo/.claude/get-shit-done/workflows/execute-plan.md
@/Users/enzo.figueiredo/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/app/page.tsx
@src/app/home-client.tsx
@src/app/actions/verify-phone.ts
@src/app/actions/check-otp.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add force-dynamic export and cookie guard to sendOtp</name>
  <files>src/app/page.tsx, src/app/actions/verify-phone.ts</files>
  <action>
Two changes:

1. **src/app/page.tsx** -- Add `export const dynamic = 'force-dynamic'` at the top of the file (after imports, before the component). This explicitly prevents any caching of the home page, ensuring the `verified_phone` cookie is always read fresh on every request. The `cookies()` call already makes this implicit, but an explicit export is defense-in-depth and documents intent.

2. **src/app/actions/verify-phone.ts** -- In the `sendOtp` function, BEFORE the phone validation/Twilio call, read the `verified_phone` cookie using `cookies()` from `next/headers`. If the cookie exists and is non-empty, return early with `{ success: true, phone: cookieValue }` WITHOUT calling `sendVerification()`. This prevents burning a Twilio SMS credit if the form is somehow submitted by a user who already has a valid cookie (e.g., stale router cache, browser back button, or direct form replay).

Add `import { cookies } from 'next/headers'` to verify-phone.ts.

The guard in `sendOtp` should be:
```typescript
const cookieStore = await cookies()
const existingPhone = cookieStore.get('verified_phone')?.value
if (existingPhone) {
  return { success: true, phone: existingPhone }
}
```

Place this at the very top of `sendOtp`, before the `formData.get('phone')` line.

Do NOT add the guard to `resendOtp` -- that function is only called from `OtpVerifyForm` which is only visible during active OTP entry (the user explicitly requested a code). If the user is mid-OTP-flow, resend should work.
  </action>
  <verify>
    <automated>cd /Users/enzo.figueiredo/www/fluxqr && npx tsc --noEmit 2>&1 | head -30</automated>
  </verify>
  <done>
    - page.tsx has `export const dynamic = 'force-dynamic'` ensuring no cached responses
    - sendOtp checks verified_phone cookie and returns early if present (no Twilio call)
    - resendOtp is unchanged
    - TypeScript compiles without errors
  </done>
</task>

</tasks>

<verification>
1. `npx tsc --noEmit` passes with no errors
2. Manual check: With `verified_phone` cookie set, loading `/` goes straight to QR type grid (no phone form)
3. Manual check: Calling `sendOtp` when cookie exists returns success without triggering SMS
</verification>

<success_criteria>
- Returning users with verified_phone cookie see QR type grid immediately (no phone form flash)
- sendOtp action short-circuits when cookie exists (no Twilio API call, no SMS cost)
- All existing functionality preserved -- new users without cookie still see phone form and receive SMS normally
</success_criteria>

<output>
After completion, create `.planning/quick/3-skip-verification-sms-if-phone-already-v/3-SUMMARY.md`
</output>
