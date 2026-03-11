---
phase: 05-public-qr-generation-with-phone-verification-usage-limits-and-admin-dashboard
plan: 05
subsystem: admin
tags: [admin, dashboard, supabase, server-actions, rbac, next-js]

# Dependency graph
requires:
  - phase: 05-public-qr-generation-with-phone-verification-usage-limits-and-admin-dashboard
    plan: 01
    provides: createAdminClient, AppRole/Profile types, profiles table with role column
  - phase: 05-public-qr-generation-with-phone-verification-usage-limits-and-admin-dashboard
    plan: 04
    provides: Middleware protecting /admin/* routes (admin role required)
provides:
  - Admin layout at /admin with auth + role guard (defense-in-depth)
  - /admin page — all-users table with QR count, total scans, and deactivation action
  - /admin/[userId] page — per-user QR codes table with scan counts and deactivation
  - deactivateUser and deactivateQrCode Server Actions with verifyAdmin() check
  - UserTable and UserQrTable client components with optimistic pending states
affects: [operational visibility, abuse prevention, freemium enforcement]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Service-role admin client for cross-user data reads (bypasses RLS)
    - Defense-in-depth admin role check in both middleware (plan 04) and layout
    - verifyAdmin() helper in Server Actions prevents direct unauthenticated invocation
    - useTransition for deactivation pending state in client table components
    - JS-side QR code aggregation (count + sum scans) from a single flat qr_codes query

key-files:
  created:
    - src/app/admin/layout.tsx
    - src/app/admin/page.tsx
    - src/app/admin/[userId]/page.tsx
    - src/app/actions/admin-actions.ts
    - src/components/admin/user-table.tsx
    - src/components/admin/user-qr-table.tsx
  modified:
    - next.config.ts

key-decisions:
  - "verifyAdmin() in Server Actions provides defense-in-depth — middleware is first layer, Server Action check is second layer"
  - "JS aggregation for QR stats (count + scans per user) — simpler than Postgres RPC for MVP, single query then Map iteration"
  - "UserQrTable includes phone-only QRs (user_id=null) if profile.phone_number matches — complete view of a user's QR activity"
  - "deactivateUser cascades to all user QR codes in a single admin client update — atomic soft-delete of user and all their codes"
  - "Remove src/proxy.ts (obsolete middlware file) — coexistence with src/middleware.ts broke Next.js 16 Turbopack build"

patterns-established:
  - "Admin data fetching uses createAdminClient() only — never the standard createClient() for cross-user reads"
  - "verifyAdmin() function pattern: createClient for auth check, throw on non-admin — reusable across all admin actions"

requirements-completed: [PUB-04, PUB-05]

# Metrics
duration: 2min
completed: 2026-03-11
---

# Phase 05 Plan 05: Admin Dashboard Summary

**Admin dashboard with all-users table, per-user QR detail view, and soft-deactivation Server Actions — operational interface for managing the public QR generation system**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-11T20:46:55Z
- **Completed:** 2026-03-11T20:49:00Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- Admin layout at `/admin` with Server Component auth/role guard — unauthenticated users redirect to /login, non-admin users redirect to /dashboard
- `/admin` page fetches all profiles via service-role admin client, aggregates QR code counts and total scans per user in JS, renders in UserTable with email, phone, QR count, total scans, joined date, status badge, and a deactivate button
- `/admin/[userId]` page fetches the profile + all owned QR codes + phone-linked QRs (user_id=null), renders in UserQrTable with PlatformBadge, scan counts, status, and deactivate button
- `deactivateUser` Server Action cascades soft-delete to all the user's QR codes atomically using admin client
- `deactivateQrCode` Server Action soft-deactivates a single QR code via admin client
- Both actions call `verifyAdmin()` for defense-in-depth authorization before any writes

## Task Commits

Each task was committed atomically:

1. **Task 1: Create admin layout, Server Actions, and table components** - `cbdc431` (feat)
2. **Task 2: Create admin pages with data fetching** - `90fd534` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `src/app/admin/layout.tsx` - Server Component with auth + role guard; admin header shell with FluxQR link and "Back to Dashboard" link
- `src/app/admin/page.tsx` - Fetches all profiles and QR stats via admin client; aggregates in JS; renders UserTable
- `src/app/admin/[userId]/page.tsx` - Fetches profile + owned QRs + phone-linked QRs; renders UserQrTable
- `src/app/actions/admin-actions.ts` - Server Actions: deactivateUser (cascades to QR codes) and deactivateQrCode, both protected by verifyAdmin()
- `src/components/admin/user-table.tsx` - Client component with per-row deactivation via useTransition; rows link to /admin/[userId]
- `src/components/admin/user-qr-table.tsx` - Client component with PlatformBadge, formatScanCount, per-QR deactivation via useTransition
- `next.config.ts` - Added turbopack.root: __dirname to fix workspace root detection warning

## Decisions Made

- verifyAdmin() in every admin Server Action provides defense-in-depth — middleware is the first protection layer, the action check is the second
- JS aggregation for user stats (qr_count + total_scans) from a single flat qr_codes query — simpler than adding a Postgres RPC for MVP
- UserQrTable includes phone-only QR codes (user_id=null) matched by phone_number — shows complete QR activity for a user regardless of creation path
- deactivateUser cascades to all QR codes via a single admin.from('qr_codes').update().eq('user_id', userId) — no need for individual code deactivation

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Removed src/proxy.ts — conflicted with src/middleware.ts in Next.js 16 Turbopack**
- **Found during:** Task 2 verification (pnpm build)
- **Issue:** Next.js 16 Turbopack detected both `src/middleware.ts` (created in Plan 04) and `src/proxy.ts` (from Plan 01, superseded) and threw a build error: "Both middleware file and proxy file are detected"
- **Fix:** Deleted `src/proxy.ts` — its functionality (dashboard auth guard) was fully superseded by `src/middleware.ts` which also adds the admin role check
- **Files modified:** `src/proxy.ts` (deleted)
- **Commit:** `90fd534`

**2. [Rule 3 - Blocking] Added turbopack.root to next.config.ts**
- **Found during:** Task 2 verification (pnpm build)
- **Issue:** Next.js 16 detected a `yarn.lock` in the parent directory and inferred an incorrect workspace root, causing double-`src` path resolution
- **Fix:** Added `turbopack: { root: __dirname }` to `next.config.ts` to explicitly anchor the project root
- **Files modified:** `next.config.ts`
- **Commit:** `90fd534`

## Issues Encountered

None beyond the auto-fixed blocking build issues above.

## User Setup Required

None — no external service configuration required for this plan.

## Next Phase Readiness

- Admin dashboard is fully operational: view all users, view per-user QR codes, deactivate users, deactivate individual QR codes
- All Phase 05 plans are complete — the full public QR generation feature with phone verification, usage limits, and admin dashboard is done
- Next milestone: Phase 06 (future) or deployment

---
*Phase: 05-public-qr-generation-with-phone-verification-usage-limits-and-admin-dashboard*
*Completed: 2026-03-11*

## Self-Check: PASSED

- src/app/admin/layout.tsx: FOUND
- src/app/admin/page.tsx: FOUND
- src/app/admin/[userId]/page.tsx: FOUND
- src/app/actions/admin-actions.ts: FOUND
- src/components/admin/user-table.tsx: FOUND
- src/components/admin/user-qr-table.tsx: FOUND
- Commit cbdc431: FOUND
- Commit 90fd534: FOUND
