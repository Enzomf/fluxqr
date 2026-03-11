---
phase: 01-foundation
plan: 03
subsystem: auth
tags: [supabase, google-oauth, nextjs, proxy, ssr, cookie-auth, server-actions]

# Dependency graph
requires:
  - phase: 01-foundation plan 01
    provides: Supabase server.ts createClient, cn(), design tokens (brand-500, surface, shadow-brand-glow), shadcn Button

provides:
  - Google OAuth sign-in flow via signInWithGoogle server action
  - /auth/callback route: exchanges OAuth code for session, redirects to /dashboard
  - src/proxy.ts: route protection for /dashboard/* with double cookie write session refresh
  - /login page: branded card with FluxQR wordmark, tagline, and Google sign-in button
  - GoogleSignInButton client component with useFormStatus loading state

affects: [01-04, 02-dashboard, all authenticated flows]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Next.js 16 proxy.ts pattern: export async function proxy() (not middleware.ts/middleware)"
    - "OAuth callback: createServerClient inline in route handler for cookie write access"
    - "Double cookie write in proxy.ts: set on both request.cookies AND supabaseResponse.cookies"
    - "Google OAuth via Supabase signInWithOAuth with redirectTo to /auth/callback"
    - "useFormStatus for server action pending states in client forms"

key-files:
  created:
    - src/app/login/page.tsx
    - src/app/login/actions.ts
    - src/components/auth/google-sign-in-button.tsx
    - src/app/auth/callback/route.ts
    - src/proxy.ts
  modified: []

key-decisions:
  - "Used getUser() instead of getClaims() in proxy.ts — getClaims() not available in @supabase/ssr ^0.9.0; getUser() is safe (server-side validation, cannot be spoofed)"
  - "callback route creates its own Supabase client inline (not importing from server.ts) because it needs cookie write access in a route handler context"

patterns-established:
  - "Pattern 4 (proxy.ts): All /dashboard/* routes guarded by getUser() check with redirect to /login on failure"
  - "Pattern 5 (callback): exchangeCodeForSession inline client in GET route handler"

requirements-completed: [AUTH-01, AUTH-02, AUTH-03]

# Metrics
duration: 2min
completed: 2026-03-11
---

# Phase 1 Plan 03: Google OAuth Authentication Summary

**Google OAuth login-to-dashboard flow with Supabase signInWithOAuth, /auth/callback code exchange, and proxy.ts route guard using getAll/setAll double cookie write**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-11T02:04:16Z
- **Completed:** 2026-03-11T02:06:05Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Wired complete Google OAuth flow: /login -> signInWithGoogle -> Google consent -> /auth/callback -> /dashboard
- Created /login page with centered card, FluxQR wordmark in brand-500 indigo, tagline in muted-foreground, shadow-brand-glow
- Created src/proxy.ts for /dashboard/* protection with double cookie write pattern ensuring session refresh propagates to Server Components

## Task Commits

Each task was committed atomically:

1. **Task 1: Login page with Google OAuth sign-in** - `7c23f30` (feat)
2. **Task 2: OAuth callback route and proxy.ts route protection** - `4f184dd` (feat)

**Plan metadata:** (docs commit to follow)

## Files Created/Modified
- `src/app/login/page.tsx` - Login page: centered card on bg-surface, FluxQR wordmark, tagline, shadow-brand-glow, GoogleSignInButton
- `src/app/login/actions.ts` - signInWithGoogle server action: signInWithOAuth with redirectTo NEXT_PUBLIC_SITE_URL/auth/callback
- `src/components/auth/google-sign-in-button.tsx` - Client component: form with action={signInWithGoogle}, useFormStatus pending state, Google SVG icon
- `src/app/auth/callback/route.ts` - GET handler: creates inline Supabase client, exchangeCodeForSession(code), redirects to /dashboard
- `src/proxy.ts` - Next.js 16 proxy function: getUser() auth check, double cookie write, /dashboard/* guard, config matcher

## Decisions Made
- Used `getUser()` (not `getClaims()`) in proxy.ts: `getClaims()` is not exported/available in `@supabase/ssr ^0.9.0`. `getUser()` is safe for auth checks — it validates against the Supabase server and cannot be spoofed.
- OAuth callback creates its own Supabase client inline: route handlers need direct access to `cookies()` for writing session cookies; importing from `server.ts` would work but the inline pattern is explicit and matches official Supabase docs (Pattern 5 from research).

## Deviations from Plan

None — plan executed exactly as written. The `getClaims()` fallback to `getUser()` was pre-documented in the plan as the expected path for `@supabase/ssr ^0.9.0`.

## Issues Encountered
None.

## User Setup Required
Google OAuth requires configuration before the sign-in flow will work end-to-end:
1. **Google Cloud Console:** Register OAuth 2.0 credentials with `http://localhost:3000/auth/callback` (dev) and `https://yourdomain.com/auth/callback` (prod) as authorized redirect URIs
2. **Supabase Auth Dashboard:** Enable Google provider, enter Client ID + Client Secret from Google Cloud Console
3. **Environment variables** must be set: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`

## Next Phase Readiness
- Auth flow is complete: /login renders, server action initiates OAuth, callback exchanges code, proxy guards /dashboard/*
- Plan 01-04 (App Shell) can proceed: it needs a /dashboard route and the Sidebar component, both of which depend on this auth foundation
- Supabase env vars and Google OAuth credentials must be configured for live testing

---
*Phase: 01-foundation*
*Completed: 2026-03-11*

## Self-Check: PASSED

- FOUND: src/app/login/page.tsx
- FOUND: src/app/login/actions.ts
- FOUND: src/components/auth/google-sign-in-button.tsx
- FOUND: src/app/auth/callback/route.ts
- FOUND: src/proxy.ts
- FOUND: .planning/phases/01-foundation/01-03-SUMMARY.md
- FOUND commit 7c23f30: feat(01-03): login page with Google OAuth sign-in
- FOUND commit 4f184dd: feat(01-03): OAuth callback route and proxy.ts route protection
