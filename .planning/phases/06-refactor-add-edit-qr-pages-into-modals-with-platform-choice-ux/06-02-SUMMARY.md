---
phase: 06-refactor-add-edit-qr-pages-into-modals-with-platform-choice-ux
plan: 02
subsystem: ui
tags: [dialog, react, nextjs, shadcn, qr-management, base-ui]

# Dependency graph
requires:
  - phase: 06-01
    provides: qr-actions.ts Server Actions, QrTypeSelect component, QrForm adapted for dialog context

provides:
  - QrFormDialog component with two-step create flow and single-step edit flow
  - QrList as dialog orchestrator (owns dialogOpen/editingQr/pulseId state)
  - QrListRow edit button as callback (onEdit prop) instead of navigation
  - DashboardPage passing verifiedPhone to QrList, no action prop on PageHeader
  - EmptyState with onClick callback replacing Link to /dashboard/new
  - Old /dashboard/new and /dashboard/[id]/edit routes deleted

affects:
  - future plans using dashboard create/edit flows

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Dialog orchestrator pattern: parent component owns dialogOpen + editingQr + pulseId state
    - form= attribute external submit button in dialog footer via useFormStatus
    - key prop on QrForm resets useActionState between dialog opens
    - Pulse auto-clear via setTimeout in useEffect (700ms > 600ms animation)

key-files:
  created:
    - src/components/qr-management/qr-form-dialog.tsx
  modified:
    - src/components/dashboard/qr-list.tsx
    - src/components/dashboard/qr-list-row.tsx
    - src/app/dashboard/page.tsx
    - src/components/shared/empty-state.tsx
    - src/components/qr-management/qr-form.tsx

key-decisions:
  - "QrList owns all dialog state (dialogOpen, editingQr, pulseId) — single source of truth for dashboard modal orchestration"
  - "key prop on QrForm (keyed to qr.id or 'create') ensures useActionState resets cleanly between opens without manual reset logic"
  - "SubmitButton inline in QrFormDialog uses useFormStatus — must be inside the form tree (via form= attribute) to read pending state correctly"

patterns-established:
  - "Dialog orchestrator pattern: QrList owns open/editTarget/pulse state, passes down to dialog component and row callbacks"

requirements-completed: [MODAL-01, MODAL-02, MODAL-03, MODAL-05, MODAL-06, MODAL-07]

# Metrics
duration: 3min
completed: 2026-03-12
---

# Phase 6 Plan 02: QrFormDialog Integration and Route Cleanup Summary

**Dialog-based QR create/edit flow replacing full-page routes — QrFormDialog with two-step create (grid → form) and single-step edit, wired into QrList orchestrator, old /new and /[id]/edit routes deleted**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-12T14:40:51Z
- **Completed:** 2026-03-12T14:43:37Z
- **Tasks:** 3 (+ 1 checkpoint awaiting human verify)
- **Files modified:** 6

## Accomplishments
- Created `QrFormDialog` with sticky header (back arrow for create, title, close X), scrollable body, sticky footer with `SubmitButton` using `useFormStatus` for pending state
- Rewrote `QrList` as dialog orchestrator: owns `dialogOpen`, `editingQr`, `pulseId` state; renders inline "New QR Code" button; handles pulse auto-clear after 700ms
- Updated `QrListRow` to use `onEdit(qr)` callback instead of `<Link href=/dashboard/[id]/edit>`
- Updated `DashboardPage` to fetch `verifiedPhone` from profiles in parallel with QR codes, removed `action` prop from `PageHeader`, always renders `QrList` (empty state handled internally)
- Updated `EmptyState` to accept `onAction` callback prop replacing `Link` to `/dashboard/new`
- Deleted `src/app/dashboard/new/` and `src/app/dashboard/[id]/` directories entirely

## Task Commits

Each task was committed atomically:

1. **Task 1: Create QrFormDialog component** - `b7ed750` (feat)
2. **Task 2: Wire QrList, QrListRow, DashboardPage, and EmptyState for dialog flow** - `7049382` (feat)
3. **Task 3: Delete old page routes and verify build** - `d29cc91` (chore)

**Plan metadata:** (docs commit to follow after human verification)

## Files Created/Modified
- `src/components/qr-management/qr-form-dialog.tsx` - Dialog shell with step state (grid/form), create/edit modes, sticky header/body/footer layout, inline SubmitButton with useFormStatus
- `src/components/dashboard/qr-list.tsx` - Dialog orchestrator: owns dialogOpen/editingQr/pulseId state, New QR button, openCreate/openEdit helpers, renders QrFormDialog
- `src/components/dashboard/qr-list-row.tsx` - Edit button as callback (onEdit prop) replacing Link, removed Link import
- `src/app/dashboard/page.tsx` - Parallel fetch for verifiedPhone from profiles, passes to QrList, removed PageHeader action and EmptyState import
- `src/components/shared/empty-state.tsx` - onAction callback prop replacing Link to /dashboard/new
- `src/components/qr-management/qr-form.tsx` - Removed unused `pending` from useActionState destructuring (lint fix)

## Decisions Made
- `QrList` owns all dialog state — single orchestrator pattern avoids prop drilling and keeps dialog logic co-located with the list that triggers it
- `key={open ? (qr?.id ?? 'create') : 'closed'}` on `QrForm` ensures `useActionState` resets cleanly between opens — no manual form reset needed
- `SubmitButton` defined inline in `qr-form-dialog.tsx` — uses `useFormStatus()` to read pending from the form it submits via `form="qr-form"` attribute

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Lint] Removed unused `pending` variable in qr-form.tsx**
- **Found during:** Task 3 (lint verification)
- **Issue:** Plan 01 removed the internal submit button from QrForm but left `pending` destructured from `useActionState` — causing a lint warning
- **Fix:** Changed `const [state, formAction, pending] = useActionState(...)` to `const [state, formAction] = useActionState(...)`
- **Files modified:** `src/components/qr-management/qr-form.tsx`
- **Verification:** `pnpm lint` passes clean (0 errors, 0 warnings)
- **Committed in:** `d29cc91` (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (Rule 2 — lint/correctness)
**Impact on plan:** Trivial one-line fix, no behavior change.

## Issues Encountered
- `.next/types/validator.ts` cached references to deleted pages caused TypeScript errors on first check — resolved by deleting `.next/` cache directory before re-running `pnpm tsc --noEmit`.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Tasks 1-3 complete; awaiting Task 4 (human verification of dialog flow)
- After verification: all modal requirements MODAL-01 through MODAL-07 will be satisfied
- Old routes /dashboard/new and /dashboard/[id]/edit return 404

---
*Phase: 06-refactor-add-edit-qr-pages-into-modals-with-platform-choice-ux*
*Completed: 2026-03-12*
