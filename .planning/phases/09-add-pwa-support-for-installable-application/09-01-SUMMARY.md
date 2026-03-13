---
phase: 09-add-pwa-support-for-installable-application
plan: 01
subsystem: infra
tags: [pwa, serwist, service-worker, manifest, icons, sharp, next.js]

# Dependency graph
requires:
  - phase: 08-add-unit-tests
    provides: stable codebase with passing tests to build PWA on top of
provides:
  - Web app manifest via Next.js Metadata API (src/app/manifest.ts)
  - Three PWA icon PNGs in public/ (192, 512, maskable)
  - Serwist-wrapped next.config.ts for service worker build pipeline
  - tsconfig.json updated for webworker types and Serwist typings
  - Apple PWA meta tags in root layout for iOS home screen support
  - Icon generation script (scripts/generate-icons.mjs) using sharp
affects:
  - 09-02: service worker and offline page depend on this Serwist config foundation

# Tech tracking
tech-stack:
  added: [serwist, "@serwist/next", sharp]
  patterns:
    - Next.js MetadataRoute.Manifest for typed web app manifest
    - withSerwistInit wrapper pattern in next.config.ts (disabled in dev)
    - One-time icon generation script with sharp for safe-zone maskable icons

key-files:
  created:
    - src/app/manifest.ts
    - scripts/generate-icons.mjs
    - public/icon-192x192.png
    - public/icon-512x512.png
    - public/icon-maskable.png
  modified:
    - next.config.ts
    - tsconfig.json
    - package.json
    - .gitignore
    - src/app/layout.tsx

key-decisions:
  - "reloadOnOnline: false in Serwist config — avoids destroying in-progress form state when user reconnects"
  - "additionalPrecacheEntries for /~offline ensures offline page is cached before user ever goes offline"
  - "next build --webpack required — Serwist webpack plugin does not run under Turbopack (Next.js 16 default)"
  - "Maskable icon uses 60% logo size (307px) centered on #0F172A canvas for safe-zone compliance"
  - "disable: process.env.NODE_ENV === development — service worker disabled in dev to avoid cache confusion"

patterns-established:
  - "PWA icons generated via sharp script (not design tools) — repeatable, source-controlled"
  - "Serwist wraps NextConfig transparently — config stays minimal, plugin concerns isolated"

requirements-completed: [PWA-01, PWA-02, PWA-05, PWA-06]

# Metrics
duration: 8min
completed: 2026-03-13
---

# Phase 9 Plan 01: PWA Infrastructure Summary

**Serwist-based PWA foundation with web app manifest, three icon PNGs (192, 512, maskable), Apple meta tags, and Webpack build pipeline — ready for service worker in Plan 02**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-13T15:19:00Z
- **Completed:** 2026-03-13T15:27:00Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- Installed `@serwist/next` and `serwist` packages; added `sharp` as dev dependency for icon generation
- Generated three PWA icon PNGs using a Node.js sharp script from `public/logo.png` (192x192, 512x512, 512x512 maskable with safe-zone padding)
- Created `src/app/manifest.ts` using Next.js `MetadataRoute.Manifest` API with FluxQR branding, standalone display, and all three icons
- Wrapped `next.config.ts` with `withSerwistInit` pointing to `src/app/sw.ts`, disabled in dev, with `/~offline` precache entry
- Updated `tsconfig.json` with `webworker` lib and `@serwist/next/typings` type for service worker compilation
- Added Apple PWA meta tags (`appleWebApp`, `icons.apple`) to root layout for iOS home screen support

## Task Commits

1. **Task 1: Install deps, generate PWA icons, create manifest.ts** - `2b504aa` (feat)
2. **Task 2: Configure Serwist, update tsconfig, add Apple meta tags** - `b29b2f6` (feat)

**Plan metadata:** _(docs commit to follow)_

## Files Created/Modified

- `src/app/manifest.ts` - Web app manifest via Next.js Metadata API, served at /manifest.webmanifest
- `scripts/generate-icons.mjs` - Node.js sharp script for one-time icon generation from logo.png
- `public/icon-192x192.png` - 192x192 standard PWA icon
- `public/icon-512x512.png` - 512x512 standard PWA icon
- `public/icon-maskable.png` - 512x512 maskable icon with #0F172A background and safe-zone padding
- `next.config.ts` - Wrapped with withSerwistInit (swSrc: src/app/sw.ts, disabled in dev)
- `tsconfig.json` - Added webworker to lib, @serwist/next/typings to types, public/sw.js to exclude
- `package.json` - Build script changed to `next build --webpack`, added `generate-icons` script
- `.gitignore` - Added public/sw.js, sw.js.map, swe-worker* to ignored files
- `src/app/layout.tsx` - Added appleWebApp and icons.apple to metadata export

## Decisions Made

- `reloadOnOnline: false` in Serwist config to avoid destroying in-progress form state when user reconnects
- `additionalPrecacheEntries` for `/~offline` ensures the offline page is available before user ever goes offline
- `next build --webpack` required — Serwist webpack plugin does not run under Turbopack (Next.js 16 default)
- Maskable icon uses 60% logo size (307px) centered on `#0F172A` canvas to satisfy safe-zone requirement (~102px padding)
- `disable: process.env.NODE_ENV === "development"` — service worker disabled in dev to avoid cache confusion during development

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

Pre-existing TypeScript error in `src/components/qr-management/qr-form-dialog.test.tsx` (TS2322: `phone_number` property missing in test fixture). This is a Phase 8 test issue unrelated to PWA changes — deferred to `deferred-items.md`. All PWA-related files compile cleanly.

## User Setup Required

None — no external service configuration required for PWA infrastructure.

## Next Phase Readiness

- All PWA infrastructure in place for Plan 09-02 (service worker + offline page)
- `src/app/sw.ts` is the expected service worker entry point (referenced in next.config.ts `swSrc`)
- `/~offline` route must be created in Plan 02 (it's in `additionalPrecacheEntries` already)
- No blockers.

## Self-Check: PASSED

All created files exist on disk. Both task commits (2b504aa, b29b2f6) verified in git log.

---
*Phase: 09-add-pwa-support-for-installable-application*
*Completed: 2026-03-13*
