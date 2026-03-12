# Quick Task 6: Fix contact target to verified phone for all platforms

**Created:** 2026-03-12
**Status:** Ready for execution

## Goal

When creating a new QR code, the contact_target should always be the user's verified phone number regardless of platform. No editable contact_target input should appear when the user has a verified phone.

## Task 1: Update QrForm to always show read-only phone chip

**Files:** `src/components/qr-management/qr-form.tsx`
**Action:** Modify the contact target rendering logic so that when `verifiedPhone` is set, the read-only phone chip is shown for ALL platforms (not just WhatsApp/SMS). Remove the conditional that shows an editable input for Telegram.

Changes:
- `showReadOnlyPhone` should be `!!verifiedPhone || mode === 'edit'` (remove `isPhonePlatform` condition)
- The editable input fallback should only show when there's no verified phone AND no platform-specific override
- Keep the hidden input `name="contact_target"` with the verified phone value

**Verify:** Form shows read-only phone chip for WhatsApp, SMS, AND Telegram when user has verified phone
**Done:** No editable contact_target input appears for any platform when phone is verified

## Task 2: Update server actions to use verified phone for ALL platforms

**Files:** `src/app/dashboard/new/actions.ts`, `src/app/dashboard/[id]/edit/actions.ts`
**Action:** Override `contact_target` with profile phone for ALL platforms (not just WhatsApp/SMS). The server already requires phone verification for all platforms — now also override the value for all.

Changes in both files:
- Remove the `if (platform === 'whatsapp' || platform === 'sms')` condition around the `finalContactTarget = profile.phone_number` line
- Always set `finalContactTarget = profile.phone_number`

**Verify:** `npx tsc --noEmit` passes
**Done:** Server actions use verified phone as contact_target for all platforms
