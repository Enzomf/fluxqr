# Quick Task 23: Fix mobile layout overflow on home page phone verification form

## What Changed
- `src/components/public/phone-verify-form.tsx` — Added `min-w-0` on flex row, `shrink-0` on country select, responsive padding `p-4 sm:p-6`
- `src/components/public/otp-verify-form.tsx` — Responsive padding `p-4 sm:p-6`
- `src/app/home-client.tsx` — Responsive logo `w-24 h-24 sm:w-40 sm:h-40`

## Root Cause
Phone input flex row overflowed on narrow screens because the input had no `min-w-0` (flexbox default min-width is auto/content). The country select also needed `shrink-0` to maintain readable width.

## Commit
`42fd36e`
