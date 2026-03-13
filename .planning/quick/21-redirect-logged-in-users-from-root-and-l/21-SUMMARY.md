---
phase: quick-21
plan: 01
subsystem: auth
tags: [nextjs, middleware, supabase, redirect, oauth]

# Dependency graph
requires:
  - phase: quick-18
    provides: OAuth callback and login page redirect baseline
provides:
  - Middleware redirects authenticated users from / and /login to /dashboard
  - Post-OAuth Google sign-in lands on /dashboard (not root)
  - Login page server-side redirect goes to /dashboard
affects: [auth, middleware, login]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Middleware-first auth redirect: check user before route guards, redirect to /dashboard when authenticated on public routes

key-files:
  created: []
  modified:
    - src/middleware.ts
    - src/app/auth/callback/route.ts
    - src/app/login/page.tsx

key-decisions:
  - "Authenticated-user redirect added BEFORE dashboard/admin guards in middleware — ensures / and /login checks run independently of protected-route logic"
  - "Matcher expanded to ['/', '/login', '/dashboard/:path*', '/admin/:path*'] — middleware now runs on public routes to enable auth-aware redirects"
  - "Auth callback redirectUrl changed from origin to origin + '/dashboard' — post-OAuth flow goes straight to dashboard, not the freemium home page"

patterns-established:
  - "Auth-aware public route redirect: if user && (pathname === '/' || pathname === '/login') → redirect to /dashboard in middleware"

requirements-completed: [QUICK-21]

# Metrics
duration: 3min
completed: 2026-03-13
---

# Quick Task 21: Redirect Logged-In Users Summary

**Middleware + callback + login page wired to redirect authenticated users from / and /login directly to /dashboard, so logged-in users never land on the freemium home or sign-in screen.**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-13T18:42:57Z
- **Completed:** 2026-03-13T18:45:56Z
- **Tasks:** 1
- **Files modified:** 3

## Accomplishments
- Middleware now checks for authenticated user on `/` and `/login` and issues a 302 redirect to `/dashboard` before any other guard runs
- Auth callback (`/auth/callback/route.ts`) directs post-OAuth flow to `/dashboard` instead of origin root
- Login page server-side redirect corrected from `/` to `/dashboard` for already-logged-in users visiting `/login` directly
- Unauthenticated users still reach `/` (public freemium home) and `/login` unchanged

## Task Commits

Each task was committed atomically:

1. **Task 1: Add authenticated-user redirect in middleware and fix callback/login targets** - `a276e42` (feat)

**Plan metadata:** _(final docs commit follows)_

## Files Created/Modified
- `src/middleware.ts` - Added redirect block for authenticated users on / and /login; expanded matcher to include those routes
- `src/app/auth/callback/route.ts` - Changed redirectUrl from `origin` to `origin + '/dashboard'`
- `src/app/login/page.tsx` - Changed `redirect('/')` to `redirect('/dashboard')` on authenticated user

## Decisions Made
- Authenticated-user redirect added before dashboard/admin guards so it applies uniformly without conflicting with the existing protection logic.
- Matcher expanded from `['/dashboard/:path*', '/admin/:path*']` to `['/', '/login', '/dashboard/:path*', '/admin/:path*']` — middleware must run on root and login to perform the check.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
A pre-existing TypeScript error in `src/components/qr-management/qr-form-dialog.test.tsx` (missing `phone_number` property on test fixture) was present before this task and is unrelated to any of the three files modified. No action taken — out of scope per deviation rules.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Auth flow is fully correct: Google OAuth, direct login, and root navigation all send authenticated users to /dashboard.
- No blockers or concerns.

---
*Phase: quick-21*
*Completed: 2026-03-13*
