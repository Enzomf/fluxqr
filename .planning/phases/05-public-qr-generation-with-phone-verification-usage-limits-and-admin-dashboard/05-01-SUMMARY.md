---
phase: 05-public-qr-generation-with-phone-verification-usage-limits-and-admin-dashboard
plan: "01"
subsystem: database
tags: [twilio, sms, otp, supabase, postgres, rls, migrations, typescript]

# Dependency graph
requires:
  - phase: 03-qr-management
    provides: qr_codes table and existing RLS/RPC foundation
provides:
  - Twilio Verify client factory (getTwilioClient, sendVerification, checkVerification)
  - Service-role Supabase admin client (createAdminClient, bypasses RLS)
  - Phase 5 DB schema — app_role enum, profiles table, phone_usage table, qr_codes nullable user_id + phone_number, auto-profile trigger
  - Updated QrCode type with nullable user_id and phone_number
  - AppRole and Profile TypeScript types
  - shadcn InputOTP component
affects:
  - 05-02 (phone verification flow uses twilio.ts + admin.ts)
  - 05-03 (usage limits reads phone_usage via admin client)
  - 05-04 (account linking writes to profiles and qr_codes.user_id)
  - 05-05 (admin dashboard reads profiles table via admin client)

# Tech tracking
tech-stack:
  added:
    - twilio 5.12.2 (Twilio Verify SDK for SMS OTP)
    - input-otp (peer dep via shadcn CLI)
  patterns:
    - Lazy Twilio singleton — getTwilioClient() caches client instance across calls
    - Service-role admin client — createAdminClient() used only in Server Actions, never client components
    - Nullable user_id in qr_codes — enables public QR creation before account linking

key-files:
  created:
    - src/lib/twilio.ts
    - src/lib/supabase/admin.ts
    - supabase/migrations/0002_phase5_schema.sql
    - src/components/ui/input-otp.tsx
  modified:
    - src/types/index.ts
    - src/app/q/[slug]/page.tsx
    - package.json
    - pnpm-lock.yaml

key-decisions:
  - "No 'use server' on twilio.ts or admin.ts — they are utility modules, not Server Actions; tree-shaking handles server-only boundary (same pattern as qr-generator.ts)"
  - "createAdminClient() uses @supabase/supabase-js not @supabase/ssr — no cookie handling needed for service-role operations"
  - "phone_usage table has no RLS — exclusively accessed via service-role admin client to enforce freemium limits safely"
  - "Partial index on qr_codes(phone_number) WHERE user_id IS NULL — efficient lookup of unlinked phone-created QR codes"

patterns-established:
  - "Pattern: Lazy singleton for external SDK clients (Twilio) — avoids reinstantiating on every request"
  - "Pattern: Admin client (service-role) for all cross-user or RLS-bypassing DB operations"

requirements-completed: [PUB-02, PUB-03, PUB-04]

# Metrics
duration: 2min
completed: 2026-03-11
---

# Phase 5 Plan 01: Foundation Summary

**Twilio Verify client, service-role Supabase admin client, Phase 5 DB schema (profiles + phone_usage + qr_codes alterations), and updated TypeScript types enabling public phone-verified QR creation**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-11T20:30:56Z
- **Completed:** 2026-03-11T20:32:38Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Installed twilio 5.12.2 and created `src/lib/twilio.ts` with lazy singleton client, `sendVerification`, and `checkVerification` helpers for Twilio Verify SMS OTP
- Created `src/lib/supabase/admin.ts` with `createAdminClient()` using service-role key — bypasses RLS for admin dashboard and account linking operations
- Created `supabase/migrations/0002_phase5_schema.sql` with full Phase 5 DDL: `app_role` enum, `profiles` table with auto-trigger, `phone_usage` table (no RLS), and `qr_codes` alterations (nullable `user_id`, new `phone_number` column, partial index)
- Updated `src/types/index.ts` to make `QrCode.user_id` nullable, add `phone_number`, and export new `AppRole` and `Profile` types
- Added `src/components/ui/input-otp.tsx` via shadcn CLI for OTP input UI in downstream plans

## Task Commits

