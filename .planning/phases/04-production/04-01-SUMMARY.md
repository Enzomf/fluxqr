---
phase: 04-production
plan: 01
subsystem: ui
tags: [next.js, react, tailwind, server-component, scanner, error-page]

# Dependency graph
requires:
  - phase: 02-scanner
    provides: scanner page and slug proxy that triggers these error states
provides:
  - Shared ScannerError Server Component for branded 404/410 error states
  - Upgraded not-found.tsx with FluxQR logo, status code, and footer
  - Upgraded deactivated slug return in page.tsx with branded 410 page
affects: [04-production]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Shared ScannerError Server Component used by both not-found.tsx and page.tsx
    - statusCode prop differentiates 404 (missing) vs 410 (deactivated) semantically

key-files:
  created:
    - src/components/scanner/scanner-error.tsx
  modified:
    - src/app/q/[slug]/not-found.tsx
    - src/app/q/[slug]/page.tsx

key-decisions:
  - "ScannerError is a pure Server Component with no 'use client' — honors SCAN-06 under-10KB-JS constraint"
  - "410 status code used for deactivated links to differentiate semantically from 404 missing links"
  - "80px logo in error context vs 160px in login page — proportional to card size and error page context"

patterns-established:
  - "Shared branded error component pattern: single ScannerError component handles all scanner error states via props"

requirements-completed: [PROD-01, PROD-02]

# Metrics
duration: 2min
completed: 2026-03-12
---

# Phase 4 Plan 01: Branded Scanner Error Pages Summary

**Shared ScannerError Server Component providing branded 404/410 error pages for missing and deactivated QR code slugs, with FluxQR logo, status code, descriptive text, and "Powered by FluxQR" footer — zero client JS**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-12T15:45:26Z
- **Completed:** 2026-03-12T15:47:12Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Created `src/components/scanner/scanner-error.tsx` as a pure Server Component with branded card layout matching the login page design system
- Upgraded `not-found.tsx` to use ScannerError with 404 status code, "Link not found" title, and descriptive message
- Replaced inline deactivated JSX in `page.tsx` with ScannerError using 410 status code and "Link deactivated" title

## Task Commits

Each task was committed atomically:

1. **Task 1: Create ScannerError component and upgrade not-found page** - `cd3f61e` (feat)
2. **Task 2: Replace deactivated inline JSX with ScannerError in page.tsx** - `5a70927` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `src/components/scanner/scanner-error.tsx` - Shared branded error card Server Component with logo, status code, title, description, and footer
- `src/app/q/[slug]/not-found.tsx` - Upgraded to use ScannerError with 404 branding
- `src/app/q/[slug]/page.tsx` - Deactivated branch now uses ScannerError with 410 branding

## Decisions Made
- ScannerError has no 'use client' directive — pure Server Component to honor the scanner page under-10KB-JS constraint
- 410 status code for deactivated links vs 404 for missing links — semantically correct HTTP distinction
- 80px logo width in error context (vs 160px in login) — appropriate for compact error card layout

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Both scanner error states are now branded and production-ready
- ScannerError component in `components/scanner/` ready for any additional error state variants
- Ready to proceed to 04-02

---
*Phase: 04-production*
*Completed: 2026-03-12*

## Self-Check: PASSED

- FOUND: src/components/scanner/scanner-error.tsx
- FOUND: src/app/q/[slug]/not-found.tsx
- FOUND: src/app/q/[slug]/page.tsx
- FOUND: .planning/phases/04-production/04-01-SUMMARY.md
- FOUND commit: cd3f61e
- FOUND commit: 5a70927
