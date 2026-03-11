---
phase: 05-public-qr-generation-with-phone-verification-usage-limits-and-admin-dashboard
plan: 04
subsystem: auth
tags: [supabase, middleware, next-js, oauth, account-linking, rbac, sidebar]

# Dependency graph
requires:
  - phase: 05-public-qr-generation-with-phone-verification-usage-limits-and-admin-dashboard
    plan: 01
    provides: createAdminClient, AppRole/Profile types, profiles table with role column
  - phase: 05-public-qr-generation-with-phone-verification-usage-limits-and-admin-dashboard
    plan: 03
    provides: createPublicQr flow, verified_phone cookie set during OTP flow, phone_number on qr_codes
provides:
  - Next.js middleware protecting /dashboard/* (auth required) and /admin/* (admin role required)
  - OAuth callback extended with phone QR account linking via admin client
  - Sidebar with conditional Admin nav link based on isAdmin prop
  - Dashboard layout querying profile role and passing isAdmin to Sidebar
affects: [admin dashboard phase, any future protected routes]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Defense-in-depth auth: middleware layer + layout-level getUser guard both active for /dashboard
    - Admin role check via profiles table query in middleware for /admin/* routes
    - Fire-and-forget account linking in OAuth callback (try/catch, non-blocking redirect)
    - isAdmin derived server-side in Server Component layout, passed as prop to client Sidebar

key-files:
  created:
    - src/middleware.ts
  modified:
    - src/app/auth/callback/route.ts
    - src/components/dashboard/sidebar.tsx
    - src/app/dashboard/layout.tsx

key-decisions:
  - "Middleware uses @supabase/ssr createServerClient with request/response cookie bridge pattern (not importing server.ts)"
  - "Admin role check in middleware queries profiles table directly — avoids JWT claims which require trigger-based sync"
  - "Account linking in OAuth callback is fire-and-forget (try/catch) — linking failure does not block redirect to dashboard"
  - "isAdmin prop on Sidebar (not role string) — Sidebar is a client component, role logic stays in Server Component layout"
  - "verified_phone cookie deleted both in cookieStore and on response object — covers both server-side and client-side expiration"

patterns-established:
  - "Middleware admin check: query profiles.role after getUser() — only runs for /admin/* paths"
  - "OAuth callback account linking pattern: read verified_phone cookie after exchangeCodeForSession, use admin client for cross-RLS update"

requirements-completed: [PUB-03, PUB-04, PUB-05]

# Metrics
duration: 2min
completed: 2026-03-11
---

# Phase 05 Plan 04: Auth Layer and Account Linking Summary

**Next.js middleware for /dashboard+/admin route protection, OAuth callback extended with phone-QR-to-user account linking, and conditional Admin sidebar link for admin role users**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-11T20:43:29Z
- **Completed:** 2026-03-11T20:44:48Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Middleware guards /dashboard/* (unauthenticated → /login) and /admin/* (unauthenticated → /login, non-admin → /dashboard) using @supabase/ssr cookie bridge pattern
- OAuth callback now links phone-created QR codes (user_id=null) to the newly authenticated Google user, and updates profile.phone_number, then deletes the verified_phone cookie
- Sidebar renders an Admin nav link conditionally when isAdmin prop is true; Dashboard layout derives isAdmin from profiles table and passes it down

## Task Commits

Each task was committed atomically:

1. **Task 1: Create middleware for dashboard and admin route protection** - `0364720` (feat)
2. **Task 2: Extend OAuth callback for account linking, update sidebar and dashboard layout** - `4223df0` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `src/middleware.ts` - Next.js middleware with @supabase/ssr cookie bridge; protects /dashboard/* (auth) and /admin/* (admin role)
- `src/app/auth/callback/route.ts` - Extended with phone QR account linking via createAdminClient after exchangeCodeForSession
- `src/components/dashboard/sidebar.tsx` - Added isAdmin prop; navItems computed with conditional Admin link
- `src/app/dashboard/layout.tsx` - Queries profile role, derives isAdmin, passes to Sidebar

## Decisions Made

- Middleware creates its own Supabase client (not importing server.ts) — middleware needs direct request/response cookie access, not the cookieStore abstraction
- Admin role check queries profiles table in middleware — avoids JWT claims which would require a trigger to keep in sync
- Account linking is fire-and-forget (wrapped in try/catch) — failure logs to console but doesn't break the OAuth redirect flow
- isAdmin is a boolean prop on Sidebar (not the full role string) — keeps Sidebar interface minimal; role derivation stays in the Server Component layout
- verified_phone cookie deleted in both cookieStore and response.cookies.delete — ensures cleanup on both server-side and client-side cookie jars

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required for this plan.

## Next Phase Readiness

- Authorization layer is complete: dashboard routes require auth, admin routes require admin role
- Account linking is wired: phone-verified visitors who sign up with Google will see their QR codes in the dashboard
- Admin sidebar link is in place; ready for admin dashboard UI (Phase 05 Plan 05)

---
*Phase: 05-public-qr-generation-with-phone-verification-usage-limits-and-admin-dashboard*
*Completed: 2026-03-11*
