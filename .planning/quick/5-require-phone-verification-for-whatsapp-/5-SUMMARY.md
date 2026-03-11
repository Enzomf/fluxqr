---
phase: quick-5
plan: 01
subsystem: phone-verification
tags: [profiles, otp, server-actions, qr-form, dashboard]
dependency_graph:
  requires: [profiles table with phone_number column (migration 0002), check-otp action, createAdminClient]
  provides: [profiles.phone_number populated on OTP verify, dashboard reads phone from profiles]
  affects: [dashboard/new, dashboard/[id]/edit, qr-form verification gate]
tech_stack:
  added: []
  patterns: [admin client for cross-RLS profile write, dynamic import to avoid top-level server import in public action]
key_files:
  created: []
  modified:
    - src/app/actions/check-otp.ts
    - src/app/dashboard/new/page.tsx
    - src/app/dashboard/new/actions.ts
    - src/app/dashboard/[id]/edit/page.tsx
    - src/app/dashboard/[id]/edit/actions.ts
    - src/components/qr-management/qr-form.tsx
decisions:
  - Dynamic import of server/admin in check-otp.ts avoids top-level server import in the module that is also called from the unauthenticated public flow
  - profiles.phone_number update is non-blocking (try/catch, best-effort) — cookie remains for unauthenticated flow fallback
  - Server action rejects WhatsApp/SMS creates/edits when profiles.phone_number is null (hard gate, not soft fallback)
  - QrForm verification gate is create-mode only — edit mode always shows read-only chip (existing QRs already have a phone stored)
metrics:
  duration: 2 min
  completed: "2026-03-11"
  tasks_completed: 2
  files_modified: 6
---

# Quick Task 5: Require Phone Verification for WhatsApp/SMS (profiles as source of truth) Summary

**One-liner:** Profiles table becomes the authoritative phone source for dashboard QR flows — OTP verification writes to profiles, dashboard pages and server actions read from profiles instead of cookie.

## What Was Built

Phone verification persistence migrated from cookie-only to database-first for authenticated users. The `verified_phone` cookie remains for the unauthenticated public QR creation flow, but the dashboard now uses `profiles.phone_number` as the source of truth.

### Changes by File

**`src/app/actions/check-otp.ts`**
After setting the `verified_phone` cookie (kept for public flow), a non-blocking try/catch block checks if the current user is authenticated. If so, it uses `createAdminClient()` (service-role, bypasses RLS) to update `profiles.phone_number`. Dynamic imports are used to avoid importing server/admin modules at the top level (this module is also called from the unauthenticated flow). Failure is logged but non-fatal — the cookie remains as a fallback for the public flow.

**`src/app/dashboard/new/page.tsx`**
Replaced `cookies()` + `verified_phone` cookie lookup with a `supabase.from('profiles').select('phone_number')` query using the authenticated user's session (RLS: user can SELECT own row). Removed `cookies` import from `next/headers`.

**`src/app/dashboard/[id]/edit/page.tsx`**
Replaced the `Promise.all([createClient(), cookies()])` pattern with a sequential profiles table SELECT using the existing supabase client. Removed `cookies` import.

**`src/app/dashboard/new/actions.ts`**
Replaced cookie-based phone enforcement with a profiles table SELECT. If `profiles.phone_number` is null, the action now returns an error message instead of silently continuing. The `cookies` import is removed.

**`src/app/dashboard/[id]/edit/actions.ts`**
Same pattern as new/actions.ts for the edit flow. `cookies` import removed.

**`src/components/qr-management/qr-form.tsx`**
Added `Link` import from `next/link`. Added a third branch in the contact target conditional: when `isPhonePlatform && !verifiedPhone && mode === 'create'`, shows a verification gate card with a link to `/` for phone verification. Submit button is disabled in this state. Edit mode and Telegram flows are unaffected.

## Deviations from Plan

None — plan executed exactly as written.

## Success Criteria Verification

- Authenticated OTP verification saves phone to profiles.phone_number: YES (check-otp.ts)
- Dashboard pages read verified phone from profiles table, not cookie: YES (new/page.tsx, edit/page.tsx)
- Server actions enforce profiles.phone_number for WhatsApp/SMS (reject if missing): YES (new/actions.ts, edit/actions.ts)
- Public unauthenticated flow remains cookie-based (no regression): YES (cookie still set in check-otp.ts)
- Auth callback continues to save phone on Google sign-in (already implemented, unchanged): YES (not touched)
- QrForm shows clear verification prompt when phone is missing for WhatsApp/SMS: YES (qr-form.tsx)
- TypeScript compiles cleanly: YES

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 509b8c5 | feat(quick-5): persist phone to profiles on OTP verify, read from profiles in dashboard pages |
| 2 | b74fe51 | feat(quick-5): enforce profiles.phone_number in server actions, add verification gate UI |

## Self-Check: PASSED

All modified files verified to exist and both commits confirmed in git log.
