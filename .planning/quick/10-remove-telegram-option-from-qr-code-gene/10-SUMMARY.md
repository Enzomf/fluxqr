---
phase: quick-10
plan: 10
subsystem: ui
tags: [platform, telegram, qr-codes, types, scanner]

requires:
  - phase: quick-6
    provides: contact target locked to verified phone for all platforms including telegram

provides:
  - Platform type restricted to 'whatsapp' | 'sms' — telegram variant removed
  - Platform selector dropdown with only WhatsApp and SMS options
  - TelegramFallback component deleted; scanner landing handles only supported platforms
  - Exhaustive switch default throws for unknown platforms in redirect helpers

affects: [scanner, qr-management, dashboard]

tech-stack:
  added: []
  patterns:
    - Exhaustive switch pattern with satisfies never in default case for compile-time platform completeness

key-files:
  created: []
  modified:
    - src/types/index.ts
    - src/lib/redirect.ts
    - src/lib/__tests__/redirect.test.ts
    - src/app/dashboard/new/actions.ts
    - src/components/qr-management/platform-selector.tsx
    - src/components/qr-management/qr-form.tsx
    - src/components/shared/platform-badge.tsx
    - src/app/q/[slug]/scanner-landing.tsx
    - CLAUDE.md

key-decisions:
  - "Legacy telegram guard in scanner-landing returns null — prevents runtime crash for pre-existing telegram QRs without throwing in buildPlatformUrl"
  - "Exhaustive default: throw new Error(platform satisfies never) in redirect helpers ensures compile-time safety if Platform type ever expands unexpectedly"
  - "Removed platform useState from QrForm (auto-fix) — state was only used for telegram placeholder which no longer exists"

patterns-established:
  - "Platform union: 'whatsapp' | 'sms' — no telegram, no extensibility gap"

requirements-completed: [QUICK-10]

duration: 8min
completed: 2026-03-12
---

# Quick Task 10: Remove Telegram Option from QR Code Generation Summary

**Telegram removed from Platform type, validation, UI, and scanner — only WhatsApp and SMS remain; legacy QRs handled safely with null guard**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-03-12
- **Completed:** 2026-03-12
- **Tasks:** 2 (+ 1 auto-fix deviation)
- **Files modified:** 9 (+ 1 deleted)

## Accomplishments

- Platform type narrowed from `'whatsapp' | 'sms' | 'telegram'` to `'whatsapp' | 'sms'` — TypeScript now enforces no new telegram QRs at compile time
- All redirect helper switch statements updated with exhaustive `default: throw` using `satisfies never` pattern
- TelegramFallback component deleted; scanner-landing.tsx simplified with a null guard for legacy platforms
- Zod validation in `createQrCode` action rejects `'telegram'` as a valid platform value

## Task Commits

1. **Task 1: Remove Telegram from types, lib helpers, validation, and tests** - `d73c871` (feat)
2. **Task 2: Remove Telegram from UI components, scanner, and delete TelegramFallback** - `552c660` (feat)
3. **Deviation: Remove unused platform state from QrForm** - `75b709d` (fix)

## Files Created/Modified

- `src/types/index.ts` - Platform type changed to `'whatsapp' | 'sms'`
- `src/lib/redirect.ts` - Telegram cases removed; exhaustive default throw added to all three helpers
- `src/lib/__tests__/redirect.test.ts` - Telegram assertions removed; all remaining tests pass
- `src/app/dashboard/new/actions.ts` - Zod enum updated to `['whatsapp', 'sms']`
- `src/components/qr-management/platform-selector.tsx` - Telegram SelectItem removed
- `src/components/qr-management/qr-form.tsx` - Telegram placeholder removed; unused platform state removed
- `src/components/shared/platform-badge.tsx` - Telegram entries removed from platformStyles and platformLabels
- `src/app/q/[slug]/scanner-landing.tsx` - TelegramFallback import/block removed; legacy guard added
- `src/components/scanner/telegram-fallback.tsx` - **Deleted**
- `CLAUDE.md` - Scanner directory comment updated to `(reserved)`

## Decisions Made

- Legacy telegram QRs in the database will render as `null` in scanner-landing (no crash, no content shown). This is safe because: (1) no new telegram QRs can be created, (2) the DB CHECK constraint still prevents invalid platform values, (3) buildPlatformUrl would throw rather than produce a broken URL.
- Exhaustive `default: throw new Error(platform satisfies never)` pattern added to all three switch functions — provides compile-time guarantee that adding a new Platform variant forces updating all helpers.
- The `platform` useState in QrForm was auto-removed (Rule 1) because it was only used to drive the `@username` placeholder, which no longer exists.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed unused `platform` state variable from QrForm**
- **Found during:** Task 2 lint check (`@typescript-eslint/no-unused-vars` warning)
- **Issue:** `platform` state and `setPlatform` were only used to set the `@username` Telegram placeholder. After removing that placeholder, both became dead code producing a lint warning.
- **Fix:** Removed `useState<Platform | undefined>`, `setPlatform`, `onValueChange` prop on PlatformSelector, and the `Platform` import from qr-form.tsx
- **Files modified:** `src/components/qr-management/qr-form.tsx`
- **Verification:** `pnpm lint` returned zero errors/warnings; `tsc --noEmit` passed
- **Committed in:** `75b709d`

---

**Total deviations:** 1 auto-fixed (Rule 1 — unused code cleanup)
**Impact on plan:** Auto-fix was necessary to achieve zero lint errors as required by success criteria. No scope creep.

## Issues Encountered

None — plan executed cleanly with one small auto-fix deviation.

## Next Phase Readiness

- Platform type is now a two-variant union (`whatsapp | sms`) — all type-checked consumers are clean
- Scanner page still handles legacy telegram rows safely (null return)
- Database CHECK constraint (`'whatsapp','sms','telegram'`) still allows telegram in the DB; that is a separate migration concern outside this task's scope

---
*Phase: quick-10*
*Completed: 2026-03-12*
