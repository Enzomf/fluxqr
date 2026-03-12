---
phase: 08-add-unit-tests-to-all-components-and-services
plan: 03
subsystem: testing
tags: [vitest, react-testing-library, jsdom, unit-tests, dashboard-components, dialog, base-ui]

# Dependency graph
requires:
  - phase: 08-add-unit-tests-to-all-components-and-services
    provides: "Vitest 4 + RTL 16 test infrastructure with jsdom environment and global mocks (plan 01)"
provides:
  - "47 unit tests across 6 dashboard component test files: sidebar-link, sidebar, qr-list-row, qr-list, qr-preview-dialog, phone-verify-dialog"
  - "navigator.userAgent stub in setup.ts preventing @base-ui detectBrowser crash in jsdom"
  - "LIST-03 business rule validated: QrList renders empty state with 'No QR codes yet' heading"
affects:
  - "08-04 through 08-05 — subsequent test plans can reuse @base-ui jsdom fix pattern"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Mock @base-ui-dependent UI primitives (Sheet, AlertDialog) at test file level to isolate from jsdom/detectBrowser incompatibility"
    - "Override global vi.mock() for next/navigation in specific test files using vi.fn() to enable per-test mockReturnValue"
    - "Transitive @base-ui detectBrowser crash resolved globally via explicit navigator.userAgent in setup.ts"
    - "Mock complex child components (QrPreviewDialog, DeleteDialog, QrFormDialog) in parent tests to isolate render scope"

key-files:
  created:
    - src/components/dashboard/sidebar-link.test.tsx
    - src/components/dashboard/sidebar.test.tsx
    - src/components/dashboard/qr-list-row.test.tsx
    - src/components/dashboard/qr-list.test.tsx
    - src/components/dashboard/qr-preview-dialog.test.tsx
    - src/components/dashboard/phone-verify-dialog.test.tsx
  modified:
    - src/test/setup.ts

key-decisions:
  - "Mock Sheet component at test file level for Sidebar tests — @base-ui/react/dialog detectBrowser runs at import time before jsdom navigator is stubbed"
  - "Global navigator.userAgent stub in setup.ts — eliminates @base-ui detectBrowser crash for all remaining test plans without per-file workarounds"
  - "Mock QrPreviewDialog, DeleteDialog, QrFormDialog in parent component tests — isolates test scope from @base-ui primitives, speeds tests"
  - "Override next/navigation mock per test file using vi.fn() — global setup.ts mock uses factory (not vi.fn()) so vi.mocked().mockReturnValue fails without local override"
  - "formatScanCount uses lowercase 'k' (e.g., '1.5k') — tests must match exact output not 'K'"

patterns-established:
  - "Per-file next/navigation override: vi.mock('next/navigation', () => ({ usePathname: vi.fn().mockReturnValue('/') })) enables vi.mocked(usePathname).mockReturnValue per test"
  - "navigator.userAgent global stub pattern: spread existing navigator, add explicit userAgent for @base-ui compatibility"

requirements-completed: [TEST-DASHBOARD]

# Metrics
duration: 4min
completed: 2026-03-12
---

# Phase 8 Plan 03: Dashboard Component Unit Tests Summary

**47 unit tests across 6 co-located dashboard test files covering sidebar, QR list, dialogs — LIST-03 empty state rule validated, @base-ui jsdom detectBrowser issue resolved globally**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-12T23:42:30Z
- **Completed:** 2026-03-12T23:46:10Z
- **Tasks:** 2
- **Files modified:** 7 (6 created, 1 modified)

## Accomplishments

- Wrote 47 passing tests across 6 dashboard component files validating active state logic, nav links, QR list rendering, dialog open/closed behavior, and owner info display
- Discovered and fixed `@base-ui/utils` `detectBrowser` crash in jsdom by adding explicit `navigator.userAgent` stub to `src/test/setup.ts` — this unblocks all subsequent test plans that use base-ui dialog primitives
- Validated LIST-03 business rule: `QrList` renders `EmptyState` with "No QR codes yet" heading when the `qrCodes` array is empty
- Established pattern for overriding per-test `usePathname` return values by re-declaring the `next/navigation` mock as `vi.fn()` at test file level

## Task Commits

Each task was committed atomically:

1. **Task 1: Test sidebar components (sidebar-link, sidebar)** - `a5eb049` (test)
2. **Task 2: Test QR list components and dialogs** - `a583baf` (test)

**Plan metadata:** _(created in final commit)_

## Files Created/Modified

- `src/components/dashboard/sidebar-link.test.tsx` — 7 tests: href, label, icon, active/inactive state via usePathname mock override
- `src/components/dashboard/sidebar.test.tsx` — 9 tests: brand, nav links, user email, admin link conditional, avatar fallback letter
- `src/components/dashboard/qr-list-row.test.tsx` — 10 tests: thumbnail, label, slug, platform badge, scan count (compact), edit/download/delete buttons
- `src/components/dashboard/qr-list.test.tsx` — 6 tests: empty state (LIST-03), populated rows, "New QR Code" button
- `src/components/dashboard/qr-preview-dialog.test.tsx` — 10 tests: open/closed state, label, badge, scan count, owner info, copy link button
- `src/components/dashboard/phone-verify-dialog.test.tsx` — 5 tests: open/closed state, phone form, heading, country code selector
- `src/test/setup.ts` — Added explicit `navigator.userAgent` to prevent `@base-ui/utils` `detectBrowser` crash in jsdom

## Decisions Made

- Global `navigator.userAgent` stub chosen over per-file `@base-ui` mocking — one-time fix in setup.ts covers all future plans; component mocks at test-file level are still used as defense-in-depth for complex child components
- Re-declared `next/navigation` mock as `vi.fn()` in `sidebar-link.test.tsx` — the global setup.ts mock uses a factory returning a plain function, which cannot be `.mockReturnValue()`-ed; file-level override provides the `vi.fn()` needed for per-test pathname control
- `formatScanCount` test assertion uses `'1.5k'` (lowercase) — matches exact function output; uppercase 'K' would fail

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added navigator.userAgent stub to src/test/setup.ts**
- **Found during:** Task 2 (qr-list.test.tsx first run)
- **Issue:** `@base-ui/utils` `detectBrowser.js:14` reads `navigator.userAgent.includes()` at module import time; jsdom's `navigator` was being overridden by the existing clipboard stub without carrying `userAgent` forward, causing `TypeError: Cannot read properties of undefined (reading 'includes')`
- **Fix:** Added `userAgent: globalThis.navigator?.userAgent ?? 'Mozilla/5.0 (jsdom)'` to the navigator Object.defineProperty spread in setup.ts
- **Files modified:** `src/test/setup.ts`
- **Verification:** All 248 tests pass including all 6 new dashboard files
- **Committed in:** `a583baf` (Task 2 commit)

**2. [Rule 1 - Bug] Fixed scan count assertion: lowercase 'k' not uppercase 'K'**
- **Found during:** Task 2 (qr-list-row.test.tsx first run)
- **Issue:** Test expected `'1.5K'` but `formatScanCount(1500)` returns `'1.5k'` (lowercase k) per `lib/utils.ts`
- **Fix:** Updated test assertion to `'1.5k'`
- **Files modified:** `src/components/dashboard/qr-list-row.test.tsx`
- **Verification:** Test passes
- **Committed in:** `a583baf` (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 behavior mismatch)
**Impact on plan:** Both auto-fixes necessary for test correctness. navigator.userAgent fix benefits all remaining test plans. No scope creep.

## Issues Encountered

- The global `usePathname: () => '/'` in setup.ts returns a plain function (not `vi.fn()`), making `vi.mocked(usePathname).mockReturnValue` fail with "not a function". Solution: re-declare the mock at test-file level with `vi.fn()`.
- Sidebar's Sheet component and QrListRow's DeleteDialog both transitively import `@base-ui/react/dialog` which calls `detectBrowser` at module evaluation time — fixed once globally in setup.ts, with component-level mocks retained for test isolation.

## Next Phase Readiness

- All 6 dashboard component tests pass; total test suite at 248 tests across 32 files
- `navigator.userAgent` fix in setup.ts makes all future plans with @base-ui dialog components testable without per-file workarounds
- Plans 08-04 and 08-05 can proceed with the established mocking patterns

---
*Phase: 08-add-unit-tests-to-all-components-and-services*
*Completed: 2026-03-12*