Each task was committed atomically:

1. **Task 1: Install dependencies and create server-side utility modules** - `51aa100` (feat)
2. **Task 2: Create database migration and update TypeScript types** - `1ee936b` (feat)

## Files Created/Modified
- `src/lib/twilio.ts` — Twilio Verify factory and sendVerification/checkVerification helpers
- `src/lib/supabase/admin.ts` — Service-role admin client factory (bypasses RLS)
- `supabase/migrations/0002_phase5_schema.sql` — All Phase 5 DDL changes
- `src/types/index.ts` — Updated QrCode type + AppRole + Profile types
- `src/components/ui/input-otp.tsx` — shadcn InputOTP primitive for OTP flows
- `src/app/q/[slug]/page.tsx` — Added phone_number to select list
- `package.json` + `pnpm-lock.yaml` — Added twilio dependency

## Decisions Made
- No `'use server'` directive on `twilio.ts` or `admin.ts` — they are utility modules, not Server Actions; tree-shaking handles the server-only boundary (same pattern as the existing `qr-generator.ts`)
- `createAdminClient()` imports from `@supabase/supabase-js` not `@supabase/ssr` — no cookie handling needed for service-role bypass operations
- `phone_usage` table has no RLS — accessed exclusively via the admin client to enforce freemium limits safely
- Partial index `idx_qr_codes_phone_unlinked` on `qr_codes(phone_number) WHERE user_id IS NULL` — efficient lookup of phone-created QR codes before account linking

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Added phone_number to scanner page select query**
- **Found during:** Task 2 (after making QrCode.user_id and phone_number part of the type)
- **Issue:** `src/app/q/[slug]/page.tsx` selected columns without `phone_number`, causing a TypeScript type error since `phone_number` is now required in the QrCode type
- **Fix:** Added `phone_number` to the Supabase `.select()` column list in the scanner page
- **Files modified:** `src/app/q/[slug]/page.tsx`
- **Verification:** `pnpm exec tsc --noEmit` passes with zero errors
- **Committed in:** `1ee936b` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — bug/type error)
**Impact on plan:** Necessary correction for correctness. No scope creep.

## Issues Encountered
None beyond the scanner select deviation documented above.

## User Setup Required

**External services require manual configuration before Phase 5 plans 02-05 can be tested end-to-end.**

Required environment variables to add (`.env.local`):

```
TWILIO_ACCOUNT_SID=<Twilio Console -> Account Info -> Account SID>
TWILIO_AUTH_TOKEN=<Twilio Console -> Account Info -> Auth Token>
TWILIO_VERIFY_SERVICE_SID=<Twilio Console -> Verify -> Services -> Create a Service -> Service SID>
```

Dashboard configuration steps:
1. Log in to [console.twilio.com](https://console.twilio.com)
2. Navigate to **Verify -> Services** and create a new service (name it "FluxQR")
3. Copy the Service SID to `TWILIO_VERIFY_SERVICE_SID`
4. Copy Account SID and Auth Token from the Account Info panel

The SQL migration (`supabase/migrations/0002_phase5_schema.sql`) must be applied to the Supabase database before plan 02 can run:
```bash
supabase db push
# or apply directly in Supabase Dashboard -> SQL Editor
```

## Next Phase Readiness
- All downstream plans (05-02 through 05-05) can import from `twilio.ts`, `admin.ts`, and `types/index.ts` without errors
- DB migration ready to apply — profiles, phone_usage, and qr_codes alterations all in one file
- `InputOTP` component available for OTP verification UI in plan 02
- No blockers for parallel Wave 2 work

---
*Phase: 05-public-qr-generation-with-phone-verification-usage-limits-and-admin-dashboard*
*Completed: 2026-03-11*

## Self-Check: PASSED

All artifacts verified:
- FOUND: src/lib/twilio.ts
- FOUND: src/lib/supabase/admin.ts
- FOUND: supabase/migrations/0002_phase5_schema.sql
- FOUND: src/components/ui/input-otp.tsx
- FOUND: commit 51aa100 (Task 1)
- FOUND: commit 1ee936b (Task 2)
