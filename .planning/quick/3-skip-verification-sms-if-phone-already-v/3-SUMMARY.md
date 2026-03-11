---
phase: quick-3
plan: 1
subsystem: public-home
tags: [phone-verification, sms, defense-in-depth, caching, twilio]
dependency_graph:
  requires: []
  provides: [verified-phone-skip-path]
  affects: [src/app/page.tsx, src/app/actions/verify-phone.ts]
tech_stack:
  added: []
  patterns: [force-dynamic export, server action cookie guard]
key_files:
  created: []
  modified:
    - src/app/page.tsx
    - src/app/actions/verify-phone.ts
decisions:
  - force-dynamic export is defense-in-depth alongside cookies() implicit dynamism — explicit is better than implicit for caching guarantees
  - sendOtp cookie guard returns early before phone validation to minimize work and prevent any Twilio API call
  - resendOtp intentionally left unguarded — only reachable during active OTP flow where user explicitly requested a new code
metrics:
  duration: 5 min
  completed: "2026-03-11"
  tasks_completed: 1
  files_modified: 2
---

# Quick Task 3: Skip Verification SMS If Phone Already Verified — Summary

**One-liner:** Defense-in-depth cookie guard prevents redundant Twilio SMS + force-dynamic guarantees fresh cookie reads on every home page request.

## What Was Done

### Task 1: Add force-dynamic export and cookie guard to sendOtp

**src/app/page.tsx** — Added `export const dynamic = 'force-dynamic'` after imports. The `cookies()` call already makes the page dynamically rendered implicitly, but the explicit export documents intent and provides a stable guarantee that won't break if Next.js caching behavior changes or a data cache layer is added in future.

**src/app/actions/verify-phone.ts** — Added `import { cookies } from 'next/headers'` and a cookie guard at the very top of `sendOtp` (before `formData.get('phone')`). If the `verified_phone` cookie is present and non-empty, the function returns `{ success: true, phone: existingPhone }` immediately without calling `sendVerification()`. This prevents burning a Twilio SMS credit in edge cases: stale router cache, browser back button, or direct form replay.

`resendOtp` was left unchanged as the plan specifies — it is only reachable from `OtpVerifyForm` which is only visible during an active OTP entry flow where the user explicitly requested a resend.

## Commits

| Hash | Message |
|------|---------|
| 97ebd12 | feat(quick-3): add force-dynamic export and sendOtp cookie guard |

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- `src/app/page.tsx` contains `export const dynamic = 'force-dynamic'` — FOUND
- `src/app/actions/verify-phone.ts` contains cookie guard before formData.get — FOUND
- `resendOtp` unchanged — CONFIRMED
- `npx tsc --noEmit` — PASSED with no errors
