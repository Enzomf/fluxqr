---
phase: 05-public-qr-generation-with-phone-verification-usage-limits-and-admin-dashboard
plan: "03"
subsystem: ui
tags: [next.js, server-actions, cookies, supabase-admin, qr-code, freemium, dialog, state-machine]

# Dependency graph
requires:
  - phase: 05-01
    provides: createAdminClient (service-role), generateQrDataUrl, phone_usage table, QrCode type with nullable user_id + phone_number
  - phase: 05-02
    provides: PhoneVerifyForm (onVerificationSent prop), OtpVerifyForm (phone+onVerified props), verified_phone httpOnly cookie

provides:
  - createPublicQr Server Action — reads verified_phone cookie, checks 5-use limit, inserts QR with admin client, increments phone_usage
  - QrTypeGrid client component — two-card selection grid (My QR Code vs Custom QR)
  - PublicQrForm client component — message textarea (custom) or direct generate (default)
  - PublicQrResultDialog client component — QR preview with download + copy link
  - FreemiumGate client component — hard block UI with Google sign-in CTA after 5 uses
  - Home page (/) — Server Component reading cookie+usage server-side, HomeClient state machine managing all flow transitions

affects: [05-04, 05-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Server Component reads cookie + DB server-side to determine initial client step — avoids flash of wrong step on page load"
    - "HomeClient useState step machine (phone | otp | grid | form | result | gated) — single source of truth for all public flow transitions"
    - "createPublicQr uses admin client (service-role) for all DB ops — bypasses RLS since user_id is null on public QR codes"
    - "PublicQrResultDialog uses @base-ui/react/dialog with zoom-in/zoom-out animations (no thumbnail origin — simpler than QrPreviewDialog)"

key-files:
  created:
    - src/app/actions/create-public-qr.ts
    - src/app/home-client.tsx
    - src/components/public/qr-type-grid.tsx
    - src/components/public/public-qr-form.tsx
    - src/components/public/public-qr-result-dialog.tsx
    - src/components/public/freemium-gate.tsx
  modified:
    - src/app/page.tsx

key-decisions:
  - "HomeClient extracted to src/app/home-client.tsx (not inline in page.tsx) — cleaner separation, Server Component imports client component cleanly"
  - "createPublicQr uses admin client for all DB ops — phone-created QRs have user_id=null, which bypasses all user-scoped RLS policies"
  - "Server-side initial step computation in page.tsx — prevents flash of phone-verify form for returning verified visitors"

patterns-established:
  - "Pattern: Server Component + HomeClient pair — Server reads cookie/DB to determine state, passes as props to client state machine"
  - "Pattern: onGateHit callback from PublicQrForm to parent — Server Action returns gate:true, component notifies parent to switch step"

requirements-completed: [PUB-01, PUB-03, PUB-06]

# Metrics
duration: 2min
completed: 2026-03-11
---

# Phase 5 Plan 03: Public QR Generation Flow Summary

**Server-rendered home page with phone-verify gate, two-card type selection, freemium usage limit (5 uses), QR generation via admin client, and result dialog with download and copy link — transforming / from a login redirect into the core public QR tool**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-11T20:39:17Z
- **Completed:** 2026-03-11T20:41:19Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- `createPublicQr` Server Action enforces 5-use freemium limit, creates QR codes with `user_id=null` via admin client, and increments `phone_usage` atomically
- Full public flow state machine in `HomeClient` (phone -> otp -> grid -> form -> result | gated) with server-side initial step computation to avoid flash
- `QrTypeGrid` two-card picker, `PublicQrForm` with optional message textarea, `PublicQrResultDialog` with download+copy, and `FreemiumGate` hard block with Google sign-in CTA
- Home page (/) no longer redirects to /login — returning verified visitors land directly at the grid step

## Task Commits

Each task was committed atomically:

1. **Task 1: Create public QR server action and utility components** - `a32e7ed` (feat)
2. **Task 2: Build public home page orchestrating full QR generation flow** - `8de7dec` (feat)

**Plan metadata:** (docs commit — see final_commit step)

## Files Created/Modified

- `src/app/actions/create-public-qr.ts` — Server Action: cookie read, usage check, slug generation, admin insert, phone_usage upsert, QR data URL generation
- `src/app/page.tsx` — Server Component: reads verified_phone cookie + phone_usage, passes verifiedPhone/usageCount/isGated to HomeClient
- `src/app/home-client.tsx` — Client state machine: 6-step flow with PhoneVerifyForm, OtpVerifyForm, QrTypeGrid, PublicQrForm, PublicQrResultDialog, FreemiumGate
- `src/components/public/qr-type-grid.tsx` — Two-card selection grid (My QR Code vs Custom QR)
- `src/components/public/public-qr-form.tsx` — Generate button (default) or textarea+button (custom) with onResult/onGateHit/onBack
- `src/components/public/public-qr-result-dialog.tsx` — @base-ui dialog with QR image, Download button, Copy link button
- `src/components/public/freemium-gate.tsx` — Hard block card with ShieldAlert icon and GoogleSignInButton

## Decisions Made

- `HomeClient` extracted to `src/app/home-client.tsx` (not an inline function in page.tsx) — keeps the Server Component clean and imports well in Next.js App Router
- `createPublicQr` uses `createAdminClient()` for all Supabase ops — phone-created QR codes have `user_id = null`, so they cannot be inserted through user-scoped RLS policies
- Server Component computes `isGated` and `verifiedPhone` server-side and passes as props — prevents a flash of the phone-verify form for returning verified visitors on initial render

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — Twilio credentials configured in Plan 01. No additional external service configuration required.

## Next Phase Readiness

- All public QR generation artifacts ready for Plan 04 (account linking — connects phone-created QR codes to authenticated user accounts)
- `verified_phone` cookie is read in `createPublicQr` and page.tsx; Plan 04 can also read it server-side to identify which phone-created QRs to link
- `phone_usage` table correctly tracks usage per phone number; Plan 04 can reset/migrate usage count on account linking

## Self-Check: PASSED

- FOUND: src/app/actions/create-public-qr.ts
- FOUND: src/app/page.tsx (rewritten)
- FOUND: src/app/home-client.tsx
- FOUND: src/components/public/qr-type-grid.tsx
- FOUND: src/components/public/public-qr-form.tsx
- FOUND: src/components/public/public-qr-result-dialog.tsx
- FOUND: src/components/public/freemium-gate.tsx
- FOUND commit a32e7ed (Task 1)
- FOUND commit 8de7dec (Task 2)

---
*Phase: 05-public-qr-generation-with-phone-verification-usage-limits-and-admin-dashboard*
*Completed: 2026-03-11*
