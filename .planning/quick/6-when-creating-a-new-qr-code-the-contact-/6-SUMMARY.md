---
phase: quick
plan: 6
subsystem: qr-management
tags: [phone-verification, contact-target, all-platforms]
dependency_graph:
  requires: [quick-4, quick-5]
  provides: [unified-phone-contact-target]
  affects: [qr-form, dashboard-new, dashboard-edit]
tech_stack:
  patterns: [server-side-phone-override, read-only-phone-chip]
key_files:
  modified:
    - src/components/qr-management/qr-form.tsx
    - src/app/dashboard/new/actions.ts
    - src/app/dashboard/[id]/edit/actions.ts
decisions:
  - Remove isPhonePlatform guard entirely -- verified phone always overrides contact_target for all platforms
  - Edit action ownership query no longer selects platform field (not needed after removing conditional)
metrics:
  duration: 1 min
  completed: 2026-03-12
---

# Quick Task 6: Fix contact target to verified phone for all platforms

Verified phone number now always used as contact_target for WhatsApp, SMS, AND Telegram -- removing the WhatsApp/SMS-only guard in both UI form and server actions.

## What Changed

### Task 1: QrForm read-only phone chip for all platforms
**Commit:** f8c2c5f

- Removed `isPhonePlatform` guard from `showReadOnlyPhone` condition
- `showReadOnlyPhone` is now `!!verifiedPhone || mode === 'edit'` (no platform check)
- Read-only phone chip displays for all three platforms when user has verified phone
- No editable contact_target input appears regardless of selected platform

**Files modified:** `src/components/qr-management/qr-form.tsx`

### Task 2: Server actions override contact_target for all platforms
**Commit:** e818628

- `createQrCode`: Removed `if (platform === 'whatsapp' || platform === 'sms')` condition; `finalContactTarget` is always `profile.phone_number`
- `updateQrCode`: Same removal of platform-specific condition; always uses `profile.phone_number`
- Updated ownership query in edit action to select `id` instead of `platform` (no longer needed)
- Updated comments to reflect universal phone override behavior

**Files modified:** `src/app/dashboard/new/actions.ts`, `src/app/dashboard/[id]/edit/actions.ts`

## Deviations from Plan

None -- plan executed exactly as written.

## Verification

- TypeScript (`npx tsc --noEmit`): passes clean after both tasks
- Form renders read-only phone chip for all platforms when verified phone is present
- Server actions enforce verified phone as contact_target for all platforms

## Self-Check: PASSED

- All 3 modified files exist on disk
- Both task commits (f8c2c5f, e818628) verified in git log
