---
phase: 06-refactor-add-edit-qr-pages-into-modals-with-platform-choice-ux
plan: 01
subsystem: ui
tags: [server-actions, qr-management, dialog, react, nextjs, zod]

# Dependency graph
requires:
  - phase: 03-qr-management
    provides: createQrCode/updateQrCode/deleteQrCode Server Actions and QrForm component
  - phase: 05-public-qr-generation-with-phone-verification-usage-limits-and-admin-dashboard
    provides: phone verification flow, verifiedPhone prop pattern
provides:
  - qr-actions.ts with consolidated Server Actions returning { success: true } instead of redirecting
  - QrTypeSelect component with platform-agnostic descriptions for dashboard context
  - QrForm adapted for dialog context with onSuccess callback, qrType visibility, form id, no internal submit button
affects:
  - 06-02 (dialog shell and dashboard integration — depends on these contracts)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Server Actions return { success, id } for dialog-compatible flow (no redirect on success)
    - useEffect watching state.success to trigger callbacks and toasts after form submission
    - form id="qr-form" pattern for external submit button in dialog footer

key-files:
  created:
    - src/app/dashboard/qr-actions.ts
    - src/components/qr-management/qr-type-select.tsx
  modified:
    - src/components/qr-management/qr-form.tsx

key-decisions:
  - "FormState extended with success and id fields so callers can detect completion without redirect"
  - "QrTypeSelect is a separate component from public QrTypeGrid — dashboard has platform-agnostic descriptions, public component keeps WhatsApp-specific copy"
  - "QrForm submit button removed entirely — dialog footer will provide it via form= attribute reference"
  - "qrType defaults to 'custom' for backward compatibility with existing page-based usage"

patterns-established:
  - "Server Action dialog pattern: return { success: true, id } + useEffect in form component fires onSuccess callback"
  - "form id on form element enables external submit buttons in dialog footers"

requirements-completed: [MODAL-04, MODAL-08]

# Metrics
duration: 2min
completed: 2026-03-12
---

# Phase 6 Plan 01: Building Blocks for Dialog-Based QR Flow Summary

**Consolidated Server Actions with { success, id } return pattern + QrTypeSelect component + QrForm adapted for dialog context with onSuccess callback and external submit button support**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-12T14:36:27Z
- **Completed:** 2026-03-12T14:38:27Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Created `qr-actions.ts` consolidating all three Server Actions (createQrCode, updateQrCode, deleteQrCode) with dialog-compatible return signatures
- Created `QrTypeSelect` component with platform-agnostic descriptions for the dashboard QR type chooser step
- Adapted `QrForm` to work inside a dialog: `onSuccess` callback, `qrType` prop controls message field visibility, `id="qr-form"` for external footer submit, removed internal submit button

## Task Commits

Each task was committed atomically:

1. **Task 1: Create qr-actions.ts with refactored Server Actions** - `0d6319b` (feat)
2. **Task 2: Create QrTypeSelect and adapt QrForm for dialog context** - `32bc685` (feat)

**Plan metadata:** (docs commit to follow)

## Files Created/Modified
- `src/app/dashboard/qr-actions.ts` - Consolidated FormState type + createQrCode/updateQrCode/deleteQrCode Server Actions; create and update now return { success: true } instead of redirecting
- `src/components/qr-management/qr-type-select.tsx` - Two-card QR type chooser with platform-agnostic descriptions ("Your default QR code" vs "QR code with a custom pre-filled message")
- `src/components/qr-management/qr-form.tsx` - Imports FormState from qr-actions, adds qrType/onSuccess props, useEffect fires onSuccess on state.success, id="qr-form", max-w-lg removed, submit button removed

## Decisions Made
- FormState extended with `success?: boolean` and `id?: string` — callers detect form completion via state.success without relying on redirect
- QrTypeSelect kept separate from public QrTypeGrid — public component has WhatsApp-specific copy that is correct for its context; dashboard component is platform-agnostic since platform is chosen in the next step
- QrForm submit button removed entirely so the dialog footer can render it outside the form element via `form="qr-form"` HTML attribute
- `qrType` defaults to `'custom'` in QrForm to maintain backward compatibility with existing page-based usage (edit page still works without passing qrType)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All three contracts are ready for Plan 02: qr-actions.ts exports, QrTypeSelect, and QrForm's dialog interface
- Plan 02 can wire these into the dialog shell and dashboard page without needing to revisit these files
- Old `new/actions.ts` and `[id]/edit/actions.ts` still exist and are still used by the old pages — Plan 02 will delete those pages and old action files

---
*Phase: 06-refactor-add-edit-qr-pages-into-modals-with-platform-choice-ux*
*Completed: 2026-03-12*
