---
phase: quick-18
plan: 01
tags: [auth, routing, redirect]

key-files:
  modified:
    - src/app/auth/callback/route.ts
    - src/app/login/page.tsx

duration: 1min
completed: 2026-03-12
---

# Quick Task 18: Default route after login is / not /dashboard

**Changed post-login redirect from /dashboard to / in both auth callback and login page.**

## What Changed

- `auth/callback/route.ts`: `redirectUrl` changed from `${origin}/dashboard` to `origin` (i.e., `/`)
- `login/page.tsx`: authenticated user redirect changed from `redirect('/dashboard')` to `redirect('/')`

## Commit

- `ca65f18`: fix(auth): redirect to / instead of /dashboard after login
