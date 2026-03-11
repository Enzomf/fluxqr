---
phase: quick-2
plan: 01
subsystem: public-qr-form
tags: [ui, phone-verification, public-qr]
dependency_graph:
  requires: []
  provides: [phone-chip-display, contextual-generate-button]
  affects: [src/components/public/public-qr-form.tsx, src/app/home-client.tsx]
tech_stack:
  added: []
  patterns: [read-only-display-chip, prop-drilling-phone-state]
key_files:
  created: []
  modified:
    - src/components/public/public-qr-form.tsx
    - src/app/home-client.tsx
decisions:
  - Phone chip is purely display — no form input, no onChange; backend reads from cookie not form data
  - Phone chip placed above the generate button (below message textarea for custom type) so it's always visible before confirming
metrics:
  duration: 4 min
  completed_date: "2026-03-11"
---

# Quick Task 2: Display verified phone number in public QR form — Summary

**One-liner:** Read-only phone chip with Phone icon + monospace number displayed above generate button, which now reads "Generate QR for {phone}" for user confirmation.

## What Was Built

Added a verified phone number display to the `PublicQrForm` component so users can see exactly which number will be used as the contact target before generating their QR code. The chip is styled consistently with the existing form surface tokens and is purely decorative — the backend continues to read `contact_target` from the `verified_phone` cookie, not from the form.

## Tasks Completed

| # | Name | Commit | Files |
|---|------|--------|-------|
| 1 | Add phone prop to PublicQrForm and display verified number | cdb837c | public-qr-form.tsx, home-client.tsx |

## Changes Made

### `src/components/public/public-qr-form.tsx`
- Added `phone: string` to `PublicQrFormProps` interface
- Imported `Phone` from `lucide-react`
- Added destructured `phone` parameter to component signature
- Rendered a read-only chip: label "Your number" + `<div>` with `Phone` icon and monospace phone text
- Changed generate button text from `'Generate QR Code'` to template literal `` `Generate QR for ${phone}` ``

### `src/app/home-client.tsx`
- Added `phone={phone}` prop to the `<PublicQrForm>` usage in the `step === 'form'` block

## Deviations from Plan

None — plan executed exactly as written.

## Verification

- `npx tsc --noEmit` passed with zero errors
- Phone chip appears for both `default` and `custom` QR types (chip is outside the `qrType === 'custom'` conditional)
- Generate button text dynamically includes the verified number

## Self-Check: PASSED

- [x] `src/components/public/public-qr-form.tsx` — modified and verified
- [x] `src/app/home-client.tsx` — modified and verified
- [x] Commit `cdb837c` exists
