---
phase: 08-add-unit-tests-to-all-components-and-services
plan: 02
subsystem: testing
tags: [vitest, react-testing-library, unit-tests, components, shared, auth, scanner]

# Dependency graph
requires:
  - phase: 08-01
    provides: "Vitest 4 + RTL 16 infrastructure, global mocks in setup.ts"
provides:
  - "34 unit tests across 6 co-located test files for shared, auth, and scanner components"
  - "platform-badge, empty-state, page-header, qr-pulse-wrapper, google-sign-in-button, scanner-error all tested"
affects:
  - "08-03 through 08-05 — next plans can rely on fixed next/link + next/image mocks in setup.ts"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "vi.mock('@/app/login/actions') for Server Action mocking in Client Component tests"
    - "container.querySelector('svg') for asserting SVG icon presence"
    - "container.querySelector('form') for form structure assertions"
    - "screen.getByRole('img', { name }) for logo alt text assertions"
    - "userEvent.setup() + user.click() for interaction tests"

key-files:
  created:
    - src/components/shared/platform-badge.test.tsx
    - src/components/shared/empty-state.test.tsx
    - src/components/shared/page-header.test.tsx
    - src/components/shared/qr-pulse-wrapper.test.tsx
    - src/components/auth/google-sign-in-button.test.tsx
    - src/components/scanner/scanner-error.test.tsx
  modified:
    - src/test/setup.ts

key-decisions:
  - "Fixed next/link and next/image mocks in setup.ts to return React elements via React.createElement — Object.assign on DOM nodes with read-only children getter crashed React 19"
  - "ScannerError test needs no special mocking — no 'use client', no next/image, no router context"
  - "GoogleSignInButton mock targets '@/app/login/actions' — mocks the Server Action at its source module"

requirements-completed: [TEST-SHARED, TEST-AUTH, TEST-SCANNER]

# Metrics
duration: 1min
completed: 2026-03-12
---

# Phase 8 Plan 02: Shared, Auth, and Scanner Component Unit Tests Summary

**34 unit tests across 6 co-located test files covering all shared presentational components, GoogleSignInButton (with mocked Server Action), and ScannerError — all passing**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-12T23:42:21Z
- **Completed:** 2026-03-12T23:44:05Z
- **Tasks:** 2
- **Files modified:** 7 (6 created, 1 modified)

## Accomplishments

- Wrote 21 passing tests across 4 shared component test files: PlatformBadge (4 tests), EmptyState (5 tests, incl. LIST-03 business rule), PageHeader (7 tests for title/description/action permutations), QrPulseWrapper (5 tests for conditional animation class — the class IS the business rule)
- Wrote 4 passing tests for GoogleSignInButton: form structure, button text, type=submit, Google SVG aria-hidden — Server Action mocked via `vi.mock('@/app/login/actions')`
- Wrote 9 passing tests for ScannerError: title, description, conditional statusCode, FluxQR brand text, logo img alt, "Powered by FluxQR" footer — no mocks needed (pure Server Component with plain `<img>`)
- Fixed `next/link` and `next/image` mocks in `src/test/setup.ts` to use `React.createElement` instead of `document.createElement` — previous DOM-node approach caused React 19 crash on read-only `children` getter

## Task Commits

Each task was committed atomically:

1. **Task 1: Test shared components (platform-badge, empty-state, page-header, qr-pulse-wrapper)** - `65860c6` (feat)
2. **Task 2: Test auth and scanner components (google-sign-in-button, scanner-error)** - `9125711` (feat)

**Plan metadata:** _(created in final commit)_

## Files Created/Modified

- `src/components/shared/platform-badge.test.tsx` — 4 tests: WhatsApp label, SMS label, element content, rerender
- `src/components/shared/empty-state.test.tsx` — 5 tests: heading (LIST-03), CTA button, onAction callback, no-callback safety
- `src/components/shared/page-header.test.tsx` — 7 tests: title heading, description optional, action link href/label optional
- `src/components/shared/qr-pulse-wrapper.test.tsx` — 5 tests: animate-qr-pulse + rounded-md when trigger=true, absent when trigger=false, children rendered
- `src/components/auth/google-sign-in-button.test.tsx` — 4 tests: button text, form element, type=submit, SVG aria-hidden
- `src/components/scanner/scanner-error.test.tsx` — 9 tests: title, description, statusCode conditional, brand text, logo, footer, h1 role
- `src/test/setup.ts` — Fixed next/link and next/image mocks to use React.createElement (Rule 1 auto-fix)

## Decisions Made

- `React.createElement` in setup.ts mocks over `document.createElement` — DOM nodes are not React components; React 19 strict mode throws when trying to set read-only DOM properties
- ScannerError deliberately uses plain `<img>` (not next/image) per CLAUDE.md scanner bundle constraint — no mock needed, simplest test setup
- `vi.mock('@/app/login/actions')` pattern at module level mocks the entire Server Action module — prevents server-only imports from running in jsdom

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed next/link and next/image mocks in setup.ts to use React.createElement**
- **Found during:** Task 1 (first test run of page-header.test.tsx)
- **Issue:** `vi.mock('next/link')` returned a function that creates a DOM node via `document.createElement('a')` then tries `Object.assign(a, { children })` — but DOM `Element.children` is a read-only HTMLCollection getter, so React 19 throws `TypeError: Cannot set property children of [object Element] which has only a getter`
- **Fix:** Replaced both `next/link` and `next/image` mock implementations to use `React.createElement` which produces valid React elements renderable by React's reconciler
- **Files modified:** `src/test/setup.ts`
- **Verification:** All 34 new tests pass; all 45 previous tests (08-01) still pass
- **Committed in:** `65860c6` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug in test infrastructure)
**Impact on plan:** Fix was necessary for correctness — any test rendering a Next.js Link would have crashed without it. No scope creep. Previous test suite unaffected.

## Issues Encountered

None beyond the auto-fixed mock issue.

## Next Phase Readiness

- 34 tests passing across 6 files for all simple presentational components
- Fixed `setup.ts` makes `next/link` and `next/image` properly renderable in all subsequent test plans
- Plans 08-03 through 08-05 can use Link/Image components without any additional setup

---
*Phase: 08-add-unit-tests-to-all-components-and-services*
*Completed: 2026-03-12*
