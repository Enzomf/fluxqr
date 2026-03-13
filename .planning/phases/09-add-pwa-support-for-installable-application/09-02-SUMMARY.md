---
phase: 09-add-pwa-support-for-installable-application
plan: 02
subsystem: infra
tags: [pwa, serwist, service-worker, offline, testing, vitest, react-testing-library]

# Dependency graph
requires:
  - phase: 09-add-pwa-support-for-installable-application
    plan: 01
    provides: Serwist next.config.ts wrapper, manifest.ts, PWA icons, tsconfig webworker types

provides:
  - Service worker source (src/app/sw.ts) with Serwist precache + defaultCache + /~offline fallback
  - Branded offline fallback page at /~offline (Server Component, zero auth, zero sidebar)
  - Unit tests for manifest.ts (8 assertions validating all required fields)
  - Render tests for offline page (4 assertions confirming logo, heading, link, description)

affects:
  - PWA deployment — sw.ts is the swSrc entry point that next build --webpack compiles

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Service worker uses self.__SW_MANIFEST for precache entries injected by Serwist webpack plugin
    - Offline page as pure Server Component (no "use client") matching ScannerError lightweight pattern
    - Plain <img> tag in offline page (not next/image) to avoid client JS weight on fallback route

key-files:
  created:
    - src/app/sw.ts
    - src/app/~offline/page.tsx
    - src/app/manifest.test.ts
    - src/app/~offline/page.test.tsx

key-decisions:
  - "Plain <img> tag in offline page (not next/image) — matches ScannerError pattern, avoids adding client JS weight to an already-lightweight fallback route"
  - "OfflinePage is a pure Server Component (no use client) — offline fallback should have zero client-side overhead"

patterns-established:
  - "Serwist fallback entries reference /~offline URL — document navigation requests when offline are served the precached offline page"
  - "WorkerGlobalScope extended with SerwistGlobalConfig for __SW_MANIFEST TypeScript typing pattern"

requirements-completed: [PWA-03, PWA-04]

# Metrics
duration: 2min
completed: 2026-03-13
---

# Phase 9 Plan 02: Service Worker and Offline Page Summary

**Serwist service worker source (sw.ts) with precache + defaultCache + /~offline document fallback, branded Server Component offline page, and 12 passing unit tests for manifest and offline rendering**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-13T18:23:24Z
- **Completed:** 2026-03-13T18:25:30Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Created `src/app/sw.ts` with Serwist: precaches `self.__SW_MANIFEST`, uses `defaultCache` runtime caching, and falls back to `/~offline` for all document navigation requests when offline
- Created `src/app/~offline/page.tsx` as a pure Server Component (no "use client") with FluxQR logo, "You're offline" heading, connection check text, and "Try again" link to "/"
- Wrote 8-assertion `manifest.test.ts` validating all required manifest fields (name, display, orientation, colors, start_url, icons array with correct src/sizes/purpose, non-empty description)
- Wrote 4-assertion `page.test.tsx` confirming offline page renders logo img (alt="FluxQR"), heading, try-again link (href="/"), and description text containing "connection"
- All 12 tests pass via `pnpm test:run`

## Task Commits

1. **Task 1: Create service worker source and branded offline page** - `85fbb82` (feat)
2. **Task 2: Write unit tests for manifest and offline page** - `69589b3` (test)

**Plan metadata:** _(docs commit to follow)_

## Files Created/Modified

- `src/app/sw.ts` - Serwist service worker entry point: precache, runtime caching, offline fallback
- `src/app/~offline/page.tsx` - Branded offline Server Component with logo, heading, and try-again link
- `src/app/manifest.test.ts` - Unit tests for manifest.ts validating all PWA fields
- `src/app/~offline/page.test.tsx` - Render tests for offline page component

## Decisions Made

- Plain `<img>` tag in offline page (not `next/image`) — matches the ScannerError lightweight pattern established in Phase 7 to avoid adding client JS weight to the offline fallback route
- `OfflinePage` is a pure Server Component — no "use client" directive, no auth, no sidebar, consistent with zero-overhead fallback requirement

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

Pre-existing TypeScript error in `src/components/qr-management/qr-form-dialog.test.tsx` (TS2322: `phone_number` property missing in test fixture) — this is a Phase 8 test issue noted in 09-01-SUMMARY.md as deferred, unrelated to PWA changes. All four files created in this plan compile cleanly.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- PWA implementation is complete. `next build --webpack` will compile `src/app/sw.ts` into `public/sw.js` via the Serwist webpack plugin.
- The `/~offline` route exists and will be served as the offline fallback for all document navigation requests.
- Phase 9 (all plans) is complete.

## Self-Check: PASSED

All 4 created files exist on disk. Both task commits (85fbb82, 69589b3) are in git log.

---
*Phase: 09-add-pwa-support-for-installable-application*
*Completed: 2026-03-13*
