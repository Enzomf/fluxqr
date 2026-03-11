---
phase: 02-scanner
plan: 02
subsystem: ui
tags: [scanner, server-component, supabase, after, rpc, deep-link, qr-code]

# Dependency graph
requires:
  - phase: 02-scanner
    plan: 01
    provides: "ScannerLanding client component, TelegramFallback, buildPlatformUrl() deep link builder"
  - phase: 01-foundation
    provides: "createClient() Supabase server helper, QrCode type, increment_scan_count RPC, RLS policies"
provides:
  - "src/app/q/[slug]/page.tsx — Server Component: fetch QR by slug, fire-and-forget scan increment via after(), render ScannerLanding or error states"
  - "src/app/q/[slug]/not-found.tsx — Branded not-found card for missing slugs"
affects:
  - End-to-end scanner flow complete — scanning a QR opens the right messaging app

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "after() from next/server for fire-and-forget side effects after response"
    - "Minimal @supabase/ssr client with empty cookie handlers for use inside after() callbacks"
    - "Service-role client (server-side only) to distinguish missing vs inactive slugs without exposing key to client"
    - "notFound() from next/navigation for missing slugs — triggers not-found.tsx"
    - "Inline deactivated card render for inactive slugs (vs notFound() for missing)"

key-files:
  created:
    - src/app/q/[slug]/page.tsx
    - src/app/q/[slug]/not-found.tsx
  modified: []

key-decisions:
  - "Service-role client used server-side to detect inactive vs missing slugs — anon RLS only sees active rows, so slug existence check requires elevated access"
  - "after() with minimal empty-cookie Supabase client — createClient() from server.ts calls cookies() which throws inside after() callbacks"
  - "Inline deactivated state render (not a separate route/page) — simpler than a separate error page, keeps all scanner states in one file"

patterns-established:
  - "Server Components only on /q/[slug] — no client-side Supabase queries, zero auth, no sidebar"
  - "after() pattern for non-blocking analytics: create minimal client, fire RPC, no await at render level"

requirements-completed: [SCAN-01, SCAN-02, SCAN-06, SCAN-07]

# Metrics
duration: 1min
completed: 2026-03-11
---

# Phase 02 Plan 02: Scanner Server Component Summary

**Next.js 15 Server Component proxying QR slugs: anon fetch, service-role inactive detection, fire-and-forget scan count via after(), and branded error states**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-11T03:04:57Z
- **Completed:** 2026-03-11T03:05:36Z
- **Tasks:** 1 (of 2 — Task 2 is human-verify checkpoint)
- **Files modified:** 2

## Accomplishments
- page.tsx fetches QR record via anon Supabase client (RLS enforces active-only reads)
- Inactive vs missing slug detection via service-role client (no key exposed to client)
- Fire-and-forget scan_count increment via after() using minimal empty-cookie client (avoids cookies() call restriction)
- not-found.tsx renders branded "This link does not exist" centered card

## Task Commits

Each task was committed atomically:

1. **Task 1: Build server component page and not-found** - `ddd2852` (feat)

## Files Created/Modified
- `src/app/q/[slug]/page.tsx` - Server Component: fetch QR, detect inactive vs missing, increment scan count, render ScannerLanding
- `src/app/q/[slug]/not-found.tsx` - Branded not-found page for missing slugs

## Decisions Made
- Service-role client server-side to distinguish inactive vs missing: anon RLS policy `public_select_active` blocks reads of inactive rows, so a null result is ambiguous without elevated access
- after() fire-and-forget uses empty-cookie createServerClient: the createClient() helper from server.ts calls cookies() from next/headers which is unavailable inside after() callbacks
- Inline JSX for deactivated state (not a separate error page): keeps all scanner logic in one file, matches plan spec

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Complete scanner flow: Plan 01 built client components, Plan 02 wired the server proxy
- Awaiting human-verify checkpoint (Task 2) — user must run pnpm dev and verify all scanner states
- No blockers for dashboard phase once scanner is verified

---
*Phase: 02-scanner*
*Completed: 2026-03-11*

## Self-Check: PASSED

- `src/app/q/[slug]/page.tsx` exists on disk
- `src/app/q/[slug]/not-found.tsx` exists on disk
- Commit `ddd2852` verified in git log
- `pnpm tsc --noEmit` passed with zero errors
