---
phase: 03-qr-management
plan: 01
subsystem: ui
tags: [qrcode, shadcn, hooks, api-route, supabase]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Supabase client (server.ts), utils (cn), types (Platform, QrCode)
  - phase: 02-scanner
    provides: Scanner page, redirect logic established
provides:
  - QR image generation via generateQrDataUrl() and downloadQrPng()
  - Slug availability check API at GET /api/slug-check
  - useSlugCheck hook with 300ms debounce and SlugStatus type
  - useQrImage hook for client-side download
  - PageHeader, PlatformBadge, EmptyState, QrPulseWrapper shared components
  - shadcn alert-dialog, badge, input, label, select, textarea, tooltip components
affects: [03-02-create-form, 03-03-qr-list, 03-04-edit-form, 03-05-qr-generation]

# Tech tracking
tech-stack:
  added: [qrcode@1.5.4, @types/qrcode@1.5.6]
  patterns:
    - Server-only QR generation (generateQrDataUrl called from Server Components)
    - Client-only download (downloadQrPng uses DOM APIs, tree-shaken from server)
    - Debounced fetch hook with cleanup on unmount
    - SlugStatus union type for exhaustive status handling

key-files:
  created:
    - src/lib/qr-generator.ts
    - src/app/api/slug-check/route.ts
    - src/hooks/use-slug-check.ts
    - src/hooks/use-qr-image.ts
    - src/components/shared/page-header.tsx
    - src/components/shared/platform-badge.tsx
    - src/components/shared/empty-state.tsx
    - src/components/shared/qr-pulse-wrapper.tsx
  modified:
    - package.json
    - pnpm-lock.yaml
    - src/components/ui/alert-dialog.tsx (added)
    - src/components/ui/badge.tsx (added)
    - src/components/ui/input.tsx (added)
    - src/components/ui/label.tsx (added)
    - src/components/ui/select.tsx (added)
    - src/components/ui/textarea.tsx (added)
    - src/components/ui/tooltip.tsx (added)
    - src/components/ui/button.tsx (updated by shadcn)

key-decisions:
  - "pnpm instead of npm for package management — project uses pnpm (node_modules/.modules.yaml detected)"
  - "No 'use server' or 'use client' on qr-generator.ts — tree-shaking separates server generateQrDataUrl from client downloadQrPng"
  - "useEffect cleanup returns clearTimeout to prevent stale fetch results on fast typing"

patterns-established:
  - "SlugStatus union type: idle | checking | available | taken | invalid — exhaustive match in UI"
  - "Server Component shared components (no 'use client') for PageHeader, PlatformBadge, EmptyState"
  - "Client Component QrPulseWrapper uses isPulsing state toggled by trigger prop change"

requirements-completed: [CREATE-02, CREATE-03, GEN-01, GEN-02, ANLYT-02, ANLYT-03]

# Metrics
duration: 3min
completed: 2026-03-11
---

# Phase 3 Plan 1: Shared Infrastructure Summary

**qrcode-based QR generation, slug availability API with 300ms debounce hook, and 4 shared components (PageHeader, PlatformBadge, EmptyState, QrPulseWrapper) providing Phase 3 building blocks**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-11T13:57:06Z
- **Completed:** 2026-03-11T14:00:23Z
- **Tasks:** 2
- **Files modified:** 18

## Accomplishments
- Installed qrcode@1.5.4 + @types/qrcode and 7 shadcn/ui components (alert-dialog, badge, input, label, select, textarea, tooltip)
- Created QR image generation library with brand colors (#0F172A dark, #FFFFFF light), errorCorrectionLevel H, 400px width
- Built slug-check API route querying Supabase anon for active slug uniqueness, plus useSlugCheck hook with 300ms debounce and 5-state SlugStatus type
- Created 4 shared components using project design tokens and cn() utility

## Task Commits

Each task was committed atomically:

1. **Task 1: Install dependencies and shadcn components** - `1f0f359` (chore)
2. **Task 2: Create QR generator, hooks, slug-check API, shared components** - `1557449` (feat)

## Files Created/Modified
- `src/lib/qr-generator.ts` - generateQrDataUrl() (server) and downloadQrPng() (client DOM)
- `src/app/api/slug-check/route.ts` - GET handler returning { available: boolean } via Supabase
- `src/hooks/use-slug-check.ts` - Debounced slug validation hook with SlugStatus type
- `src/hooks/use-qr-image.ts` - Clean download API wrapping downloadQrPng for client components
- `src/components/shared/page-header.tsx` - Page header with optional CTA Link styled as brand button
- `src/components/shared/platform-badge.tsx` - Colored badge using shadcn Badge + platform color map
- `src/components/shared/empty-state.tsx` - Centered empty state with QrCode icon and create CTA
- `src/components/shared/qr-pulse-wrapper.tsx` - Green pulse animation wrapper via animate-qr-pulse class
- `src/components/ui/{alert-dialog,badge,input,label,select,textarea,tooltip}.tsx` - shadcn primitives

## Decisions Made
- Used pnpm (not npm) for package installation — the project uses pnpm as evidenced by `node_modules/.modules.yaml`. npm install was failing with arborist bug in npm 10.8.2 against pnpm-managed node_modules.
- No directive on `qr-generator.ts` — file is not marked `'use client'` or `'use server'`. `generateQrDataUrl` is called server-side, `downloadQrPng` is called client-side. Tree-shaking handles separation since `downloadQrPng` only uses `document`.
- `useEffect` returns cleanup function inside the hook effect body directly (not from the conditional branches) to satisfy React's exhaustive deps rule and prevent memory leaks on fast slug changes.

## Deviations from Plan

None — plan executed exactly as written.

The only notable issue was discovering the project uses pnpm (not npm), handled as Rule 3 (blocking fix) by switching to `pnpm add`. This was an environment discovery, not a code deviation.

## Issues Encountered
- npm install failing with "Cannot read properties of null (reading 'matches')" — npm 10.8.2 arborist bug when trying to install into pnpm-managed node_modules. Resolved by switching to `pnpm add`.

## User Setup Required
None — no external service configuration required.

## Next Phase Readiness
- All shared infrastructure ready for Phase 3 plans 02-05
- Plan 02 (create form) can import useSlugCheck, PageHeader, PlatformBadge from shared
- Plan 03 (QR list) can import EmptyState, PlatformBadge, PageHeader
- Plan 04 (edit form) can import useSlugCheck with currentSlug parameter for edit-mode skip
- shadcn form primitives (input, label, textarea, select) ready for form plans

---
*Phase: 03-qr-management*
*Completed: 2026-03-11*
