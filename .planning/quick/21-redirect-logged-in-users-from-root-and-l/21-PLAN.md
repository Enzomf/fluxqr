---
phase: quick-21
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/middleware.ts
  - src/app/auth/callback/route.ts
  - src/app/login/page.tsx
autonomous: true
requirements: [QUICK-21]
must_haves:
  truths:
    - "Logged-in user visiting / is redirected to /dashboard"
    - "Logged-in user visiting /login is redirected to /dashboard"
    - "Auth callback after Google OAuth lands on /dashboard"
    - "Unauthenticated users can still access / (public home page)"
    - "Unauthenticated users can still access /login"
  artifacts:
    - path: "src/middleware.ts"
      provides: "Auth-aware redirect for / and /login"
      contains: "redirect.*dashboard"
    - path: "src/app/auth/callback/route.ts"
      provides: "Post-login redirect to /dashboard"
      contains: "/dashboard"
  key_links:
    - from: "src/middleware.ts"
      to: "/dashboard"
      via: "NextResponse.redirect"
      pattern: "redirect.*dashboard"
---

<objective>
Redirect authenticated users from root (/) and login (/login) to /dashboard so they never see the public home or login screen when already signed in.

Purpose: Logged-in users currently land on the public freemium home page after OAuth or when visiting /. They should go straight to the dashboard.
Output: Updated middleware, auth callback, and login page redirect.
</objective>

<execution_context>
@/Users/enzo.figueiredo/.claude/get-shit-done/workflows/execute-plan.md
@/Users/enzo.figueiredo/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/middleware.ts
@src/app/auth/callback/route.ts
@src/app/login/page.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add authenticated-user redirect in middleware and fix callback/login targets</name>
  <files>src/middleware.ts, src/app/auth/callback/route.ts, src/app/login/page.tsx</files>
  <action>
Three changes:

1. **src/middleware.ts** — Expand matcher to include exact `/` and `/login`. Add redirect logic BEFORE the existing dashboard/admin guards:
   - If `pathname === '/' || pathname === '/login'` AND `user` exists, return `NextResponse.redirect(new URL('/dashboard', request.url))`.
   - Keep existing dashboard and admin guards unchanged.
   - Update `config.matcher` to: `['/', '/login', '/dashboard/:path*', '/admin/:path*']`.
   - IMPORTANT: The `/` route is the public freemium home page. Unauthenticated users MUST still reach it (no redirect for them). Only redirect when `user` is truthy.

2. **src/app/auth/callback/route.ts** — Change `const redirectUrl = origin` to `const redirectUrl = origin + '/dashboard'` (line 10). This makes the post-OAuth redirect go directly to dashboard instead of root.

3. **src/app/login/page.tsx** — Change `if (user) redirect('/')` to `if (user) redirect('/dashboard')` (line 14). This fixes the server-side redirect for logged-in users who directly navigate to /login.
  </action>
  <verify>
    <automated>cd /Users/enzo.figueiredo/www/fluxqr && npx tsc --noEmit 2>&1 | head -20</automated>
  </verify>
  <done>
    - Middleware redirects authenticated users from / and /login to /dashboard (302)
    - Unauthenticated users still see public home (/) and login (/login) normally
    - OAuth callback redirects to /dashboard after successful sign-in
    - Login page server-side redirect goes to /dashboard
    - TypeScript compiles without errors
  </done>
</task>

</tasks>

<verification>
- `npx tsc --noEmit` passes
- Middleware matcher includes '/', '/login', '/dashboard/:path*', '/admin/:path*'
- Grep confirms no remaining `redirect('/')` patterns that should be `/dashboard`
</verification>

<success_criteria>
Authenticated users never see the public home page or login page — they are always sent to /dashboard.
Unauthenticated users still access / (freemium home) and /login normally.
</success_criteria>

<output>
After completion, create `.planning/quick/21-redirect-logged-in-users-from-root-and-l/21-SUMMARY.md`
</output>
